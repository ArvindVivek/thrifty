import { expect, test, type APIRequestContext } from "@playwright/test";
import { adminConfigured, browserUserId, deleteUsers, leftovers, scoresById } from "./supabase-admin";

// Live checks (npm run e2e:live): the deployed site, and the database rules proven against the
// real shared instance with throwaway anonymous users that are deleted afterwards.

const SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const createdUsers: string[] = [];

test.afterAll(async () => {
  if (!adminConfigured()) return;
  await deleteUsers(createdUsers);
  expect(await leftovers(createdUsers)).toEqual({ scores: 0, profiles: 0 });
});

// ---------------------------------------------------------------------------------------------
// The site
// ---------------------------------------------------------------------------------------------

test("every route is 200 and the 404 is themed", async ({ request }) => {
  for (const path of ["/", "/leaderboard", "/robots.txt", "/sitemap.xml", "/manifest.webmanifest", "/opengraph-image", "/icon.svg", "/apple-icon.png"]) {
    expect((await request.get(path)).status(), path).toBe(200);
  }
  const missing = await request.get("/no-such-page");
  expect(missing.status()).toBe(404);
  expect(await missing.text()).toContain("We couldn");
});

test("no secrets in the shipped JavaScript", async ({ page, request }) => {
  const scripts = new Set<string>();
  page.on("response", (r) => {
    if (r.url().includes("/_next/static/") && r.url().endsWith(".js")) scripts.add(r.url());
  });
  await page.goto("/");
  await page.goto("/leaderboard");
  await page.waitForLoadState("networkidle");
  expect(scripts.size).toBeGreaterThan(0);

  const service = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  for (const url of scripts) {
    const body = await (await request.get(url)).text();
    expect(body, url).not.toMatch(/(?<![A-Za-z0-9])sk-(?:proj-|svcacct-|admin-)?[A-Za-z0-9_-]{20,}/);
    expect(body, url).not.toMatch(/sb_secret_[A-Za-z0-9_-]{10,}/);
    expect(body, url).not.toContain("service_role");
    if (service.length > 12) expect(body.includes(service), url).toBe(false);
  }
});

test("round trip: play, save as a throwaway player, see it on the board, then delete it", async ({ page }) => {
  test.skip(!adminConfigured(), "needs the Supabase keys in .env.local");
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

  await page.goto("/");
  await page.getByRole("button", { name: "Start game" }).click();
  await page.getByRole("button", { name: "Start round" }).click();
  // Hands off: round 1 ends in a bust, a timeout, or a lucky clear within 40 seconds
  const cleared = page.getByText("Round 1 cleared");
  const over = page.getByTestId("final-score");
  await expect(over.or(cleared)).toBeVisible({ timeout: 45_000 });
  if (await cleared.isVisible()) {
    await page.getByRole("button", { name: "Start round 2" }).click();
    await expect(over.or(page.getByText("Round 2 cleared"))).toBeVisible({ timeout: 45_000 });
    if (!(await over.isVisible())) {
      await page.getByRole("button", { name: "Start round 3" }).click();
      await expect(over).toBeVisible({ timeout: 45_000 });
    }
  }

  const name = `Live check ${Date.now() % 1000}`;
  await page.getByLabel("Your name on the board").fill(name);
  await page.getByRole("button", { name: "Save my score" }).click();
  await expect(page.getByText(`Saved to the board as “${name}”`)).toBeVisible();
  const userId = await browserUserId(page);
  createdUsers.push(userId!);

  await page.getByRole("button", { name: "Leaderboard" }).click();
  const mine = page.getByTestId("board-row").filter({ hasText: "You" });
  await expect(mine).toContainText(name);
  const id = (await mine.getAttribute("data-entry-id"))!;
  expect((await scoresById([id]))[0]).toMatchObject({ user_id: userId, display_name: name });

  await deleteUsers([userId!]);
  expect(await scoresById([id])).toEqual([]);
  await page.reload();
  expect(errors).toEqual([]);
});

// ---------------------------------------------------------------------------------------------
// The database rules, straight at the API (what a cheater would do)
// ---------------------------------------------------------------------------------------------

async function anonymousPlayer(request: APIRequestContext) {
  const res = await request.post(`${SUPABASE}/auth/v1/signup`, { headers: { apikey: ANON }, data: { data: {} } });
  expect(res.status(), await res.text()).toBe(200);
  const body = await res.json();
  createdUsers.push(body.user.id);
  return { id: body.user.id as string, token: body.access_token as string };
}

function rest(request: APIRequestContext, token: string | null) {
  const headers = {
    apikey: ANON,
    Authorization: `Bearer ${token ?? ANON}`,
    "Content-Profile": "thrifty",
    "Accept-Profile": "thrifty",
    "Content-Type": "application/json",
  };
  return {
    submit: (p: { name: string; score: number; rounds: number; ms: number }) =>
      request.post(`${SUPABASE}/rest/v1/rpc/submit_score`, {
        headers,
        data: { p_display_name: p.name, p_score: p.score, p_rounds_cleared: p.rounds, p_play_ms: p.ms },
      }),
    insert: (row: Record<string, unknown>) => request.post(`${SUPABASE}/rest/v1/scores`, { headers, data: row }),
    get: (query: string) => request.get(`${SUPABASE}/rest/v1/scores?${query}`, { headers }),
    patch: (query: string, row: Record<string, unknown>) =>
      request.patch(`${SUPABASE}/rest/v1/scores?${query}`, { headers: { ...headers, Prefer: "return=representation" }, data: row }),
    del: (query: string) => request.delete(`${SUPABASE}/rest/v1/scores?${query}`, { headers: { ...headers, Prefer: "return=representation" } }),
  };
}

