/**
 * Item Spawner Unit Tests
 *
 * Testing item spawning system with weighted category selection.
 */

import { createItem, selectWeightedCategory, ItemSpawner, CATEGORY_WEIGHTS, SPAWN_INTERVALS } from '../itemSpawner';
import { ItemCategory } from '../types';
import { CANVAS_WIDTH, ITEM_WIDTH, ITEM_HEIGHT, ITEM_COSTS, ROUND_CONFIG } from '../constants';

describe('selectWeightedCategory', () => {
  it('should return a valid ItemCategory', () => {
    const weights = CATEGORY_WEIGHTS;
    const category = selectWeightedCategory(weights);

    expect(['weapon', 'shield', 'utility', 'premium', 'bonus']).toContain(category);
  });

  it('should always return the category with 100% weight', () => {
    const weights: Record<ItemCategory, number> = {
      weapon: 100,
      shield: 0,
      utility: 0,
      premium: 0,
      bonus: 0,
    };

    for (let i = 0; i < 20; i++) {
      expect(selectWeightedCategory(weights)).toBe('weapon');
    }
  });

  it('should distribute according to weights over many calls', () => {
    const weights = CATEGORY_WEIGHTS;
    const counts: Record<ItemCategory, number> = {
      weapon: 0,
      shield: 0,
      utility: 0,
      premium: 0,
      bonus: 0,
    };

    // Run 1000 times to get statistical distribution
    const iterations = 1000;
    for (let i = 0; i < iterations; i++) {
      const category = selectWeightedCategory(weights);
      counts[category]++;
    }

    // Check that weapon appears roughly 30% (allow 5% variance)
    expect(counts.weapon / iterations).toBeGreaterThan(0.25);
    expect(counts.weapon / iterations).toBeLessThan(0.35);

    // Check that shield appears roughly 25% (allow 5% variance)
    expect(counts.shield / iterations).toBeGreaterThan(0.20);
    expect(counts.shield / iterations).toBeLessThan(0.30);

    // Check that bonus is rare (roughly 5%)
    expect(counts.bonus / iterations).toBeGreaterThan(0.01);
    expect(counts.bonus / iterations).toBeLessThan(0.10);
  });

  it('should handle edge case of single category', () => {
    const weights: Record<ItemCategory, number> = {
      weapon: 0,
      shield: 0,
      utility: 0,
      premium: 0,
      bonus: 1,
    };

    expect(selectWeightedCategory(weights)).toBe('bonus');
  });

  it('should handle all weights zero by returning fallback', () => {
    const weights: Record<ItemCategory, number> = {
      weapon: 0,
      shield: 0,
      utility: 0,
      premium: 0,
      bonus: 0,
    };

    // Should not throw, should return some category
    const result = selectWeightedCategory(weights);
    expect(['weapon', 'shield', 'utility', 'premium', 'bonus']).toContain(result);
  });
});

