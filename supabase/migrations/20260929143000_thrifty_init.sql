-- Thrifty leaderboard: the profiles gateway, the scores table, and every rule a score must pass.
--
-- What:  thrifty.profiles, thrifty.scores, thrifty.blocked_words; RLS; grants; a validation
--        trigger (name check, plausibility, per-player rate limits, row cap); and the
--        submit_score RPC the web client calls.
-- Why:   the hackathon leaderboard lived on a Supabase project that no longer exists, and it let
--        anyone insert any score. The schema itself (and its PostgREST exposure) was created by
--        kitchenlabs-kit/supabase/migrations/20260929140000_thrifty_schema.sql.
-- Date:  2026-09-29
-- Author: Thrifty web-release agent, for Arvind Vivekanandan
-- Rollback (removes every leaderboard row):
--   DROP FUNCTION IF EXISTS thrifty.submit_score(text, integer, smallint, integer);
--   DROP TABLE IF EXISTS thrifty.scores, thrifty.blocked_words, thrifty.profiles;
--   DROP FUNCTION IF EXISTS thrifty.scores_before_insert(), thrifty.name_is_blocked(text),
--     thrifty.set_updated_at();
--
-- Trust model, stated plainly: the game runs in the browser, so the browser computes the score.
-- The database can't prove a score was earned. It can refuse scores the game could never
-- produce (above the ceiling for the rounds cleared, or faster than the rounds allow), refuse
-- bad names, and slow down anyone scripting submissions. The ceilings below come from
-- lib/game/scoreCalculator.ts (maxGameScore, minPlayMs); scoreCalculator.test.ts fails if the
-- two drift apart.

BEGIN;

-- ---------------------------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------------------------

-- The gateway: a row means "this login has played Thrifty". Players are anonymous Supabase
-- sessions (created only when someone submits a score), so guests are allowed to create one:
-- unlike account apps, Thrifty has no other kind of player.
CREATE TABLE IF NOT EXISTS thrifty.profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NULL CHECK (char_length(display_name) <= 60),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS thrifty.scores (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL DEFAULT auth.uid() REFERENCES thrifty.profiles(id) ON DELETE CASCADE,
  display_name   text NOT NULL,
  score          integer NOT NULL,
  rounds_cleared smallint NOT NULL,
  play_ms        integer NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  -- Names: 1-15 characters, letters and digits, with single spaces, dots, dashes or
  -- underscores between them (the old game allowed 15 characters too).
  CONSTRAINT scores_display_name_length CHECK (char_length(display_name) BETWEEN 1 AND 15),
  CONSTRAINT scores_display_name_charset CHECK (
    display_name ~ '^[A-Za-z0-9]([A-Za-z0-9 _.-]*[A-Za-z0-9])?$' AND display_name !~ '[ _.-]{2}'
  ),
  -- 334972 = maxGameScore(3): the highest total a game that clears all three rounds can report.
  CONSTRAINT scores_score_range CHECK (score BETWEEN 0 AND 334972),
  CONSTRAINT scores_rounds_cleared_range CHECK (rounds_cleared BETWEEN 0 AND 3),
  -- Ten minutes of play is far past any real game (three rounds are 90 seconds of clock).
  CONSTRAINT scores_play_ms_range CHECK (play_ms BETWEEN 0 AND 600000)
);

