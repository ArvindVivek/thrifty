/**
 * Unit tests for AABB collision detection
 *
 * Tests cover:
 * - checkAABBCollision: overlapping and non-overlapping cases
 * - findCollidingItems: filtering items that collide with catcher
 * - isOffScreen: detecting items that have fallen below canvas
 */

import { checkAABBCollision, findCollidingItems, isOffScreen } from '../collision';
import type { AABB, Catcher, FallingItem } from '../types';

describe('checkAABBCollision', () => {
  describe('overlapping boxes', () => {
    it('should return true when boxes overlap horizontally and vertically', () => {
      const a: AABB = { x: 0, y: 0, width: 50, height: 50 };
      const b: AABB = { x: 25, y: 25, width: 50, height: 50 };
      expect(checkAABBCollision(a, b)).toBe(true);
    });

    it('should return true when one box is completely inside another', () => {
      const a: AABB = { x: 0, y: 0, width: 100, height: 100 };
      const b: AABB = { x: 25, y: 25, width: 20, height: 20 };
      expect(checkAABBCollision(a, b)).toBe(true);
    });

    it('should return true when boxes partially overlap on one edge', () => {
      const a: AABB = { x: 0, y: 0, width: 50, height: 50 };
      const b: AABB = { x: 40, y: 40, width: 50, height: 50 };
      expect(checkAABBCollision(a, b)).toBe(true);
    });
  });

  describe('non-overlapping boxes', () => {
    it('should return false when boxes are separated horizontally', () => {
      const a: AABB = { x: 0, y: 0, width: 50, height: 50 };
      const b: AABB = { x: 100, y: 0, width: 50, height: 50 };
      expect(checkAABBCollision(a, b)).toBe(false);
    });

    it('should return false when boxes are separated vertically', () => {
      const a: AABB = { x: 0, y: 0, width: 50, height: 50 };
      const b: AABB = { x: 0, y: 100, width: 50, height: 50 };
      expect(checkAABBCollision(a, b)).toBe(false);
    });

    it('should return false when boxes are above/below each other', () => {
      const a: AABB = { x: 0, y: 0, width: 50, height: 50 };
      const b: AABB = { x: 100, y: 100, width: 50, height: 50 };
      expect(checkAABBCollision(a, b)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should return false when boxes touch at edge only (right edge)', () => {
      const a: AABB = { x: 0, y: 0, width: 50, height: 50 };
      const b: AABB = { x: 50, y: 0, width: 50, height: 50 };
      expect(checkAABBCollision(a, b)).toBe(false);
    });

    it('should return false when boxes touch at edge only (bottom edge)', () => {
      const a: AABB = { x: 0, y: 0, width: 50, height: 50 };
      const b: AABB = { x: 0, y: 50, width: 50, height: 50 };
      expect(checkAABBCollision(a, b)).toBe(false);
    });

    it('should return false when a box has zero width', () => {
      const a: AABB = { x: 0, y: 0, width: 0, height: 50 };
      const b: AABB = { x: 0, y: 0, width: 50, height: 50 };
      expect(checkAABBCollision(a, b)).toBe(false);
    });

    it('should return false when a box has zero height', () => {
      const a: AABB = { x: 0, y: 0, width: 50, height: 0 };
      const b: AABB = { x: 0, y: 0, width: 50, height: 50 };
      expect(checkAABBCollision(a, b)).toBe(false);
    });

    it('should handle negative coordinates correctly', () => {
      const a: AABB = { x: -50, y: -50, width: 100, height: 100 };
      const b: AABB = { x: 0, y: 0, width: 50, height: 50 };
      expect(checkAABBCollision(a, b)).toBe(true);
    });
  });
});

describe('findCollidingItems', () => {
  const createCatcher = (x: number, y: number): Catcher => ({
    x,
    y,
    width: 80,
    height: 100,
    velocityX: 0,
  });

  const createItem = (id: string, x: number, y: number): FallingItem => ({
    id,
    x,
    y,
    width: 40,
    height: 40,
    category: 'weapon',
    cost: 100,
    value: 10,
    velocityY: 100,
  });

  it('should return empty array when items array is empty', () => {
    const catcher = createCatcher(0, 0);
    const items: FallingItem[] = [];
    expect(findCollidingItems(catcher, items)).toEqual([]);
  });

  it('should return empty array when no items collide', () => {
    const catcher = createCatcher(0, 0);
    const items = [
      createItem('1', 200, 200),
      createItem('2', 300, 300),
    ];
    expect(findCollidingItems(catcher, items)).toEqual([]);
  });

  it('should return single item when one item collides', () => {
    const catcher = createCatcher(100, 100);
    const collidingItem = createItem('1', 110, 110);
    const items = [
      createItem('2', 300, 300),
      collidingItem,
      createItem('3', 500, 500),
    ];
    const result = findCollidingItems(catcher, items);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(collidingItem);
  });

  it('should return multiple items when multiple items collide', () => {
    const catcher = createCatcher(100, 100);
    const item1 = createItem('1', 110, 110);
    const item2 = createItem('2', 120, 120);
    const items = [
      item1,
      item2,
      createItem('3', 500, 500),
    ];
    const result = findCollidingItems(catcher, items);
    expect(result).toHaveLength(2);
    expect(result).toContain(item1);
    expect(result).toContain(item2);
  });

  it('should return all items when all items collide', () => {
    const catcher = createCatcher(100, 100);
    const items = [
      createItem('1', 110, 110),
      createItem('2', 120, 120),
      createItem('3', 105, 105),
    ];
    const result = findCollidingItems(catcher, items);
    expect(result).toHaveLength(3);
  });
});

describe('isOffScreen', () => {
  const createItem = (y: number): FallingItem => ({
    id: '1',
    x: 100,
    y,
    width: 40,
    height: 40,
    category: 'weapon',
    cost: 100,
    value: 10,
    velocityY: 100,
  });

  it('should return false when item is fully visible at top of screen', () => {
    const item = createItem(0);
    expect(isOffScreen(item, 600)).toBe(false);
  });

  it('should return false when item is in middle of screen', () => {
    const item = createItem(300);
    expect(isOffScreen(item, 600)).toBe(false);
  });

  it('should return false when item is partially visible at bottom', () => {
    const item = createItem(580); // bottom edge at 620, partially below canvas
    expect(isOffScreen(item, 600)).toBe(false);
  });

  it('should return true when item is fully below canvas', () => {
    const item = createItem(700); // top edge is below canvas height
    expect(isOffScreen(item, 600)).toBe(true);
  });

  it('should return false when item has negative y coordinate', () => {
    const item = createItem(-50); // item above screen
    expect(isOffScreen(item, 600)).toBe(false);
  });

  it('should return true when item top edge exactly equals canvas height', () => {
    const item = createItem(600); // top edge at canvas height
    expect(isOffScreen(item, 600)).toBe(true);
  });
});
