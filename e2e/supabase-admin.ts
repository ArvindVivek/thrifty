// Test-only cleanup through the service role (server-side key from .env.local; never shipped).
// Deleting the anonymous auth user cascades to thrifty.profiles and thrifty.scores.

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function headers(extra: Record<string, string> = {}) {
  return { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Accept-Profile": "thrifty", "Content-Profile": "thrifty", ...extra };
}

export function adminConfigured() {
  return Boolean(URL && SERVICE);
}

/** Rows (any columns) for the given score ids, read past RLS. */
export async function scoresById(ids: string[]) {
  if (!ids.length) return [];
  const res = await fetch(`${URL}/rest/v1/scores?id=in.(${ids.join(",")})&select=id,user_id,display_name,score,rounds_cleared,play_ms`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error(`scoresById ${res.status}`);
  return (await res.json()) as { id: string; user_id: string; display_name: string; score: number; rounds_cleared: number; play_ms: number }[];
}

/** How many score rows and profiles these users still have. */
export async function leftovers(userIds: string[]) {
  if (!userIds.length) return { scores: 0, profiles: 0 };
  const list = userIds.join(",");
  const [scores, profiles] = await Promise.all([
    fetch(`${URL}/rest/v1/scores?user_id=in.(${list})&select=id`, { headers: headers() }).then((r) => r.json()),
    fetch(`${URL}/rest/v1/profiles?id=in.(${list})&select=id`, { headers: headers() }).then((r) => r.json()),
  ]);
  return { scores: (scores as unknown[]).length, profiles: (profiles as unknown[]).length };
}

/** Deletes auth users (and so their Thrifty profile and scores). Missing users are fine. */
export async function deleteUsers(userIds: string[]) {
  for (const id of new Set(userIds)) {
    const res = await fetch(`${URL}/auth/v1/admin/users/${id}`, { method: "DELETE", headers: headers() });
    if (!res.ok && res.status !== 404) throw new Error(`delete user ${id}: ${res.status}`);
  }
}

/** The anonymous user id the browser signed in as (from supabase-js's saved session). */
export async function browserUserId(page: import("@playwright/test").Page): Promise<string | null> {
  return page.evaluate(() => {
    try {
      const raw = localStorage.getItem("thrifty-auth");
      return raw ? (JSON.parse(raw)?.user?.id ?? null) : null;
    } catch {
      return null;
    }
  });
}
