/**
 * Item spawning system using real Valorant weapons and gear
 *
 * Spawns authentic Valorant items with real prices and images.
 */

import { FallingItem, ItemCategory, ValorantCategory } from './types';
import {
  CANVAS_WIDTH,
  ITEM_WIDTH,
  ITEM_HEIGHT,
  ITEM_BASE_SPEED,
  ROUND_CONFIG,
} from './constants';
import { VALORANT_ITEMS, ValorantItem } from './valorantItems';

/**
 * Map Valorant categories to legacy ItemCategory for compatibility
 */
const VALORANT_TO_LEGACY_CATEGORY: Record<ValorantCategory, ItemCategory> = {
  sidearm: 'utility',
  smg: 'weapon',
  shotgun: 'weapon',
  rifle: 'premium',
  sniper: 'premium',
  heavy: 'weapon',
  shield: 'shield',
};

/**
 * Spawn intervals for each round (in milliseconds)
 */
export const SPAWN_INTERVALS = [1400, 1000, 700] as const;

/**
 * Get items appropriate for current budget with weighted selection
 * Cheaper items are more common, expensive items are rarer
 */
function selectRandomItem(maxBudget: number): ValorantItem | null {
  // Filter items that fit in budget
  const affordableItems = VALORANT_ITEMS.filter(item => item.cost <= maxBudget);

  if (affordableItems.length === 0) return null;

  // Weight by inverse of cost (cheaper items more common)
  const maxCost = Math.max(...affordableItems.map(i => i.cost));
  const weights = affordableItems.map(item => maxCost - item.cost + 100);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  let random = Math.random() * totalWeight;
  for (let i = 0; i < affordableItems.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return affordableItems[i];
    }
  }

  return affordableItems[0];
}

/**
 * Create a new falling Valorant item
 *
 * @param round - Current round number (1-3)
 * @param currentBudget - Current player budget
 * @returns New falling item entity
 */
export function createItem(round: number, currentBudget: number): FallingItem | null {
  const valorantItem = selectRandomItem(currentBudget);

  if (!valorantItem) return null;

  // Spawn x position: 10%-90% of canvas width (account for item width)
  const minX = CANVAS_WIDTH * 0.1;
  const maxX = CANVAS_WIDTH * 0.9 - ITEM_WIDTH;
  const x = Math.random() * (maxX - minX) + minX;

  // Calculate velocity based on round
  const roundConfig = ROUND_CONFIG[round - 1];
  const velocityY = ITEM_BASE_SPEED * roundConfig.speedMultiplier;

  return {
    id: crypto.randomUUID(),
    x,
    y: -ITEM_HEIGHT, // Spawn above screen
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    category: VALORANT_TO_LEGACY_CATEGORY[valorantItem.category],
    cost: valorantItem.cost,
    value: valorantItem.value,
    velocityY,
    // Valorant-specific properties
    itemId: valorantItem.id,
    itemName: valorantItem.name,
    image: valorantItem.image,
    valorantCategory: valorantItem.category,
  };
}

// Legacy function for compatibility
export function selectWeightedCategory(): ItemCategory {
  return 'weapon';
}

/**
 * Item spawner class
 *
 * Manages spawn timing and rate based on round configuration.
 * Spawns real Valorant items based on current budget.
 */
export class ItemSpawner {
  private lastSpawnTime: number = -Infinity; // Allow immediate first spawn
  private spawnInterval: number;

  /**
   * Create new ItemSpawner for specified round
   *
   * @param round - Current round number (1-3)
   */
  constructor(round: number) {
    this.spawnInterval = SPAWN_INTERVALS[round - 1] || SPAWN_INTERVALS[0];
  }

  /**
   * Update spawner and potentially create new item
   *
   * Returns new item if spawn interval has elapsed since last spawn,
   * otherwise returns null.
   *
   * @param currentTime - Current game time in milliseconds
   * @param round - Current round number (1-3)
   * @param currentBudget - Current player budget for filtering items
   * @returns New item if spawned, null otherwise
   */
  update(currentTime: number, round: number, currentBudget?: number): FallingItem | null {
    if (currentTime - this.lastSpawnTime >= this.spawnInterval) {
      this.lastSpawnTime = currentTime;

      // Use current budget or a high default
      const budget = currentBudget ?? 5000;
      return createItem(round, budget);
    }

    return null;
  }
}
