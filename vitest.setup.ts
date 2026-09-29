// toBeInTheDocument() and friends for the component tests (no-ops in node-only files).
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Unmount rendered trees between tests (Jest's RTL did this automatically).
afterEach(() => {
  if (typeof document !== "undefined") cleanup();
});
