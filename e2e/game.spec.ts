import { expect, test, type Page } from "@playwright/test";
import { autopilot } from "./bot.mjs";
import { adminConfigured, browserUserId, deleteUsers, leftovers, scoresById } from "./supabase-admin";

// Every console error fails the test, except in the one test that switches Supabase off on
// purpose (there the app logs the failure to the console by design).
function watchConsole(page: Page, allow: RegExp[] = []) {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error" && !allow.some((re) => re.test(m.text()))) errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  return errors;
}

const createdUsers: string[] = [];
const createdScores: string[] = [];

test.afterAll(async () => {
  if (!adminConfigured()) return;
  // Test rows never stay on the board: find every user this run created, delete them (their
  // profile and scores cascade), then prove nothing is left.
  const owners = (await scoresById(createdScores)).map((r) => r.user_id);
  const users = [...new Set([...createdUsers, ...owners])];
  await deleteUsers(users);
  expect(await leftovers(users)).toEqual({ scores: 0, profiles: 0 });
  expect(await scoresById(createdScores)).toEqual([]);
});

test("every route answers", async ({ request }) => {
  for (const path of ["/", "/leaderboard", "/robots.txt", "/sitemap.xml", "/manifest.webmanifest", "/opengraph-image", "/icon.svg", "/apple-icon.png"]) {
    const res = await request.get(path);
    expect(res.status(), path).toBe(200);
  }
  expect((await request.get("/no-such-page")).status()).toBe(404);
  expect(await (await request.get("/sitemap.xml")).text()).toContain("/leaderboard");
});

