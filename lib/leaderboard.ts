// The leaderboard client: reads the public board and submits a score as an anonymous player.
//
// Everything here fails soft. The game never waits on it and never breaks because of it: a
// missing config, a network error or a timeout comes back as { ok: false, reason } with a
// plain sentence for the player, and the real error goes to the console only.
//
// Rules the database enforces (supabase/migrations/20260929143000_thrifty_init.sql): names are
// 1-15 letters or digits with single spaces, dots, dashes or underscores between them; blocked
// words are refused; a score can't beat the ceiling for the rounds it cleared; one score per
// 10 seconds, 30 a day and 200 in total per player.

import { getSupabase, type AppClient } from "@/lib/kl/supabase/browser";

export interface LeaderboardEntry {
  id: string;
  displayName: string;
  score: number;
  createdAt: string;
}

export type LeaderboardResult =
  | { ok: true; entries: LeaderboardEntry[] }
  | { ok: false; message: string };

export interface ScoreSubmission {
  displayName: string;
  score: number;
  roundsCleared: number;
  playMs: number;
}

export type SubmitFailure =
  | "bad_name"
  | "too_fast"
  | "daily_limit"
  | "row_cap"
  | "implausible"
  | "busy"
  | "unreachable";

export type SubmitResult = { ok: true; id: string } | { ok: false; reason: SubmitFailure; message: string };

export const NAME_MAX_LENGTH = 15;

/** How many rows the board shows. */
export const BOARD_SIZE = 50;

/** Give up on the network after this long, so a dead server can't hang the screen. */
const TIMEOUT_MS = 10_000;

export const UNREACHABLE_MESSAGE =
  "The leaderboard can't be reached right now. Your game still works. Try again in a minute.";

const SUBMIT_MESSAGES: Record<SubmitFailure, string> = {
  bad_name: "That name isn't allowed. Pick a different one.",
  too_fast: "One score every 10 seconds. Wait a moment and try again.",
  daily_limit: "You've saved 30 scores today. Come back tomorrow.",
  row_cap: "This device has saved the most scores it can.",
  implausible: "That score couldn't be saved.",
  busy: "Lots of new players right now. Try again in a few minutes.",
  unreachable: "We couldn't save your score. Check your connection and try again.",
};

/** Names as the database wants them: trimmed, inner whitespace squashed to one space. */
export function normalizeName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

/**
 * The same shape rules as the database's CHECK constraints, so most mistakes are caught before
 * a request. (Blocked words are only checked by the database.)
 */
export function nameProblem(raw: string): string | null {
  const name = normalizeName(raw);
  if (name.length === 0) return "Type a name for the board.";
  if (name.length > NAME_MAX_LENGTH) return `Use ${NAME_MAX_LENGTH} characters or fewer.`;
  if (!/^[A-Za-z0-9]([A-Za-z0-9 _.-]*[A-Za-z0-9])?$/.test(name) || /[ _.-]{2}/.test(name)) {
    return "Use letters and numbers. Spaces, dots, dashes and underscores can go between them.";
  }
  return null;
}

type ErrorLike = { message?: string; code?: string; status?: number; name?: string } | null | undefined;

/** Maps a database or auth error to a reason. Unknown errors count as "unreachable". */
export function submitFailure(error: ErrorLike): SubmitFailure {
  const message = String(error?.message ?? "").toLowerCase();
  if (message.includes("thrifty:bad_name") || message.includes("scores_display_name")) return "bad_name";
  if (message.includes("thrifty:too_fast")) return "too_fast";
  if (message.includes("thrifty:daily_limit")) return "daily_limit";
  if (message.includes("thrifty:row_cap")) return "row_cap";
  if (
    message.includes("thrifty:implausible_score") ||
    message.includes("scores_score_range") ||
    message.includes("scores_play_ms_range") ||
    message.includes("scores_rounds_cleared_range")
  ) {
    return "implausible";
  }
  // Anonymous sign-ins are rate limited per IP by Supabase Auth.
  if (error?.status === 429 || message.includes("rate limit") || message.includes("too many")) return "busy";
  return "unreachable";
}

function fail(reason: SubmitFailure, error?: unknown): SubmitResult {
  if (error !== undefined) console.error("[leaderboard] submit failed:", reason, error);
  return { ok: false, reason, message: SUBMIT_MESSAGES[reason] };
}

/** Top scores, best first (ties: earliest first). */
export async function fetchLeaderboard(
  client: AppClient | null = getSupabase(),
  limit: number = BOARD_SIZE,
): Promise<LeaderboardResult> {
  if (!client) {
    console.error("[leaderboard] Supabase is not configured (NEXT_PUBLIC_SUPABASE_* missing).");
    return { ok: false, message: UNREACHABLE_MESSAGE };
  }
  try {
    const { data, error } = await client
      .from("scores")
      .select("id, display_name, score, created_at")
      .order("score", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(limit)
      .abortSignal(AbortSignal.timeout(TIMEOUT_MS));
    if (error) throw error;
    const rows = (data ?? []) as { id: string; display_name: string; score: number; created_at: string }[];
    return {
      ok: true,
      entries: rows.map((row) => ({
        id: row.id,
        displayName: row.display_name,
        score: row.score,
        createdAt: row.created_at,
      })),
    };
  } catch (error) {
    console.error("[leaderboard] fetch failed:", error);
    return { ok: false, message: UNREACHABLE_MESSAGE };
  }
}

/**
 * Saves a score. The anonymous session is created here, the first time a player submits, and
 * reused after that (never on page load: Supabase limits anonymous sign-ins per IP).
 */
export async function submitScore(
  submission: ScoreSubmission,
  client: AppClient | null = getSupabase(),
): Promise<SubmitResult> {
  if (nameProblem(submission.displayName)) return fail("bad_name");
  if (!client) return fail("unreachable", new Error("Supabase is not configured"));

  try {
    const { data: sessionData } = await client.auth.getSession();
    if (!sessionData.session) {
      const { error } = await client.auth.signInAnonymously();
      if (error) return fail(submitFailure(error), error);
    }

    const { data, error } = await client
      .rpc("submit_score", {
        p_display_name: normalizeName(submission.displayName),
        p_score: Math.max(0, Math.round(submission.score)),
        p_rounds_cleared: submission.roundsCleared,
        p_play_ms: Math.max(0, Math.round(submission.playMs)),
      })
      .abortSignal(AbortSignal.timeout(TIMEOUT_MS));
    if (error) return fail(submitFailure(error), error);
    return { ok: true, id: String(data) };
  } catch (error) {
    return fail("unreachable", error);
  }
}
