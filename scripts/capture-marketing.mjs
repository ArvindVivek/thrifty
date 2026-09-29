#!/usr/bin/env node
// Populated marketing screenshots: a real game played by the autopilot (gameplay, a cleared
// round, the final result) and the leaderboard with sample rows. Same viewports, file layout and
// index.json as kitchenlabs-kit/tools/capture/capture-web.mjs, which can't play a game or stub a
// network call (docs/marketing/capture.json covers the static shots with the kit tool).
//
// The sample leaderboard exists only inside this browser (a Playwright route stub). Nothing is
// ever written to the real board. Saving a score is never clicked.
//
//   node scripts/capture-marketing.mjs [baseUrl]      (default http://127.0.0.1:3187)
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { autopilot } from "../e2e/bot.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const base = (process.argv[2] ?? "http://127.0.0.1:3187").replace(/\/$/, "");
const outRoot = path.join(root, "docs/marketing/web");
const sample = JSON.parse(fs.readFileSync(path.join(root, "docs/marketing/leaderboard-sample.json"), "utf8"));

const VIEWPORTS = {
  desktop: { width: 1440, height: 900, scale: 2, mobile: false },
  phone: { width: 430, height: 932, scale: 3, mobile: true },
};
const THEMES = ["light", "dark"];
const index = [];

async function shoot(page, vpName, name) {
  for (const theme of THEMES) {
    await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
    await page.evaluate(() => document.fonts?.ready);
    const dir = path.join(outRoot, `${vpName}-${theme}`);
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${name}.png`);
    await page.screenshot({ path: file });
    index.push({ viewport: vpName, theme, name, file: path.relative(outRoot, file) });
    console.log("shot", path.relative(root, file));
  }
}

const browser = await chromium.launch();
try {
  for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.scale,
      isMobile: vp.mobile,
      hasTouch: vp.mobile,
      reducedMotion: "reduce", // stable frames
      timezoneId: "America/Los_Angeles",
    });
    // The sample board, for this browser only
    await context.route("**/rest/v1/scores?**", (route) =>
      route.request().method() === "GET"
        ? route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(sample) })
        : route.abort()
    );
    await context.route("**/rest/v1/rpc/**", (route) => route.abort());
    await context.route("**/auth/v1/**", (route) => route.abort());

    const page = await context.newPage();
    // Real time throughout. (A Playwright fake clock froze the game nicely but left motion's
    // entrance animations stuck at opacity 0 on the result screens.)
    const settle = (ms = 1500) => page.waitForTimeout(ms);

    await page.goto(`${base}/`, { waitUntil: "load" });
    await settle(1500);
    await shoot(page, vpName, "01-title");

    await page.getByRole("button", { name: "Start game" }).click();
    await settle(500);
    await page.getByRole("button", { name: "Start round" }).click();

    // Play until the cart has 3 things and a few more are falling: the gameplay shot
    const filled = () => page.locator('[aria-label^="Your cart: 3"]').isVisible();
    await autopilot(page, { ms: 30_000, until: filled });
    await shoot(page, vpName, "02-gameplay");

    // Finish the game, round by round
    let roundShot = false;
    for (let round = 1; round <= 3; round++) {
      const cleared = page.getByText(`Round ${round} cleared`);
      const over = page.getByTestId("final-score");
      await autopilot(page, { ms: 60_000, until: async () => (await cleared.isVisible()) || (await over.isVisible()) });
      if (await over.isVisible()) break;
      if (!roundShot) {
        await settle(2800); // after the confetti
        await shoot(page, vpName, "03-round-complete");
        roundShot = true;
      }
      const next = page.getByRole("button", { name: round < 3 ? `Start round ${round + 1}` : "See results" });
      if (!(await next.isVisible())) break;
      await next.click();
    }
    await page.getByTestId("final-score").waitFor();
    await settle(2800);
    await page.getByLabel("Your name on the board").fill("Penny");
    await page.getByLabel("Your name on the board").blur();
    await shoot(page, vpName, "04-game-over");

    await page.goto(`${base}/leaderboard`, { waitUntil: "load" });
    await page.waitForTimeout(1500);
    await page.getByText("CouponQueen").waitFor();
    await shoot(page, vpName, "05-leaderboard");

    await context.close();
  }
} finally {
  await browser.close();
}
fs.writeFileSync(path.join(outRoot, "index.json"), JSON.stringify(index, null, 2) + "\n");
console.log(`${index.length} screenshots in docs/marketing/web`);
