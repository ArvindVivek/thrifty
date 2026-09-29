// A simple autopilot for Thrifty, shared by the e2e suite and the marketing capture: it reads
// the play area from the DOM (item transforms and data attributes) and holds the arrow keys
// to put the cart under the cheapest affordable item that is falling lowest, dodging things it
// can't afford and bad power-ups. It plays real games through the real UI; nothing is faked.

const CATCHER_WIDTH = 88; // lib/game/constants.ts
const ITEM_WIDTH = 64;
const CATCHER_Y = 520;
const CHEAPEST = 300; // the apple

/** Everything the bot needs, read in one evaluate. */
async function look(page) {
  return page.evaluate(() => {
    const at = (el) => {
      const m = /translate3d\(([-\d.]+)px,\s*([-\d.]+)px/.exec(el.style.transform);
      return m ? [Number(m[1]), Number(m[2])] : [0, 0];
    };
    const catcher = document.querySelector('[data-testid="catcher"]');
    if (!catcher) return null;
    const budgetText = document.querySelector('[data-testid="hud-budget"]')?.textContent ?? "$0";
    const cart = document.querySelector('[aria-label^="Your cart:"]')?.getAttribute("aria-label") ?? "";
    return {
      cx: at(catcher)[0],
      budget: Number(budgetText.replace(/[^0-9-]/g, "")),
      filled: Number(/(\d) of 5/.exec(cart)?.[1] ?? 0),
      items: [...document.querySelectorAll("[data-kind]")].map((el) => {
        const [x, y] = at(el);
        return { kind: el.dataset.kind, cost: Number(el.dataset.cost ?? 0), good: el.dataset.good === "1", x, y };
      }),
    };
  });
}

/** Where the cart's left edge should go, or null to stay. */
function plan(view) {
  const remaining = 5 - view.filled;
  const spendable = view.budget - Math.max(0, remaining - 1) * CHEAPEST;
  // Spread the money: aim for about a fair share per slot, never more than is safe
  const fairShare = Math.min(spendable, (view.budget / Math.max(1, remaining)) * 1.3);
  const falling = view.items.filter((i) => i.y < CATCHER_Y - 8);
  const isDanger = (i) => (i.kind === "item" && i.cost > spendable) || (i.kind === "power-up" && !i.good);
  // Danger counts until it has fallen past the cart, not just until it reaches the cart's top
  const danger = view.items.filter((i) => i.y < CATCHER_Y + 64 && isDanger(i));
  const leftEdge = (i) => Math.max(0, Math.min(480 - CATCHER_WIDTH, i.x + ITEM_WIDTH / 2 - CATCHER_WIDTH / 2));
  // Anything dangerous about to reach cart height between here and there blocks the move
  const pathBlocked = (from, to) => {
    const lo = Math.min(from, to);
    const hi = Math.max(from, to) + CATCHER_WIDTH;
    return danger.some((d) => d.y > CATCHER_Y - 220 && d.x < hi && d.x + ITEM_WIDTH > lo);
  };
  // Can the cart get there before the item lands? (cart 400 px/s; items fall 180-400 px/s)
  const reachable = (i) => Math.abs(leftEdge(i) - view.cx) / 400 < (CATCHER_Y - ITEM_WIDTH - i.y) / 300 + 0.15;

  const wanted = falling
    .filter((i) => (i.kind === "item" && i.cost <= fairShare) || (i.kind === "power-up" && i.good))
    .filter(reachable)
    .sort((a, b) => b.y - a.y);
  for (const target of wanted) {
    const x = leftEdge(target);
    if (!pathBlocked(view.cx, x)) return x;
  }
  // Nothing worth catching: get out from under anything dangerous
  if (pathBlocked(view.cx, view.cx)) {
    const escape = [0, 480 - CATCHER_WIDTH, 196].find((x) => !pathBlocked(x, x));
    return escape ?? (view.cx < 200 ? 480 - CATCHER_WIDTH : 0);
  }
  return null;
}

/**
 * Steer until `until()` resolves true or `ms` pass. Returns when done; releases the keys.
 * `page.keyboard` drives the same arrow keys a player uses.
 */
export async function autopilot(page, { ms = 60_000, until = async () => false, tick } = {}) {
  // `tick` advances time between looks: real time by default; the marketing capture passes a
  // fake-clock step (page.clock.runFor) so every frame it shoots is frozen and repeatable.
  const step = tick ?? (() => page.waitForTimeout(30));
  let left = ms; // loop time left, counted in 30 ms steps
  let held = null;
  const hold = async (key) => {
    if (held === key) return;
    if (held) await page.keyboard.up(held);
    if (key) await page.keyboard.down(key);
    held = key;
  };
  try {
    while (left > 0) {
      if (await until()) break;
      const view = await look(page);
      if (!view) {
        await hold(null);
        await step();
        left -= 30;
        continue;
      }
      const target = plan(view);
      if (target === null || Math.abs(target - view.cx) < 6) await hold(null);
      else await hold(target < view.cx ? "ArrowLeft" : "ArrowRight");
      await step();
      left -= 30;
    }
  } finally {
    await hold(null);
  }
}