async function reason(res: import("@playwright/test").APIResponse) {
  const body = await res.json().catch(() => ({}));
  return `${res.status()} ${body.code ?? ""} ${body.message ?? ""}`;
}

test.describe("database rules", () => {
  test.skip(!adminConfigured(), "needs the Supabase keys in .env.local");

  test("rejects out-of-bounds and implausible scores", async ({ request }) => {
    const me = await anonymousPlayer(request);
    const api = rest(request, me.token);
    const cases = [
      { what: "above the whole-game ceiling", p: { name: "Cheater", score: 999999, rounds: 3, ms: 90000 }, expect: /scores_score_range|implausible/ },
      { what: "negative", p: { name: "Cheater", score: -5, rounds: 0, ms: 5000 }, expect: /scores_score_range/ },
      { what: "too high for one cleared round", p: { name: "Cheater", score: 200000, rounds: 1, ms: 30000 }, expect: /thrifty:implausible_score/ },
      { what: "a points-only score with no round cleared", p: { name: "Cheater", score: 401, rounds: 0, ms: 5000 }, expect: /thrifty:implausible_score/ },
      { what: "three rounds in one second", p: { name: "Cheater", score: 30000, rounds: 3, ms: 1000 }, expect: /thrifty:implausible_score/ },
      { what: "a fourth round", p: { name: "Cheater", score: 100, rounds: 4, ms: 60000 }, expect: /scores_rounds_cleared_range/ },
    ];
    for (const c of cases) {
      const res = await api.submit(c.p);
      const why = await reason(res);
      test.info().annotations.push({ type: "rejected", description: `${c.what}: ${why}` });
      expect(res.status(), c.what).toBe(400);
      expect(why, c.what).toMatch(c.expect);
    }
  });

  test("rejects bad names", async ({ request }) => {
    const me = await anonymousPlayer(request);
    const api = rest(request, me.token);
    for (const name of ["sh1t", "F.u.c.k", "Big Ass", "<script>", "", "a".repeat(16), "two  spaces", "-dash", "emoji 🙂"]) {
      const res = await api.submit({ name, score: 100, rounds: 0, ms: 5000 });
      const why = await reason(res);
      test.info().annotations.push({ type: "rejected", description: `name ${JSON.stringify(name)}: ${why}` });
      expect(res.status(), name).toBe(400);
      expect(why, name).toMatch(/thrifty:bad_name|scores_display_name/);
    }
  });

  test("rate limits a burst: one score per 10 seconds, even in parallel", async ({ request }) => {
    const me = await anonymousPlayer(request);
    const api = rest(request, me.token);
    const burst = await Promise.all(Array.from({ length: 5 }, (_, i) => api.submit({ name: `Burst ${i}`, score: 100 + i, rounds: 0, ms: 5000 })));
    const statuses = burst.map((r) => r.status());
    const reasons = await Promise.all(burst.map(reason));
    test.info().annotations.push({ type: "burst", description: reasons.join(" | ") });
    expect(statuses.filter((s) => s === 200)).toHaveLength(1);
    expect(reasons.filter((r) => r.includes("thrifty:too_fast"))).toHaveLength(4);

    // And one more right after, in sequence
    const again = await api.submit({ name: "Burst again", score: 100, rounds: 0, ms: 5000 });
    expect(await reason(again)).toContain("thrifty:too_fast");
  });

  test("keeps the board read-only and anonymous", async ({ request }) => {
    const me = await anonymousPlayer(request);
    const api = rest(request, me.token);
    const saved = await api.submit({ name: "Honest", score: 300, rounds: 0, ms: 20000 });
    expect(saved.status()).toBe(200);
    const id = await saved.json();

    // Public columns only: user_id can't be read, by a player or by a visitor
    expect([401, 403]).toContain((await api.get("select=user_id&limit=1")).status());
    expect([401, 403]).toContain((await rest(request, null).get("select=user_id&limit=1")).status());
    expect((await rest(request, null).get(`select=id,display_name,score,created_at&id=eq.${id}`)).status()).toBe(200);

    // Nobody can edit or delete a score, even their own
    const patched = await api.patch(`id=eq.${id}`, { score: 300000 });
    expect([401, 403]).toContain(patched.status());
    const deleted = await api.del(`id=eq.${id}`);
    expect([401, 403]).toContain(deleted.status());
    expect((await scoresById([id]))[0].score).toBe(300);

    // A visitor with no session can't write at all, and nobody can pick their own user_id
    const visitor = await rest(request, null).submit({ name: "Visitor", score: 100, rounds: 0, ms: 5000 });
    expect([401, 403]).toContain(visitor.status());
    const spoof = await api.insert({ display_name: "Spoof", score: 100, rounds_cleared: 0, play_ms: 5000, user_id: "00000000-0000-0000-0000-000000000000" });
    expect([401, 403]).toContain(spoof.status());
  });
});
