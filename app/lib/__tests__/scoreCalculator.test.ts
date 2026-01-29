/**
 * Score Calculator Tests (TDD RED Phase)
 *
 * Tests for score calculation with combo detection system.
 * Following REQUIREMENTS.md scoring specifications exactly.
 */

import {
  calculateRoundScore,
  detectCombos,
  getRankTitle,
  ComboBonus,
  ScoreResult,
} from '../scoreCalculator';
import { FallingItem } from '../types';

// Helper to create mock items
const createMockItem = (
  id: string,
  category: FallingItem['category'],
  cost: number,
  value: number
): FallingItem => ({
  id,
  category,
  cost,
  value,
  x: 0,
  y: 0,
  width: 40,
  height: 40,
  velocityY: 150,
});

describe('scoreCalculator', () => {
  describe('calculateRoundScore - Base Scoring', () => {
    it('should calculate base score of 500 for empty slots', () => {
      const slots: (FallingItem | null)[] = [null, null, null, null, null];
      const result = calculateRoundScore(slots, 400, 1000, 10000, 1); // 40% budget, 10s time (no combos)

      expect(result.baseScore).toBe(500);
      expect(result.itemValue).toBe(0);
      expect(result.budgetBonus).toBe(800); // 400 * 2
      expect(result.timeBonus).toBe(300); // 10s * 30
      expect(result.combos).toHaveLength(0);
      expect(result.multiplier).toBe(1.0);
      expect(result.totalScore).toBe(500 + 0 + 800 + 300);
    });

    it('should calculate item values correctly', () => {
      const slots: (FallingItem | null)[] = [
        createMockItem('1', 'weapon', 100, 250),
        createMockItem('2', 'shield', 80, 200),
        createMockItem('3', 'utility', 50, 150),
        null,
        null,
      ];
      const result = calculateRoundScore(slots, 1000 - 230, 1000, 30000, 1);

      expect(result.itemValue).toBe(250 + 200 + 150); // 600
      expect(result.budgetBonus).toBe((1000 - 230) * 2); // 1540
      expect(result.baseScore).toBe(500);
    });

    it('should calculate budget bonus correctly', () => {
      const slots: (FallingItem | null)[] = [null, null, null, null, null];
      const result = calculateRoundScore(slots, 500, 1000, 30000, 1);

      expect(result.budgetBonus).toBe(500 * 2); // 1000
    });

    it('should calculate time bonus correctly', () => {
      const slots: (FallingItem | null)[] = [null, null, null, null, null];
      const result = calculateRoundScore(slots, 1000, 1000, 20000, 1); // 20 seconds

      expect(result.timeBonus).toBe(20 * 30); // 600
    });
  });

  describe('detectCombos - Individual Combos', () => {
    it('should detect Perfect Budget combo (exactly 0 remaining)', () => {
      const slots: (FallingItem | null)[] = [
        createMockItem('1', 'weapon', 100, 250),
        createMockItem('2', 'weapon', 100, 250),
        createMockItem('3', 'weapon', 100, 250),
        createMockItem('4', 'weapon', 100, 250),
        createMockItem('5', 'weapon', 100, 250),
      ];
      const combos = detectCombos(slots, 0, 500, 30000);

      expect(combos).toContainEqual({
        name: 'Perfect Budget',
        multiplier: 2.0,
      });
    });

    it('should detect Balanced Loadout combo (3+ categories)', () => {
      const slots: (FallingItem | null)[] = [
        createMockItem('1', 'weapon', 100, 250),
        createMockItem('2', 'shield', 80, 200),
        createMockItem('3', 'utility', 50, 150),
        null,
        null,
      ];
      const combos = detectCombos(slots, 500, 1000, 30000);

      expect(combos).toContainEqual({
        name: 'Balanced Loadout',
        multiplier: 1.2,
      });
    });

    it('should detect Specialist combo (4+ same category)', () => {
      const slots: (FallingItem | null)[] = [
        createMockItem('1', 'weapon', 100, 250),
        createMockItem('2', 'weapon', 100, 250),
        createMockItem('3', 'weapon', 100, 250),
        createMockItem('4', 'weapon', 100, 250),
        null,
      ];
      const combos = detectCombos(slots, 500, 1000, 30000);

      expect(combos).toContainEqual({
        name: 'Specialist',
        multiplier: 1.5,
      });
    });

    it('should detect Speed Demon combo (15+ seconds remaining)', () => {
      const slots: (FallingItem | null)[] = [
        createMockItem('1', 'weapon', 100, 250),
        null,
        null,
        null,
        null,
      ];
      const combos = detectCombos(slots, 500, 1000, 15000); // exactly 15 seconds

      expect(combos).toContainEqual({
        name: 'Speed Demon',
        multiplier: 1.3,
      });
    });

    it('should detect Thrifty combo (50%+ budget remaining)', () => {
      const slots: (FallingItem | null)[] = [
        createMockItem('1', 'weapon', 100, 250),
        null,
        null,
        null,
        null,
      ];
      const combos = detectCombos(slots, 500, 1000, 30000); // exactly 50%

      expect(combos).toContainEqual({
        name: 'Thrifty',
        multiplier: 1.4,
      });
    });
  });

  describe('calculateRoundScore - Combo Multipliers', () => {
    it('should apply Perfect Budget 2.0x multiplier', () => {
      const slots: (FallingItem | null)[] = [
        createMockItem('1', 'weapon', 500, 250),
        null,
        null,
        null,
        null,
      ];
      const result = calculateRoundScore(slots, 0, 500, 0, 1);

      expect(result.combos).toContainEqual({
        name: 'Perfect Budget',
        multiplier: 2.0,
      });
      expect(result.multiplier).toBe(2.0);
      expect(result.totalScore).toBe((500 + 250 + 0 + 0) * 2.0);
    });

    it('should apply Balanced Loadout 1.2x multiplier', () => {
      const slots: (FallingItem | null)[] = [
        createMockItem('1', 'weapon', 100, 250),
        createMockItem('2', 'shield', 80, 200),
        createMockItem('3', 'utility', 50, 150),
        null,
        null,
      ];
      const result = calculateRoundScore(slots, 400, 1000, 0, 1); // 40% budget (below 50% threshold)

      expect(result.combos).toContainEqual({
        name: 'Balanced Loadout',
        multiplier: 1.2,
      });
      expect(result.multiplier).toBe(1.2);
    });

    it('should apply Specialist 1.5x multiplier', () => {
      const slots: (FallingItem | null)[] = [
        createMockItem('1', 'weapon', 100, 250),
        createMockItem('2', 'weapon', 100, 250),
        createMockItem('3', 'weapon', 100, 250),
        createMockItem('4', 'weapon', 100, 250),
        null,
      ];
      const result = calculateRoundScore(slots, 400, 1000, 0, 1); // 40% budget (below 50% threshold)

      expect(result.combos).toContainEqual({
        name: 'Specialist',
        multiplier: 1.5,
      });
      expect(result.multiplier).toBe(1.5);
    });

    it('should stack multiple combos multiplicatively', () => {
      // Perfect Budget (2.0x) + Balanced Loadout (1.2x) = 2.4x
      const slots: (FallingItem | null)[] = [
        createMockItem('1', 'weapon', 200, 250),
        createMockItem('2', 'shield', 200, 200),
        createMockItem('3', 'utility', 200, 150),
        createMockItem('4', 'premium', 200, 400),
        createMockItem('5', 'bonus', 200, 100),
      ];
      const result = calculateRoundScore(slots, 0, 1000, 0, 1);

      expect(result.combos).toHaveLength(2);
      expect(result.multiplier).toBeCloseTo(2.4, 2); // 2.0 * 1.2
      const baseTotal = 500 + 250 + 200 + 150 + 400 + 100;
      expect(result.totalScore).toBeCloseTo(baseTotal * 2.4, 0);
    });

    it('should stack three combos multiplicatively', () => {
      // Perfect Budget (2.0x) + Speed Demon (1.3x) + Specialist (1.5x) = 3.9x
      const slots: (FallingItem | null)[] = [
        createMockItem('1', 'weapon', 200, 250),
        createMockItem('2', 'weapon', 200, 250),
        createMockItem('3', 'weapon', 200, 250),
        createMockItem('4', 'weapon', 200, 250),
        createMockItem('5', 'weapon', 200, 250),
      ];
      const result = calculateRoundScore(slots, 0, 1000, 15000, 1);

      expect(result.combos).toHaveLength(3);
      expect(result.multiplier).toBeCloseTo(3.9, 2); // 2.0 * 1.3 * 1.5
    });
  });

  describe('calculateRoundScore - Failed Rounds', () => {
    it('should return 0 for budget bust', () => {
      const slots: (FallingItem | null)[] = [
        createMockItem('1', 'weapon', 100, 250),
        createMockItem('2', 'weapon', 100, 250),
        null,
        null,
        null,
      ];
      const result = calculateRoundScore(slots, -50, 1000, 30000, 1, 'bust');

      expect(result.totalScore).toBe(0);
      expect(result.baseScore).toBe(0);
      expect(result.itemValue).toBe(0);
      expect(result.budgetBonus).toBe(0);
      expect(result.timeBonus).toBe(0);
      expect(result.combos).toHaveLength(0);
      expect(result.multiplier).toBe(1.0);
    });

    it('should return 100 per filled slot for timeout', () => {
      const slots: (FallingItem | null)[] = [
        createMockItem('1', 'weapon', 100, 250),
        createMockItem('2', 'shield', 80, 200),
        createMockItem('3', 'utility', 50, 150),
        null,
        null,
      ];
      const result = calculateRoundScore(slots, 500, 1000, 0, 1, 'timeout');

      expect(result.totalScore).toBe(300); // 3 filled slots * 100
    });

    it('should return 100 per filled slot for all 5 slots timeout', () => {
      const slots: (FallingItem | null)[] = [
        createMockItem('1', 'weapon', 100, 250),
        createMockItem('2', 'shield', 80, 200),
        createMockItem('3', 'utility', 50, 150),
        createMockItem('4', 'premium', 200, 400),
        createMockItem('5', 'bonus', 0, 100),
      ];
      const result = calculateRoundScore(slots, 500, 1000, 0, 1, 'timeout');

      expect(result.totalScore).toBe(500); // 5 filled slots * 100
    });
  });

  describe('getRankTitle', () => {
    it('should return S rank for 35000+', () => {
      expect(getRankTitle(35000)).toEqual({
        rank: 'S',
        title: 'Thrift Master',
      });
      expect(getRankTitle(50000)).toEqual({
        rank: 'S',
        title: 'Thrift Master',
      });
    });

    it('should return A rank for 30000-34999', () => {
      expect(getRankTitle(30000)).toEqual({
        rank: 'A',
        title: 'Budget Boss',
      });
      expect(getRankTitle(34999)).toEqual({
        rank: 'A',
        title: 'Budget Boss',
      });
    });

    it('should return B rank for 25000-29999', () => {
      expect(getRankTitle(25000)).toEqual({
        rank: 'B',
        title: 'Smart Shopper',
      });
      expect(getRankTitle(29999)).toEqual({
        rank: 'B',
        title: 'Smart Shopper',
      });
    });

    it('should return C rank for 20000-24999', () => {
      expect(getRankTitle(20000)).toEqual({
        rank: 'C',
        title: 'Bargain Hunter',
      });
      expect(getRankTitle(24999)).toEqual({
        rank: 'C',
        title: 'Bargain Hunter',
      });
    });

    it('should return D rank for 15000-19999', () => {
      expect(getRankTitle(15000)).toEqual({
        rank: 'D',
        title: 'Penny Pincher',
      });
      expect(getRankTitle(19999)).toEqual({
        rank: 'D',
        title: 'Penny Pincher',
      });
    });

    it('should return F rank for 0-14999', () => {
      expect(getRankTitle(0)).toEqual({
        rank: 'F',
        title: 'Big Spender',
      });
      expect(getRankTitle(14999)).toEqual({
        rank: 'F',
        title: 'Big Spender',
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle all null slots', () => {
      const slots: (FallingItem | null)[] = [null, null, null, null, null];
      const result = calculateRoundScore(slots, 1000, 1000, 45000, 1);

      expect(result.baseScore).toBe(500);
      expect(result.itemValue).toBe(0);
      expect(result.totalScore).toBeGreaterThan(0);
    });

    it('should handle 0 budget remaining with items', () => {
      const slots: (FallingItem | null)[] = [
        createMockItem('1', 'weapon', 1000, 250),
        null,
        null,
        null,
        null,
      ];
      const result = calculateRoundScore(slots, 0, 1000, 30000, 1);

      expect(result.budgetBonus).toBe(0);
      expect(result.combos).toContainEqual({
        name: 'Perfect Budget',
        multiplier: 2.0,
      });
    });

    it('should handle 0 time remaining', () => {
      const slots: (FallingItem | null)[] = [
        createMockItem('1', 'weapon', 100, 250),
        null,
        null,
        null,
        null,
      ];
      const result = calculateRoundScore(slots, 500, 1000, 0, 1);

      expect(result.timeBonus).toBe(0);
    });

    it('should not detect Thrifty with 49% budget remaining', () => {
      const slots: (FallingItem | null)[] = [
        createMockItem('1', 'weapon', 100, 250),
        null,
        null,
        null,
        null,
      ];
      const combos = detectCombos(slots, 490, 1000, 30000); // 49%

      expect(combos).not.toContainEqual(
        expect.objectContaining({ name: 'Thrifty' })
      );
    });

    it('should not detect Speed Demon with 14 seconds remaining', () => {
      const slots: (FallingItem | null)[] = [
        createMockItem('1', 'weapon', 100, 250),
        null,
        null,
        null,
        null,
      ];
      const combos = detectCombos(slots, 500, 1000, 14000); // 14 seconds

      expect(combos).not.toContainEqual(
        expect.objectContaining({ name: 'Speed Demon' })
      );
    });

    it('should not detect Specialist with only 3 same category', () => {
      const slots: (FallingItem | null)[] = [
        createMockItem('1', 'weapon', 100, 250),
        createMockItem('2', 'weapon', 100, 250),
        createMockItem('3', 'weapon', 100, 250),
        null,
        null,
      ];
      const combos = detectCombos(slots, 500, 1000, 30000);

      expect(combos).not.toContainEqual(
        expect.objectContaining({ name: 'Specialist' })
      );
    });

    it('should not detect Balanced Loadout with only 2 categories', () => {
      const slots: (FallingItem | null)[] = [
        createMockItem('1', 'weapon', 100, 250),
        createMockItem('2', 'weapon', 100, 250),
        createMockItem('3', 'shield', 80, 200),
        null,
        null,
      ];
      const combos = detectCombos(slots, 500, 1000, 30000);

      expect(combos).not.toContainEqual(
        expect.objectContaining({ name: 'Balanced Loadout' })
      );
    });
  });
});
