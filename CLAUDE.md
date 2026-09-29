# Thrifty

An arcade budget game: things fall from the shelves with a price on each; catch five before the
clock runs out without going over budget. Three rounds, a public leaderboard, phone and desktop,
light and dark. Built at the Cloud9 x JetBrains 2026 hackathon; moved onto Kitchen Labs' web
standard (`kitchenlabs-kit/docs/standards/web-release-standard.md`) on 2026-09-29.

- Live: https://thrifty-kappa.vercel.app (Vercel project `thrifty`, scope `arvindviveks-projects`,
  repo ArvindVivek/thrifty, deploys on push to `main`).
- Commit author for this repo: `Arvind Vivekanandan <18371231+ArvindVivek@users.noreply.github.com>`
  (set in the local git config; other emails fail with `COMMIT_AUTHOR_REQUIRED`).
- Brand key `thrifty`, accent "bargain lime" `#A3C614` (palette in `styles/theme.css`, roles in
  `DESIGN.md`).

## Commands

| Command | What |
|---|---|
| `npm run dev` | Dev server on port 3187 |
| `npm run gate` | Kit check, typecheck, eslint (0 warnings), vitest, build, leak-check. Must pass before any push |
| `npm run e2e` | Playwright on the production build (build first): phone + desktop, server TZ=UTC, browser America/Los_Angeles, no console errors. Plays real games through the UI and saves a score to the shared Supabase, then deletes the test users with the service role and proves nothing is left |
| `npm run e2e:live` | Against production: routes, no secrets in the JS, a real round trip, and the database rule proofs (out-of-bounds scores, bad names, bursts, read-only board) with throwaway anonymous users that are deleted after |
| `node scripts/capture-marketing.mjs` | Populated marketing shots into `docs/marketing/web/` (needs `npm run start` on 3187). The sample leaderboard is a route stub inside that browser only |
| `npm run sync` | Re-sync KL Web from kitchenlabs-kit (never edit `components/kl`, `lib/kl`, `styles/kl-tokens.css` here) |

Heavy commands (build, Playwright) go through `kitchenlabs-kit/scripts/kl-slot.sh` on this Mac.
Never poll the live site in a loop (Vercel bot protection blocks the IP); wait with
`vercel inspect <url> --wait`.

## Layout

| Where | What |
|---|---|
| `lib/game/` | Engine (fixed 60 Hz step, `newGame`, touch `targetX`), spawner (injectable random), catalog (20 shop items, 4 aisles; points = half the price), scoring + `maxRoundScore`/`maxGameScore`/`minPlayMs`, power-ups, Penny's lines |
| `components/game/` | `ThriftyGame` → `GameProvider` → `GameContainer` (screen state machine); `GameplayScreen`, `Playfield`, `Hud`, `ResultScreens`, `Leaderboard`, `TitleScreen` |
| `hooks/` | `useKeyboard`, `useGameEngine` (engine created once; pointer target in a ref), `usePenny` |
| `lib/leaderboard.ts` | `fetchLeaderboard`, `submitScore`, name rules, error → plain sentence. Never throws |
| `supabase/migrations/20260929143000_thrifty_init.sql` | Tables, RLS, grants, trigger, `submit_score`. Applied through the Management API |
| `app/` | `/` (the game), `/leaderboard`, icon, OG card, manifest, robots, sitemap, error and 404 |

## Leaderboard (shared Supabase, schema `thrifty`)

- Schema and PostgREST exposure: `kitchenlabs-kit/supabase/migrations/20260929140000_thrifty_schema.sql`
  (the lead's). Tables: this repo's migration. **Never `supabase db push`**; apply with
  `POST https://api.supabase.com/v1/projects/ikjfiytqbqpquyvoskcm/database/query` and the token in
  `kitchenlabs-kit/.env`. The migration is idempotent; re-running it is safe.
- `profiles` (gateway; anonymous players may create their own: Thrifty has no other kind of
  player, a deliberate exception to the "block guest profiles" rule), `scores`, `blocked_words`.
- Public read = column grants: `id, display_name, score, created_at` only. `user_id` is never
  readable by clients. No update or delete by anyone but the service role.
- Writes: `thrifty.submit_score(p_display_name, p_score, p_rounds_cleared, p_play_ms)` as the
  player's anonymous session (created on the first save only, never on page load; kept in
  localStorage `thrifty-auth`). The `scores_before_insert` trigger (SECURITY DEFINER) sets
  `created_at`, refuses blocked names (`thrifty:bad_name`), scores above `maxGameScore(rounds)` or
  faster than `minPlayMs(rounds)` (`thrifty:implausible_score`), and more than 1 per 10 s
  (`thrifty:too_fast`), 30 per 24 h (`thrifty:daily_limit`) or 200 per player (`thrifty:row_cap`),
  under a per-player advisory lock so parallel bursts can't slip through.
- **Scores can't be fully cheat-proof**: the browser computes them. The database only refuses
  what the game can't produce. The ceilings (334,972 for a full game) are loose on purpose: they
  are true upper bounds (`lib/game/scoreCeiling.test.ts` fuzzes 20,000 rounds and checks the SQL
  holds the same numbers).
- The game never waits on Supabase: unreachable or unconfigured → "The board is taking a break".
  supabase-js retries a failed read, so that message takes about 10 s to appear.
