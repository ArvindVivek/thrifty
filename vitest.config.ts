import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    // Pure logic runs in node; component and hook tests opt into jsdom with a
    // `// @vitest-environment jsdom` line at the top of the file.
    environment: "node",
    include: ["lib/**/*.test.{ts,tsx}", "components/**/*.test.{ts,tsx}", "hooks/**/*.test.{ts,tsx}", "supabase/**/*.test.ts"],
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    // fileURLToPath, not URL.pathname: the path has a space ("Cloud9 x JetBrains 2026").
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
});
