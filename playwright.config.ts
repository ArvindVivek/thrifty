import { loadEnvConfig } from "@next/env";
import { defineConfig, devices } from "@playwright/test";

// Specs read the same env as the server (Overdraft's lesson: without this the test process
// sees empty values). The cleanup uses SUPABASE_SERVICE_ROLE_KEY from .env.local.
loadEnvConfig(process.cwd());

/** E2E runs against the production build (`npm run build` first). Own port: 3187. */
const PORT = process.env.E2E_PORT ?? "3187";

export default defineConfig({
  testDir: "./e2e",
  testIgnore: ["**/live.spec.ts"],
  timeout: 180_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  // One worker: this Mac is shared, and a Next server plus several browsers at once runs it
  // out of memory (kitchenlabs-kit docs/web/testing.md).
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "retain-on-failure",
    // The server runs in UTC (below); the browser in Los Angeles, so dates must be shown in the
    // player's own zone, not the server's.
    timezoneId: "America/Los_Angeles",
  },
  projects: [
    { name: "phone", use: { ...devices["iPhone 14"], browserName: "chromium" } },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: `npm run start -- --port ${PORT}`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { TZ: "UTC" },
  },
});
