/**
 * AABB (Axis-Aligned Bounding Box) collision detection
 *
 * Functions for detecting collisions between game entities using
 * simple rectangular bounding boxes.
 */

import type { AABB, Catcher, FallingItem } from './types';

/**
 * Check if two AABB boxes are overlapping
 *
 * Uses the standard AABB collision algorithm:
 * Two boxes overlap if they overlap on BOTH axes.
 *
 * @param a First bounding box
 * @param b Second bounding box
 * @returns true if boxes overlap, false otherwise
 */
export function checkAABBCollision(a: AABB, b: AABB): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/**
 * Find all items that are colliding with the catcher
 *
 * @param catcher The player-controlled catcher
 * @param items Array of falling items to check
 * @returns Array of items that overlap with catcher AABB
 */
export function findCollidingItems(catcher: Catcher, items: FallingItem[]): FallingItem[] {
  return items.filter(item => checkAABBCollision(catcher, item));
}

/**
 * Check if an item has fallen completely off the bottom of the screen
 *
 * An item is considered off-screen when its top edge is below the canvas height.
 *
 * @param item The falling item to check
 * @param canvasHeight Height of the game canvas in pixels
 * @returns true if item is completely below canvas, false otherwise
 */
export function isOffScreen(item: FallingItem, canvasHeight: number): boolean {
  return item.y >= canvasHeight;
}
