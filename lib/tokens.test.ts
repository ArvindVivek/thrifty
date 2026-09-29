// Measures every text/background pair the kit uses, straight from the CSS files that ship, so
// a token change that breaks 4.5:1 fails the gate instead of shipping (docs/brand/palettes.md).
// Copied from kitchenlabs-kit/web/starter/lib/tokens.test.ts, plus Thrifty's own game colours.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { contrast } from "@/lib/kl/contrast";

const root = fileURLToPath(new URL("..", import.meta.url));
const read = (path: string) => readFileSync(`${root}${path}`, "utf8");

/** `--name: #hex;` declarations inside the first block whose selector is exactly `selector`. */
function block(css: string, selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) return {};
  const body = css.slice(css.indexOf("{", start) + 1, css.indexOf("}", start));
  const vars: Record<string, string> = {};
  for (const m of body.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{3,6})\s*;/g)) vars[m[1]] = m[2];
  return vars;
}

const tokens = read("styles/kl-tokens.css");
const theme = read("styles/theme.css");
const game = read("app/globals.css"); // Thrifty's aisle and play-area colours
const light = { ...block(tokens, ":root"), ...block(theme, ":root"), ...block(game, ":root") };
const dark = {
  ...light,
  ...block(tokens, '[data-theme="dark"]'),
  ...block(theme, '[data-theme="dark"]'),
  ...block(game, '[data-theme="dark"]'),
};

const TEXT_PAIRS: [string, string][] = [
  ["ink", "bg"], ["ink", "surface"], ["ink", "surface-2"],
  ["ink-2", "bg"], ["ink-2", "surface"], ["ink-2", "surface-2"], // secondary text, disabled buttons
  ["accent-text", "bg"], ["accent-text", "surface"], ["accent-text", "accent-soft"],
  ["on-accent", "accent-strong"], // primary button label
  ["ink", "button-secondary"], // secondary button label
  ["success-text", "bg"], ["success-text", "surface"], ["success-text", "success-soft"],
  ["warning-text", "bg"], ["warning-text", "surface"], ["warning-text", "warning-soft"],
  ["danger-text", "bg"], ["danger-text", "surface"], ["danger-text", "danger-soft"],
];

describe.each([
  ["light", light],
  ["dark", dark],
])("%s tokens", (_name, t) => {
  it.each(TEXT_PAIRS)("%s on %s reaches 4.5:1", (fg, bg) => {
    expect(t[fg], `--${fg} missing`).toBeDefined();
    expect(t[bg], `--${bg} missing`).toBeDefined();
    expect(contrast(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5);
  });

  it("danger button label (white) reaches 4.5:1 on its face", () => {
    expect(contrast("#FFFFFF", t["danger-strong"])).toBeGreaterThanOrEqual(4.5);
  });

  it("focus ring (accent-text) reaches 3:1 on bg and surface", () => {
    expect(contrast(t["accent-text"], t.bg)).toBeGreaterThanOrEqual(3);
    expect(contrast(t["accent-text"], t.surface)).toBeGreaterThanOrEqual(3);
  });
});

describe("OnArtPill", () => {
  it("keeps white text at 4.5:1 even over pure white art", () => {
    const blended = Math.round(255 * (1 - 0.55)); // 55% black over white
    const hex = `#${blended.toString(16).padStart(2, "0").repeat(3)}`;
    expect(contrast("#FFFFFF", hex)).toBeGreaterThanOrEqual(4.5);
  });
});

// Thrifty's own pairs. Aisle icons, power-up icons and rings are non-text (3:1); price tags,
// names and HUD numbers are text (4.5:1).
const GAME_NON_TEXT: [string, string][] = [
  ["aisle-snack", "aisle-snack-soft"],
  ["aisle-style", "aisle-style-soft"],
  ["aisle-home", "aisle-home-soft"],
  ["aisle-tech", "aisle-tech-soft"],
  ["success-text", "success-soft"], // good power-up icon
  ["danger-text", "danger-soft"], // bad power-up icon
  ["accent-deep", "field"], // the cart's edge against the play area
];
const GAME_TEXT: [string, string][] = [
  ["ink", "aisle-snack-soft"], // cart slot names on an aisle tile
  ["ink", "aisle-style-soft"],
  ["ink", "aisle-home-soft"],
  ["ink", "aisle-tech-soft"],
  ["ink-2", "aisle-snack-soft"], // cart slot prices
  ["ink-2", "aisle-style-soft"],
  ["ink-2", "aisle-home-soft"],
  ["ink-2", "aisle-tech-soft"],
  ["ink", "field"],
  ["ink", "surface-2"], // price tags sit on --surface; checked above
];

describe.each([
  ["light", light],
  ["dark", dark],
])("%s game colours", (_name, t) => {
  it.each(GAME_NON_TEXT)("%s on %s reaches 3:1", (fg, bg) => {
    expect(t[fg], `--${fg} missing`).toBeDefined();
    expect(t[bg], `--${bg} missing`).toBeDefined();
    expect(contrast(t[fg], t[bg])).toBeGreaterThanOrEqual(3);
  });

  it.each(GAME_TEXT)("%s on %s reaches 4.5:1", (fg, bg) => {
    expect(contrast(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5);
  });
});

describe("the dark olive button label", () => {
  it("reaches 4.5:1 on the lime button face (white would be 1.97:1)", () => {
    expect(contrast(light["on-accent"], light["accent-strong"])).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#FFFFFF", light["accent-strong"])).toBeLessThan(3);
  });
});
