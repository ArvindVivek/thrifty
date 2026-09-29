/**
 * Item spawning: picks affordable items from the shop and drops them from the top.
 */

import type { FallingItem } from './types';
import { CANVAS_WIDTH, ITEM_WIDTH, ITEM_HEIGHT, ITEM_BASE_SPEED, ROUND_CONFIG } from './constants';
import { CATALOG, type CatalogItem } from './catalog';

/** A random number in [0, 1). Tests pass a seeded one; the game uses Math.random. */
export type Random = () => number;

/**
 * Spawn intervals for each round (in milliseconds)
 */
export const SPAWN_INTERVALS = ROUND_CONFIG.map((round) => round.spawnInterval);

/**
 * Pick an item that fits the budget. Cheaper items are more common: each item's weight is
 * (priciest affordable cost - its cost + 100).
 */
export function selectRandomItem(maxBudget: number, random: Random = Math.random): CatalogItem | null {
  const affordableItems = CATALOG.filter((item) => item.cost <= maxBudget);

  if (affordableItems.length === 0) return null;

  const maxCost = Math.max(...affordableItems.map((i) => i.cost));
  const weights = affordableItems.map((item) => maxCost - item.cost + 100);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  let roll = random() * totalWeight;
  for (let i = 0; i < affordableItems.length; i++) {
    roll -= weights[i];
    if (roll <= 0) {
      return affordableItems[i];
    }
  }

  return affordableItems[0];
}

/**
 * Create a new falling item
 *
 * @param round - Current round number (1-3)
 * @param currentBudget - Current player budget
 * @returns New falling item entity, or null when nothing in the shop fits the budget
 */
export function createItem(round: number, currentBudget: number, random: Random = Math.random): FallingItem | null {
  const catalogItem = selectRandomItem(currentBudget, random);

  if (!catalogItem) return null;

  // Spawn x position: 10%-90% of canvas width (account for item width)
  const minX = CANVAS_WIDTH * 0.1;
  const maxX = CANVAS_WIDTH * 0.9 - ITEM_WIDTH;
  const x = random() * (maxX - minX) + minX;

  // Calculate velocity based on round
  const roundConfig = ROUND_CONFIG[round - 1] ?? ROUND_CONFIG[0];
  const velocityY = ITEM_BASE_SPEED * roundConfig.speedMultiplier;

  return {
    id: crypto.randomUUID(),
    x,
    y: -ITEM_HEIGHT, // Spawn above screen
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    category: catalogItem.category,
    cost: catalogItem.cost,
    value: catalogItem.value,
    velocityY,
    itemId: catalogItem.id,
    itemName: catalogItem.name,
  };
}

/**
 * Item spawner class
 *
 * Manages spawn timing and rate based on round configuration.
 */
export class ItemSpawner {
  private lastSpawnTime: number = -Infinity; // Allow immediate first spawn
  private spawnInterval: number;

  /**
   * Create new ItemSpawner for specified round
   *
   * @param round - Current round number (1-3)
   */
  constructor(round: number, private random: Random = Math.random) {
    this.spawnInterval = SPAWN_INTERVALS[round - 1] ?? SPAWN_INTERVALS[0];
  }

  /**
   * Returns a new item if the spawn interval has elapsed since the last spawn, else null.
   *
   * @param currentTime - Current game time in milliseconds
   * @param round - Current round number (1-3)
   * @param currentBudget - Current player budget for filtering items
   */
  update(currentTime: number, round: number, currentBudget?: number): FallingItem | null {
    if (currentTime - this.lastSpawnTime >= this.spawnInterval) {
      this.lastSpawnTime = currentTime;

      // Use current budget or a high default
      const budget = currentBudget ?? 5000;
      return createItem(round, budget, this.random);
    }

    return null;
  }
}