test("a wrong link gets the themed 404 with a way home", async ({ page }) => {
  const errors = watchConsole(page, [/404 \(Not Found\)/]);
  await page.goto("/no-such-page");
  await expect(page.getByRole("heading", { name: "We couldn't find that page" })).toBeVisible();
  await page.getByRole("link", { name: "Go to the start" }).click();
  await expect(page.getByRole("button", { name: "Start game" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("title screen explains the game and makes no Supabase calls on load", async ({ page }) => {
  const errors = watchConsole(page);
  const supabaseCalls: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("supabase.co")) supabaseCalls.push(r.url());
  });

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Thrifty" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "How to play" })).toBeVisible();
  await expect(page.getByText("Perfect Budget").first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", /\/apps\/thrifty\/privacy$/);
  await expect(page.getByRole("link", { name: "Support" })).toHaveAttribute("href", /\/apps\/thrifty\/support$/);
  await page.waitForLoadState("networkidle");

  // Anonymous sessions are created only when a player saves a score
  expect(supabaseCalls).toEqual([]);
  expect(await page.evaluate(() => localStorage.getItem("thrifty-auth"))).toBeNull();
  // Nothing wider than the screen
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test("the game works with the leaderboard unreachable", async ({ page }) => {
  const errors = watchConsole(page, [/\[leaderboard\]/, /Failed to load resource/]);
  await page.route("**/*.supabase.co/**", (route) => route.abort("internetdisconnected"));

  await page.goto("/leaderboard");
  await expect(page.getByText("The board is taking a break")).toBeVisible();
  await expect(page.getByText("Your game still works")).toBeVisible();

  await page.getByRole("link", { name: "Thrifty" }).click();
  await page.getByRole("button", { name: "Start game" }).click();
  await page.getByRole("button", { name: "Start round" }).click();
  await expect(page.getByTestId("hud-round")).toHaveText("1/3");
  // The clock runs and things fall: the game doesn't wait on the network
  await expect(page.getByTestId("hud-time")).not.toHaveText("35s");
  await expect(page.locator("[data-kind]").first()).toBeAttached();
  expect(errors).toEqual([]);
});

test("play a real game, save the score, see it on the board", async ({ page }, testInfo) => {
  test.skip(!adminConfigured(), "needs .env.local with the Supabase keys (cleanup uses the service role)");
  const errors = watchConsole(page);

  await page.goto("/");
  await page.getByRole("button", { name: "Start game" }).click();
  await expect(page.getByTestId("hud-budget")).toHaveText("$5,000");
  await page.getByRole("button", { name: "Start round" }).click();

  // The autopilot plays round 1 through the real controls (arrow keys) until the cart is full
  const cleared = page.getByText("Round 1 cleared");
  await autopilot(page, { ms: 40_000, until: () => cleared.isVisible() });
  const gameOver = page.getByTestId("final-score");
  if (await cleared.isVisible()) {
    await expect(page.getByTestId("round-score")).toBeVisible();
    await page.getByRole("button", { name: "Start round 2" }).click();
    await expect(page.getByTestId("hud-round")).toHaveText("2/3");
    // Round 2: hands off. It ends in a bust, a timeout or (by luck) a clear.
    await expect(gameOver.or(page.getByText("Round 2 cleared"))).toBeVisible({ timeout: 45_000 });
    if (await page.getByText("Round 2 cleared").isVisible()) {
      await page.getByRole("button", { name: "Start round 3" }).click();
    }
  }
  await expect(gameOver).toBeVisible({ timeout: 45_000 });
  const finalScore = Number((await gameOver.textContent())!.replace(/\D/g, ""));

  // Save it under a name only this run uses
  const name = `E2E ${testInfo.project.name} ${Date.now() % 1000}`.slice(0, 15).trim();
  await page.getByLabel("Your name on the board").fill(name);
  await page.getByRole("button", { name: "Save my score" }).click();
  await expect(page.getByText(`Saved to the board as “${name}”`)).toBeVisible();
  const userId = await browserUserId(page);
  expect(userId).toBeTruthy();
  createdUsers.push(userId!);

  // On the board, marked as yours, dated in the player's own time zone (server runs in UTC)
  await page.getByRole("button", { name: "Leaderboard" }).click();
  const mine = page.getByTestId("board-row").filter({ hasText: "You" });
  await expect(mine).toContainText(name);
  await expect(mine).toContainText(finalScore.toLocaleString("en-US"));
  const today = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "America/Los_Angeles" }).format(new Date());
  await expect(mine.locator("time")).toHaveText(today);
  const id = await mine.getAttribute("data-entry-id");
  createdScores.push(id!);

  // The database has exactly what the game reported, tied to this browser's anonymous user
  const [row] = await scoresById([id!]);
  expect(row).toMatchObject({ user_id: userId, display_name: name, score: finalScore });
  expect(row.play_ms).toBeGreaterThan(0);

  // Back returns to the result, still marked as saved (no double submit)
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByText("Your score is on the board.")).toBeVisible();
  expect(errors).toEqual([]);
});

test("layout: the game fits one screen and touch steering moves the cart", async ({ page, isMobile }) => {
  const errors = watchConsole(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Start game" }).click();
  await page.getByRole("button", { name: "Start round" }).click();
  await expect(page.getByTestId("catcher")).toBeVisible();

  const fits = await page.evaluate(() => ({
    w: document.documentElement.scrollWidth <= window.innerWidth,
    h: document.documentElement.scrollHeight <= window.innerHeight,
  }));
  expect(fits).toEqual({ w: true, h: true });

  // Drag near the left edge of the play area: the cart heads there
  const field = page.getByTestId("playfield");
  const box = (await field.boundingBox())!;
  const before = await page.getByTestId("catcher").evaluate((el) => el.style.transform);
  if (isMobile) {
    await field.dispatchEvent("pointerdown", { clientX: box.x + 10, clientY: box.y + box.height / 2, pointerId: 1, pointerType: "touch", isPrimary: true });
  } else {
    await page.mouse.move(box.x + 10, box.y + box.height / 2);
    await page.mouse.down();
  }
  await page.waitForTimeout(700);
  const after = await page.getByTestId("catcher").evaluate((el) => el.style.transform);
  if (!isMobile) await page.mouse.up();
  const x = (t: string) => Number(/translate3d\(([-\d.]+)px/.exec(t)![1]);
  expect(x(after)).toBeLessThan(x(before) - 100);
  expect(errors).toEqual([]);
});
