import { loadEnvConfig } from "@next/env";
import { defineConfig, devices } from "@playwright/test";

// Live checks against production (npm run e2e:live). One project, one run: never poll the live
// site (Vercel's bot protection blocks this Mac's IP if you do).
loadEnvConfig(process.cwd());

export default defineConfig({
  testDir: "./e2e",
  testMatch: ["**/live.spec.ts"],
  timeout: 240_000,
  expect: { timeout: 20_000 },
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.LIVE_URL ?? "https://thrifty-kappa.vercel.app",
    timezoneId: "America/Los_Angeles",
    trace: "retain-on-failure",
  },
  projects: [{ name: "live-desktop", use: { ...devices["Desktop Chrome"] } }],
});
