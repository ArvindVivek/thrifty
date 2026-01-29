/**
 * Score Calculator with Combo Detection
 *
 * Implements scoring system from REQUIREMENTS.md:
 * - Base score: 500 points per round
 * - Item values: sum of caught items
 * - Budget bonus: remaining budget * 2
 * - Time bonus: remaining seconds * 30
 * - 5 combo multipliers (MULTIPLICATIVE)
 */

import { FallingItem, ItemCategory } from './types';

// Scoring constants
const BASE_SCORE = 500;
const BUDGET_BONUS_MULTIPLIER = 2;
const TIME_BONUS_MULTIPLIER = 30;
const TIMEOUT_SCORE_PER_SLOT = 100;

/**
 * Combo bonus definition
 */
export interface ComboBonus {
  name: string;
  multiplier: number;
}

/**
 * Complete score calculation result
 */
export interface ScoreResult {
  baseScore: number;
  itemValue: number;
  budgetBonus: number;
  timeBonus: number;
  combos: ComboBonus[];
  multiplier: number;
  totalScore: number;
}

/**
 * Detect all triggered combos for the round
 *
 * @param slots - Array of caught items (null for empty slots)
 * @param budgetRemaining - Budget remaining at end of round
 * @param initialBudget - Starting budget for the round
 * @param timeRemaining - Time remaining in milliseconds
 * @returns Array of triggered combos with their multipliers
 */
export function detectCombos(
  slots: (FallingItem | null)[],
  budgetRemaining: number,
  initialBudget: number,
  timeRemaining: number
): ComboBonus[] {
  const combos: ComboBonus[] = [];
  const filledSlots = slots.filter((slot) => slot !== null) as FallingItem[];

  // Perfect Budget: exactly 0 remaining (2.0x)
  if (budgetRemaining === 0 && filledSlots.length > 0) {
    combos.push({ name: 'Perfect Budget', multiplier: 2.0 });
  }

  // Balanced Loadout: 3+ different categories (1.2x)
  const categories = new Set(filledSlots.map((item) => item.category));
  if (categories.size >= 3) {
    combos.push({ name: 'Balanced Loadout', multiplier: 1.2 });
  }

  // Specialist: 4+ items of same category (1.5x)
  const categoryCounts = new Map<ItemCategory, number>();
  filledSlots.forEach((item) => {
    categoryCounts.set(item.category, (categoryCounts.get(item.category) || 0) + 1);
  });
  const maxCategoryCount = Math.max(0, ...Array.from(categoryCounts.values()));
  if (maxCategoryCount >= 4) {
    combos.push({ name: 'Specialist', multiplier: 1.5 });
  }

  // Speed Demon: 15+ seconds remaining (1.3x)
  const secondsRemaining = timeRemaining / 1000;
  if (secondsRemaining >= 15) {
    combos.push({ name: 'Speed Demon', multiplier: 1.3 });
  }

  // Thrifty: 50%+ budget remaining (1.4x)
  const budgetPercentage = budgetRemaining / initialBudget;
  if (budgetPercentage >= 0.5) {
    combos.push({ name: 'Thrifty', multiplier: 1.4 });
  }

  return combos;
}

/**
 * Calculate total score for a completed round
 *
 * @param slots - Array of caught items (null for empty slots)
 * @param budgetRemaining - Budget remaining at end of round
 * @param initialBudget - Starting budget for the round
 * @param timeRemaining - Time remaining in milliseconds
 * @param roundNumber - Current round number (1-5)
 * @param failed - Optional failure reason ('bust' or 'timeout')
 * @returns Complete score breakdown
 */
export function calculateRoundScore(
  slots: (FallingItem | null)[],
  budgetRemaining: number,
  initialBudget: number,
  timeRemaining: number,
  roundNumber: number,
  failed?: 'bust' | 'timeout'
): ScoreResult {
  // Handle failed rounds
  if (failed === 'bust') {
    return {
      baseScore: 0,
      itemValue: 0,
      budgetBonus: 0,
      timeBonus: 0,
      combos: [],
      multiplier: 1.0,
      totalScore: 0,
    };
  }

  if (failed === 'timeout') {
    const filledSlots = slots.filter((slot) => slot !== null);
    return {
      baseScore: 0,
      itemValue: 0,
      budgetBonus: 0,
      timeBonus: 0,
      combos: [],
      multiplier: 1.0,
      totalScore: filledSlots.length * TIMEOUT_SCORE_PER_SLOT,
    };
  }

  // Calculate base components
  const baseScore = BASE_SCORE;
  const itemValue = slots
    .filter((slot) => slot !== null)
    .reduce((sum, item) => sum + (item?.value || 0), 0);
  const budgetBonus = budgetRemaining * BUDGET_BONUS_MULTIPLIER;
  const secondsRemaining = timeRemaining / 1000;
  const timeBonus = secondsRemaining * TIME_BONUS_MULTIPLIER;

  // Detect combos
  const combos = detectCombos(slots, budgetRemaining, initialBudget, timeRemaining);

  // Calculate multiplier (combos stack multiplicatively)
  const multiplier = combos.reduce((mult, combo) => mult * combo.multiplier, 1.0);

  // Calculate total score with multiplier
  const preMultiplierTotal = baseScore + itemValue + budgetBonus + timeBonus;
  const totalScore = Math.round(preMultiplierTotal * multiplier);

  return {
    baseScore,
    itemValue,
    budgetBonus,
    timeBonus,
    combos,
    multiplier,
    totalScore,
  };
}

// Rank thresholds (descending order for lookup)
const RANK_THRESHOLDS = [
  { threshold: 35000, rank: 'S', title: 'Thrift Master' },
  { threshold: 30000, rank: 'A', title: 'Budget Boss' },
  { threshold: 25000, rank: 'B', title: 'Smart Shopper' },
  { threshold: 20000, rank: 'C', title: 'Bargain Hunter' },
  { threshold: 15000, rank: 'D', title: 'Penny Pincher' },
  { threshold: 0, rank: 'F', title: 'Big Spender' },
];

/**
 * Get rank title for a total score
 *
 * @param totalScore - Total game score
 * @returns Rank letter and title
 */
export function getRankTitle(totalScore: number): { rank: string; title: string } {
  const rankData = RANK_THRESHOLDS.find((r) => totalScore >= r.threshold);
  return { rank: rankData!.rank, title: rankData!.title };
}