describe('createItem', () => {
  it('should spawn at valid horizontal position (10%-90% range)', () => {
    for (let i = 0; i < 20; i++) {
      const item = createItem('weapon', 1);

      const minX = CANVAS_WIDTH * 0.1;
      const maxX = CANVAS_WIDTH * 0.9 - ITEM_WIDTH;

      expect(item.x).toBeGreaterThanOrEqual(minX);
      expect(item.x).toBeLessThanOrEqual(maxX);
    }
  });

  it('should spawn above screen (negative y)', () => {
    const item = createItem('weapon', 1);
    expect(item.y).toBe(-ITEM_HEIGHT);
  });

  it('should generate cost within category range for weapon', () => {
    for (let i = 0; i < 20; i++) {
      const item = createItem('weapon', 1);

      expect(item.cost).toBeGreaterThanOrEqual(ITEM_COSTS.weapon.min);
      expect(item.cost).toBeLessThanOrEqual(ITEM_COSTS.weapon.max);
    }
  });

  it('should generate cost within category range for shield', () => {
    for (let i = 0; i < 20; i++) {
      const item = createItem('shield', 1);

      expect(item.cost).toBeGreaterThanOrEqual(ITEM_COSTS.shield.min);
      expect(item.cost).toBeLessThanOrEqual(ITEM_COSTS.shield.max);
    }
  });

  it('should generate cost within category range for utility', () => {
    for (let i = 0; i < 20; i++) {
      const item = createItem('utility', 1);

      expect(item.cost).toBeGreaterThanOrEqual(ITEM_COSTS.utility.min);
      expect(item.cost).toBeLessThanOrEqual(ITEM_COSTS.utility.max);
    }
  });

  it('should generate cost within category range for premium', () => {
    for (let i = 0; i < 20; i++) {
      const item = createItem('premium', 1);

      expect(item.cost).toBeGreaterThanOrEqual(ITEM_COSTS.premium.min);
      expect(item.cost).toBeLessThanOrEqual(ITEM_COSTS.premium.max);
    }
  });

  it('should generate cost within category range for bonus', () => {
    for (let i = 0; i < 20; i++) {
      const item = createItem('bonus', 1);

      expect(item.cost).toBeGreaterThanOrEqual(ITEM_COSTS.bonus.min);
      expect(item.cost).toBeLessThanOrEqual(ITEM_COSTS.bonus.max);
    }
  });

  it('should calculate value based on cost and category multiplier', () => {
    const item = createItem('weapon', 1);

    // Value should be cost * multiplier * random(0.8-1.2)
    // For weapon, multiplier is 1.0
    expect(item.value).toBeGreaterThan(item.cost * 0.75);
    expect(item.value).toBeLessThan(item.cost * 1.25);
  });

  it('should set velocity based on round speed multiplier', () => {
    const item1 = createItem('weapon', 1);
    const item2 = createItem('weapon', 5);

    // Round 5 should be faster than round 1
    expect(item2.velocityY).toBeGreaterThan(item1.velocityY);
  });

  it('should generate unique IDs', () => {
    const item1 = createItem('weapon', 1);
    const item2 = createItem('weapon', 1);

    expect(item1.id).not.toBe(item2.id);
    expect(item1.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  it('should set correct AABB properties', () => {
    const item = createItem('weapon', 1);

    expect(item.width).toBe(ITEM_WIDTH);
    expect(item.height).toBe(ITEM_HEIGHT);
    expect(item.category).toBe('weapon');
  });
});

describe('ItemSpawner', () => {
  it('should return null before spawn interval elapsed', () => {
    const spawner = new ItemSpawner(1);

    // First call at time 0
    const item1 = spawner.update(0, 1);

    // Should spawn first item immediately
    expect(item1).not.toBeNull();

    // Call again at time 500ms (before interval)
    const item2 = spawner.update(500, 1);
    expect(item2).toBeNull();
  });

  it('should spawn item after spawn interval for round 1', () => {
    const spawner = new ItemSpawner(1);

    spawner.update(0, 1); // Initial spawn

    const interval = SPAWN_INTERVALS[0]; // Round 1 = 1200ms
    const item = spawner.update(interval, 1);

    expect(item).not.toBeNull();
    expect(item?.category).toBeDefined();
  });

  it('should spawn item after spawn interval for round 2', () => {
    const spawner = new ItemSpawner(2);

    spawner.update(0, 2); // Initial spawn

    const interval = SPAWN_INTERVALS[1]; // Round 2 = 1000ms
    const item = spawner.update(interval, 2);

    expect(item).not.toBeNull();
  });

  it('should spawn item after spawn interval for round 3', () => {
    const spawner = new ItemSpawner(3);

    spawner.update(0, 3); // Initial spawn

    const interval = SPAWN_INTERVALS[2]; // Round 3 = 900ms
    const item = spawner.update(interval, 3);

    expect(item).not.toBeNull();
  });

  it('should spawn item after spawn interval for round 4', () => {
    const spawner = new ItemSpawner(4);

    spawner.update(0, 4); // Initial spawn

    const interval = SPAWN_INTERVALS[3]; // Round 4 = 800ms
    const item = spawner.update(interval, 4);

    expect(item).not.toBeNull();
  });

  it('should spawn item after spawn interval for round 5', () => {
    const spawner = new ItemSpawner(5);

    spawner.update(0, 5); // Initial spawn

    const interval = SPAWN_INTERVALS[4]; // Round 5 = 700ms
    const item = spawner.update(interval, 5);

    expect(item).not.toBeNull();
  });

  it('should spawn multiple items over time', () => {
    const spawner = new ItemSpawner(1);
    const items: any[] = [];

    const interval = SPAWN_INTERVALS[0];

    for (let i = 0; i < 5; i++) {
      const item = spawner.update(i * interval, 1);
      if (item) {
        items.push(item);
      }
    }

    expect(items.length).toBeGreaterThanOrEqual(4);
  });

  it('should spawn faster in later rounds', () => {
    expect(SPAWN_INTERVALS[4]).toBeLessThan(SPAWN_INTERVALS[0]);
    expect(SPAWN_INTERVALS[3]).toBeLessThan(SPAWN_INTERVALS[1]);
  });
});