- Env (Vercel, all environments, non-sensitive because they're public): `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_SCHEMA=thrifty`. The service-role key is
  only in `.env.local` for e2e cleanup; it is not on Vercel.

## Gotchas (with root causes)

- **Pointer capture ate the "Start round" click.** The play area called `setPointerCapture` on
  every pointerdown, including presses on the round card's button inside it, so the click went to
  the field. Now it ignores presses on buttons and doesn't steer when no handler is given
  (`Playfield.test.tsx`).
- **A Playwright fake clock (`page.clock`) leaves Motion's entrance animations at opacity 0.**
  Only a test artifact (real browsers with or without Reduce Motion are fine); the marketing
  capture runs in real time for that reason.
- **Vercel CLI 56 stores Production/Preview vars as sensitive by default**, which `vercel env pull`
  then reads back as empty. The public Supabase values are added with `--no-sensitive` so they
  can be verified.
- **`vercel link` rewrites `.env.local`** with the project's development env. Re-create it from
  `.env.example` and `kitchenlabs-kit/.env` afterwards.
- jsdom has no `PointerEvent` or `ResizeObserver`; the component tests polyfill them.

## Status (2026-09-29)

See the release report; numbers are refreshed below after each release.

## Regression baseline (captured 2026-09-29, before the web-release work)

Kept as the record of what the hackathon build did. Every rule below still holds, except the
fixed bugs listed under "Known problems" and the portrait field.

Live: https://thrifty-kappa.vercel.app (Vercel project `thrifty`, repo ArvindVivek/thrifty).
Checked with one headless session against production; screenshots in the session scratchpad.

### Routes
| Route | Live | Notes |
|---|---|---|
| `/` | 200 | The whole game is one client page with a screen state machine |

No other routes, no API routes, no `robots`, `sitemap`, `manifest` or OG image.
`<title>` "Thrifty", default create-next-app `favicon.ico`.

### Screens (all on `/`, driven by `gameState.status` in `app/components/GameContainer.tsx`)
| Screen | Works live | What it does |
|---|---|---|
| Title | yes | THRIFTY logo, Start Game, Leaderboard, "arrow keys" hint |
| Ready | yes | The gameplay layout with a "Round 1 / Easy / BEGIN" overlay, budget and time shown |
| Gameplay | yes (desktop) | HUD (round dots, budget meter with +/- popups, timer bar, slots count); left panel (objective, controls, score bonuses, active power-ups); 800x500 play area; loadout of 5 slots; right panel (good and bad power-up legend); Kodee mascot reactions bottom-left |
| Round complete | yes | Score breakdown (base 500, item value, budget bonus, time bonus), combo list, total multiplier, round total, running total, confetti, Next Round |
| Game over | yes | Victory or "Budget bust / Time ran out on Round N", final score, rank letter and title (S 35k+ ... F), name form (1-15 chars, bad-words filter), Play Again, Leaderboard |
| Leaderboard | **broken** | Fetches top 100 from the deleted hackathon Supabase (`fbloukfgdjvwzdgrcnzt`): shows "Failed to fetch leaderboard"; realtime websocket errors in the console |
| Round failed, How to play | unreachable | Components exist but nothing routes to them (a failed round ends the game since commit eb8bb14) |

### Game rules (the regression contract)
- 3 rounds: Easy $5,000 / 35 s, Medium $4,000 / 30 s, Hard $3,000 / 25 s; items fall faster
  (x1, x1.25, x1.5) and spawn more often (1.4 s, 1.0 s, 0.7 s) each round.
- Catch 5 items to clear a round. Catching an item you can't afford is a bust: game over.
  Time running out is game over with 100 points per filled slot.
- Round score = (500 + item value + 2 x budget left + 30 x seconds left) x combo multiplier.
  Combos multiply: Perfect Budget (exactly $0 left) x2.0, Balanced (3+ categories) x1.2,
  Specialist (4+ of one category) x1.5, Speed Demon (15+ s left) x1.3, Thrifty (50%+ budget
  left) x1.4.
- 26% of spawns are power-ups. Good: Slow Motion (5 s), Budget Boost (+$500), Optimal Hint
  (4 s, highlights good buys), Time Freeze (3 s), 2x Score (next catch). Bad: Budget Drain
  (-$300), Speed Up (4 s), Slot Lock (5 s), Point Drain (-200 points).
- Ranks: S 35,000, A 30,000, B 25,000, C 20,000, D 15,000, else F.
- Controls: arrow keys only.

### Known problems at baseline
- Phone: unusable. The layout is a fixed 800 px play area between two fixed side panels, so a
  390 px screen shows the side panel and a sliver of the play area, and there are no touch
  controls.
- Leaderboard dead (above). Anyone could insert any score: the old client posted straight to a
  table with no server-side checks.
- Play Again kept the previous game's total score (`startRound(1)` never reset `totalScore`).
- 2x Score never applied: the effect had a 0 ms duration, so it expired on the next physics
  tick before any catch.
- Third-party art: Valorant weapon and shield images (Riot), the Cloud9 logo, and JetBrains'
  Kodee mascot. None of it is licensed for a Kitchen Labs release.

### Tests at baseline
Jest, 8 files, 140 test cases. **129 ran: 111 pass, 18 fail; 3 of 8 suites fail**:
- `itemSpawner.test.ts`: 17 failures, written for the old category spawner and 5 rounds.
- `GameContext.test.tsx`: 1 failure, expects the old 1000 px canvas.
- `GameContainer.test.tsx`: the suite can't load (`bad-words` ships ESM Jest can't parse), so
  its 11 tests never ran.
