/**
 * Item Spawner Unit Tests
 *
 * Ported from the Jest suite, which described an older spawner (random costs per category,
 * five rounds) and failed 17 of 24 tests against the shipped one. Same intents, against the
 * spawner the game uses: weighted picks from the shop, positions, costs, speeds and timing.
 */

import { describe, expect, it } from 'vitest';
import { createItem, selectRandomItem, ItemSpawner, SPAWN_INTERVALS } from './itemSpawner';
import { CATALOG } from './catalog';
import type { FallingItem, ItemCategory } from './types';
import { CANVAS_WIDTH, ITEM_WIDTH, ITEM_HEIGHT, ITEM_BASE_SPEED, ROUND_CONFIG } from './constants';

/** A small seeded generator (mulberry32), so the "over many calls" tests are deterministic. */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const AISLES: ItemCategory[] = ['snack', 'style', 'home', 'tech'];

describe('selectRandomItem (weighted pick from the shop)', () => {
  it('should return an item from the catalog with a valid aisle', () => {
    const item = selectRandomItem(5000, seeded(1));

    expect(item).not.toBeNull();
    expect(CATALOG).toContainEqual(item);
    expect(AISLES).toContain(item!.category);
  });

  it('should always return the only item that fits the budget', () => {
    // $300 buys exactly one thing: the apple
    for (let i = 0; i < 20; i++) {
      expect(selectRandomItem(300, seeded(i))?.id).toBe('apple');
    }
  });

  it('should favour cheap items over many calls', () => {
    const random = seeded(42);
    const counts = new Map<string, number>();
    const iterations = 5000;
    for (let i = 0; i < iterations; i++) {
      const item = selectRandomItem(5000, random)!;
      counts.set(item.id, (counts.get(item.id) ?? 0) + 1);
    }

    // Weight = (priciest affordable cost - cost + 100): apple 4500 and TV 100 of 63,550
    // total, so about 7.1% and 0.16%
    const share = (id: string) => (counts.get(id) ?? 0) / iterations;
    expect(share('apple')).toBeGreaterThan(0.055);
    expect(share('apple')).toBeLessThan(0.09);
    expect(share('tv')).toBeLessThan(0.01);
    expect(share('apple')).toBeGreaterThan(share('laptop'));
  });

  it('should never pick something the budget cannot cover', () => {
    const random = seeded(7);
    for (let i = 0; i < 500; i++) {
      expect(selectRandomItem(1000, random)!.cost).toBeLessThanOrEqual(1000);
    }
  });

  it('should return null when nothing fits (no crash)', () => {
    expect(selectRandomItem(0, seeded(3))).toBeNull();
    expect(selectRandomItem(299, seeded(3))).toBeNull();
  });
});

describe('createItem', () => {
  it('should spawn at valid horizontal position (10%-90% range)', () => {
    const random = seeded(11);
    for (let i = 0; i < 50; i++) {
      const item = createItem(1, 5000, random)!;

      const minX = CANVAS_WIDTH * 0.1;
      const maxX = CANVAS_WIDTH * 0.9 - ITEM_WIDTH;

      expect(item.x).toBeGreaterThanOrEqual(minX);
      expect(item.x).toBeLessThanOrEqual(maxX);
    }
  });

  it('should spawn above screen (negative y)', () => {
    const item = createItem(1, 5000, seeded(1))!;
    expect(item.y).toBe(-ITEM_HEIGHT);
  });

  it.each(AISLES)('should take its cost and points from the catalog (%s aisle)', (aisle) => {
    const random = seeded(aisle.length * 97);
    let seen = 0;
    for (let i = 0; i < 400; i++) {
      const item = createItem(1, 5000, random)!;
      if (item.category !== aisle) continue;
      seen++;
      const entry = CATALOG.find((c) => c.id === item.itemId)!;
      expect(entry.category).toBe(aisle);
      expect(item.cost).toBe(entry.cost);
      expect(item.value).toBe(entry.value);
      expect(item.itemName).toBe(entry.name);
    }
    expect(seen).toBeGreaterThan(0);
  });

  it('should be worth half its price in points (the balance the scoring assumes)', () => {
    for (const entry of CATALOG) expect(entry.value).toBe(entry.cost / 2);
  });

  it('should set velocity based on round speed multiplier', () => {
    const item1 = createItem(1, 5000, seeded(1))!;
    const item3 = createItem(3, 5000, seeded(1))!;

    expect(item1.velocityY).toBe(ITEM_BASE_SPEED * ROUND_CONFIG[0].speedMultiplier);
    // Round 3 should be faster than round 1
    expect(item3.velocityY).toBeGreaterThan(item1.velocityY);
  });

  it('should generate unique IDs', () => {
    const item1 = createItem(1, 5000)!;
    const item2 = createItem(1, 5000)!;

    expect(item1.id).not.toBe(item2.id);
    expect(item1.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  it('should set correct AABB properties', () => {
    const item = createItem(1, 5000, seeded(5))!;

    expect(item.width).toBe(ITEM_WIDTH);
    expect(item.height).toBe(ITEM_HEIGHT);
    expect(AISLES).toContain(item.category);
  });

  it('should spawn nothing when the budget is empty', () => {
    expect(createItem(1, 0, seeded(1))).toBeNull();
  });
});

describe('ItemSpawner', () => {
  it('should return null before spawn interval elapsed', () => {
    const spawner = new ItemSpawner(1, seeded(1));

    // First call at time 0 - spawns immediately
    const item1 = spawner.update(0, 1);
    expect(item1).not.toBeNull();

    // Call again at time 500ms (before interval) - should not spawn
    const item2 = spawner.update(500, 1);
    expect(item2).toBeNull();

    // Call at the interval - should spawn
    const item3 = spawner.update(SPAWN_INTERVALS[0], 1);
    expect(item3).not.toBeNull();
  });

  it.each([1, 2, 3])('should spawn item after spawn interval for round %i', (round) => {
    const spawner = new ItemSpawner(round, seeded(round));

    spawner.update(0, round); // Initial spawn

    const interval = SPAWN_INTERVALS[round - 1];
    expect(spawner.update(interval - 1, round)).toBeNull();
    const item = spawner.update(interval, round);

    expect(item).not.toBeNull();
    expect(item?.category).toBeDefined();
  });

  it('should use the round table for its intervals', () => {
    expect(SPAWN_INTERVALS).toEqual(ROUND_CONFIG.map((r) => r.spawnInterval));
  });

  it('should only spawn what the current budget covers', () => {
    const spawner = new ItemSpawner(1, seeded(9));
    const item = spawner.update(0, 1, 450);
    expect(item!.cost).toBeLessThanOrEqual(450);
  });

  it('should spawn multiple items over time', () => {
    const spawner = new ItemSpawner(1, seeded(2));
    const items: FallingItem[] = [];

    const interval = SPAWN_INTERVALS[0];

    for (let i = 0; i < 5; i++) {
      const item = spawner.update(i * interval, 1);
      if (item) {
        items.push(item);
      }
    }

    expect(items.length).toBe(5);
  });

  it('should spawn faster in later rounds', () => {
    expect(SPAWN_INTERVALS[2]).toBeLessThan(SPAWN_INTERVALS[1]);
    expect(SPAWN_INTERVALS[1]).toBeLessThan(SPAWN_INTERVALS[0]);
  });
});