CREATE INDEX IF NOT EXISTS scores_user_id_created_at_idx ON thrifty.scores (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS scores_score_created_at_idx ON thrifty.scores (score DESC, created_at);

-- Words a display name may not contain. whole_word = true only blocks the word standing alone
-- (or the whole name), so short words don't catch innocent names ("ass" in "Cassie").
CREATE TABLE IF NOT EXISTS thrifty.blocked_words (
  word       text PRIMARY KEY CHECK (word ~ '^[a-z]+$'),
  whole_word boolean NOT NULL DEFAULT false
);

INSERT INTO thrifty.blocked_words (word, whole_word) VALUES
  ('fuck', false), ('fuk', false), ('shit', false), ('cunt', false), ('bitch', false),
  ('nigger', false), ('nigga', false), ('faggot', false), ('whore', false), ('slut', false),
  ('rapist', false), ('nazi', false), ('hitler', false), ('penis', false), ('vagina', false),
  ('dildo', false), ('porn', false), ('bastard', false), ('wank', false), ('twat', false),
  ('kike', false), ('retard', false), ('pussy', false), ('asshole', false), ('jizz', false),
  ('kkk', false), ('boob', false), ('horny', false), ('cock', true), ('dick', true),
  ('ass', true), ('cum', true), ('fag', true), ('tit', true), ('tits', true), ('sex', true),
  ('rape', true), ('anal', true), ('hoe', true), ('spic', true), ('chink', true), ('coon', true)
ON CONFLICT (word) DO NOTHING;

-- ---------------------------------------------------------------------------------------------
-- Functions
-- ---------------------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION thrifty.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- True when the name contains a blocked word. Undoes common digit swaps (0→o, 1→i, 3→e,
-- 4→a, 5→s, 7→t) and ignores separators, so "F.u.c.k" and "sh1t" are caught too.
CREATE OR REPLACE FUNCTION thrifty.name_is_blocked(p_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH n AS (
    SELECT translate(lower(p_name), '013457', 'oieast') AS plain
  ), parts AS (
    SELECT regexp_replace(n.plain, '[^a-z]', '', 'g') AS squashed,
           regexp_split_to_array(trim(regexp_replace(n.plain, '[^a-z]+', ' ', 'g')), ' ') AS words
    FROM n
  )
  SELECT EXISTS (
    SELECT 1
    FROM thrifty.blocked_words b, parts
    WHERE (NOT b.whole_word AND strpos(parts.squashed, b.word) > 0)
       OR (b.whole_word AND (parts.squashed IN (b.word, b.word || 's') OR b.word = ANY (parts.words)
                             OR b.word || 's' = ANY (parts.words)))
  );
$$;

-- Runs before every insert (from the RPC, the REST API or the service role). SECURITY DEFINER
-- so it can count the player's earlier rows (clients can't read user_id). Rejections use
-- P0001 with a stable "thrifty:<reason>" message that the web client maps to plain English.
CREATE OR REPLACE FUNCTION thrifty.scores_before_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  -- Index = rounds_cleared + 1. maxGameScore(0..3) and minPlayMs(0..3) in scoreCalculator.ts.
  max_score constant integer[] := ARRAY[400, 123387, 235044, 334972];
  min_play  constant integer[] := ARRAY[0, 5600, 9600, 12400];
  recent integer;
  today  integer;
  total  integer;
BEGIN
  -- The server decides when a score was set, so nobody can backdate one past the limits.
  NEW.created_at := now();

  IF thrifty.name_is_blocked(NEW.display_name) THEN
    RAISE EXCEPTION 'thrifty:bad_name' USING HINT = 'Pick a different name.';
  END IF;

  IF NEW.rounds_cleared BETWEEN 0 AND 3 AND (
       NEW.score > max_score[NEW.rounds_cleared + 1]
       OR NEW.play_ms < min_play[NEW.rounds_cleared + 1]) THEN
    RAISE EXCEPTION 'thrifty:implausible_score'
      USING HINT = 'That score is higher, or came faster, than the rounds it cleared allow.';
  END IF;

  -- One player's submissions run one at a time, so a burst can't slip past the counts.
  PERFORM pg_advisory_xact_lock(hashtextextended('thrifty.scores:' || NEW.user_id::text, 0));

  SELECT count(*) FILTER (WHERE s.created_at > now() - interval '10 seconds'),
         count(*) FILTER (WHERE s.created_at > now() - interval '24 hours'),
         count(*)
    INTO recent, today, total
    FROM thrifty.scores s
   WHERE s.user_id = NEW.user_id;

  -- 1 per 10 s: the shortest real game (a bust in round 1) takes a few seconds, plus typing a name.
  IF recent >= 1 THEN
    RAISE EXCEPTION 'thrifty:too_fast' USING HINT = 'One score every 10 seconds.';
  END IF;
  -- 30 per rolling day and 200 ever, per player: plenty for play, a wall for scripts.
  IF today >= 30 THEN
    RAISE EXCEPTION 'thrifty:daily_limit' USING HINT = '30 scores a day.';
  END IF;
  IF total >= 200 THEN
    RAISE EXCEPTION 'thrifty:row_cap' USING HINT = '200 scores per player.';
  END IF;

  RETURN NEW;
END;
$$;

-- What the web client calls: joins the player to Thrifty (profile) and saves the score in one
-- transaction. SECURITY INVOKER, so RLS applies and user_id comes from auth.uid().
CREATE OR REPLACE FUNCTION thrifty.submit_score(
  p_display_name   text,
  p_score          integer,
  p_rounds_cleared smallint,
  p_play_ms        integer
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  new_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'thrifty:not_signed_in';
  END IF;

  INSERT INTO thrifty.profiles (id) VALUES (auth.uid()) ON CONFLICT (id) DO NOTHING;

  INSERT INTO thrifty.scores (display_name, score, rounds_cleared, play_ms)
  VALUES (p_display_name, p_score, p_rounds_cleared, p_play_ms)
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

-- ---------------------------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------------------------

DROP TRIGGER IF EXISTS profiles_set_updated_at ON thrifty.profiles;
CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON thrifty.profiles
  FOR EACH ROW EXECUTE FUNCTION thrifty.set_updated_at();

DROP TRIGGER IF EXISTS scores_before_insert ON thrifty.scores;
CREATE TRIGGER scores_before_insert
  BEFORE INSERT ON thrifty.scores
  FOR EACH ROW EXECUTE FUNCTION thrifty.scores_before_insert();

-- ---------------------------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------------------------

ALTER TABLE thrifty.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE thrifty.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE thrifty.blocked_words ENABLE ROW LEVEL SECURITY; -- no policies: definer functions only

DROP POLICY IF EXISTS profiles_select_own ON thrifty.profiles;
CREATE POLICY profiles_select_own ON thrifty.profiles
  FOR SELECT TO authenticated
  USING (id = (select auth.uid()));

DROP POLICY IF EXISTS profiles_insert_own ON thrifty.profiles;
CREATE POLICY profiles_insert_own ON thrifty.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = (select auth.uid()));

-- The board is public. Column grants (below) limit what anyone can read to id, display name,
-- score and date: never user_id, so rows can't be tied to a player.
DROP POLICY IF EXISTS scores_select_public ON thrifty.scores;
CREATE POLICY scores_select_public ON thrifty.scores
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS scores_insert_own ON thrifty.scores;
CREATE POLICY scores_insert_own ON thrifty.scores
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = (select auth.uid())
    AND EXISTS (SELECT 1 FROM thrifty.profiles p WHERE p.id = (select auth.uid()))
  );

-- No update or delete policies: a score can't be edited or removed by a player. Account
-- deletion (auth.users) cascades through profiles to scores.

-- ---------------------------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------------------------

REVOKE ALL ON thrifty.profiles, thrifty.scores, thrifty.blocked_words FROM PUBLIC, anon, authenticated;

GRANT SELECT, INSERT ON thrifty.profiles TO authenticated;
GRANT SELECT (id, display_name, score, created_at) ON thrifty.scores TO anon, authenticated;
GRANT INSERT (display_name, score, rounds_cleared, play_ms) ON thrifty.scores TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA thrifty TO service_role;

REVOKE ALL ON FUNCTION thrifty.submit_score(text, integer, smallint, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION thrifty.submit_score(text, integer, smallint, integer) TO authenticated, service_role;
REVOKE ALL ON FUNCTION thrifty.name_is_blocked(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION thrifty.scores_before_insert() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION thrifty.set_updated_at() FROM PUBLIC, anon, authenticated;

COMMIT;

NOTIFY pgrst, 'reload schema';
