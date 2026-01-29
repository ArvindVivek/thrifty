/**
 * Item spawning system with weighted category selection
 *
 * Handles creation of falling items with proper randomization and timing.
 */

import { FallingItem, ItemCategory } from './types';
import {
  CANVAS_WIDTH,
  ITEM_WIDTH,
  ITEM_HEIGHT,
  ITEM_BASE_SPEED,
  ITEM_COSTS,
  CATEGORY_MULTIPLIERS,
  ROUND_CONFIG,
} from './constants';

/**
 * Drop rate weights for each item category (from REQUIREMENTS.md)
 * - Weapon: 30%
 * - Shield: 25%
 * - Utility: 25%
 * - Premium: 15%
 * - Bonus: 5%
 */
export const CATEGORY_WEIGHTS: Record<ItemCategory, number> = {
  weapon: 30,
  shield: 25,
  utility: 25,
  premium: 15,
  bonus: 5,
};

/**
 * Spawn intervals for each round (in milliseconds)
 * From REQUIREMENTS.md
 */
export const SPAWN_INTERVALS = [1200, 1000, 900, 800, 700] as const;

/**
 * Select item category using weighted random distribution
 *
 * Higher weight = higher probability of selection.
 * Algorithm: Generate random number in [0, totalWeight), subtract weights
 * until random <= 0, return that category.
 *
 * @param weights - Record of category weights
 * @returns Selected category
 */
export function selectWeightedCategory(weights: Record<ItemCategory, number>): ItemCategory {
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);

  // Handle edge case: all weights are zero
  if (totalWeight === 0) {
    return 'weapon'; // Fallback to weapon
  }

  let random = Math.random() * totalWeight;

  for (const [category, weight] of Object.entries(weights) as [ItemCategory, number][]) {
    random -= weight;
    if (random <= 0) {
      return category;
    }
  }

  // Fallback (should never reach here with proper weights)
  return 'weapon';
}

/**
 * Create a new falling item with randomized properties
 *
 * Item spawns:
 * - Horizontally: Between 10%-90% of canvas width (minus item width)
 * - Vertically: Above screen at y = -ITEM_HEIGHT
 * - Cost: Random within category range
 * - Value: cost × category multiplier × random(0.8-1.2)
 * - Velocity: Based on round speed multiplier
 *
 * @param category - Item category
 * @param round - Current round number (1-5)
 * @returns New falling item entity
 */
export function createItem(category: ItemCategory, round: number): FallingItem {
  const costs = ITEM_COSTS[category];

  // Random cost within category range
  const cost = Math.floor(Math.random() * (costs.max - costs.min + 1)) + costs.min;

  // Spawn x position: 10%-90% of canvas width (account for item width)
  const minX = CANVAS_WIDTH * 0.1;
  const maxX = CANVAS_WIDTH * 0.9 - ITEM_WIDTH;
  const x = Math.random() * (maxX - minX) + minX;

  // Calculate value with category multiplier and random variance
  const multiplier = CATEGORY_MULTIPLIERS[category];
  const variance = 0.8 + Math.random() * 0.4; // Random 0.8-1.2
  const value = Math.floor(cost * multiplier * variance);

  // Calculate velocity based on round
  const roundConfig = ROUND_CONFIG[round - 1];
  const velocityY = ITEM_BASE_SPEED * roundConfig.speedMultiplier;

  return {
    id: crypto.randomUUID(),
    x,
    y: -ITEM_HEIGHT, // Spawn above screen
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    category,
    cost,
    value,
    velocityY,
  };
}

/**
 * Item spawner class
 *
 * Manages spawn timing and rate based on round configuration.
 * Spawn rate increases (interval decreases) in later rounds.
 */
export class ItemSpawner {
  private lastSpawnTime: number = -Infinity; // Allow immediate first spawn
  private spawnInterval: number;

  /**
   * Create new ItemSpawner for specified round
   *
   * @param round - Current round number (1-5)
   */
  constructor(round: number) {
    this.spawnInterval = SPAWN_INTERVALS[round - 1];
  }

  /**
   * Update spawner and potentially create new item
   *
   * Returns new item if spawn interval has elapsed since last spawn,
   * otherwise returns null.
   *
   * @param currentTime - Current game time in milliseconds
   * @param round - Current round number (1-5)
   * @returns New item if spawned, null otherwise
   */
  update(currentTime: number, round: number): FallingItem | null {
    if (currentTime - this.lastSpawnTime >= this.spawnInterval) {
      this.lastSpawnTime = currentTime;

      const category = selectWeightedCategory(CATEGORY_WEIGHTS);
      return createItem(category, round);
    }

    return null;
  }
}
