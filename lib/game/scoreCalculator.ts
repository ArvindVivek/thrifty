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

import type { FallingItem, ItemCategory } from './types';
import { BUDGET_CAP_MULTIPLIER, ROUND_CONFIG, SLOT_COUNT, TOTAL_ROUNDS } from './constants';
import { MAX_ITEM_COST } from './catalog';

// Scoring constants
const BASE_SCORE = 500;
const BUDGET_BONUS_MULTIPLIER = 2;
const TIME_BONUS_MULTIPLIER = 30;
const TIMEOUT_SCORE_PER_SLOT = 100;

// Combo multipliers (exported so the score ceiling below is computed from the same numbers)
export const COMBO_MULTIPLIERS = {
  perfectBudget: 2.0,
  balanced: 1.2,
  specialist: 1.5,
  speedDemon: 1.3,
  thrifty: 1.4,
} as const;

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
    combos.push({ name: 'Perfect Budget', multiplier: COMBO_MULTIPLIERS.perfectBudget });
  }

  // Balanced Cart: 3+ different categories (1.2x)
  const categories = new Set(filledSlots.map((item) => item.category));
  if (categories.size >= 3) {
    combos.push({ name: 'Balanced Cart', multiplier: COMBO_MULTIPLIERS.balanced });
  }

  // Specialist: 4+ items of same category (1.5x)
  const categoryCounts = new Map<ItemCategory, number>();
  filledSlots.forEach((item) => {
    categoryCounts.set(item.category, (categoryCounts.get(item.category) || 0) + 1);
  });
  const maxCategoryCount = Math.max(0, ...Array.from(categoryCounts.values()));
  if (maxCategoryCount >= 4) {
    combos.push({ name: 'Specialist', multiplier: COMBO_MULTIPLIERS.specialist });
  }

  // Speed Demon: 15+ seconds remaining (1.3x)
  const secondsRemaining = timeRemaining / 1000;
  if (secondsRemaining >= 15) {
    combos.push({ name: 'Speed Demon', multiplier: COMBO_MULTIPLIERS.speedDemon });
  }

  // Thrifty: 50%+ budget remaining (1.4x)
  const budgetPercentage = budgetRemaining / initialBudget;
  if (budgetPercentage >= 0.5) {
    combos.push({ name: 'Thrifty', multiplier: COMBO_MULTIPLIERS.thrifty });
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
 * @param roundNumber - Current round number (1-3)
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

// ============================================================================
// Score ceiling (the leaderboard rejects anything above it)
// ============================================================================

/**
 * An upper bound on one cleared round's score. No real round reaches it; it exists so the
 * database can reject scores the game can't produce (supabase/migrations/*_thrifty_init.sql
 * holds the same numbers, and scoreCalculator.test.ts checks they match).
 *
 * Why it holds:
 * - Item value: at most five items, each worth half its price, each doubled at most once by
 *   2x Score, so at most 5 x the priciest item's cost.
 * - Budget left: at most the Budget Boost cap (2 x the starting budget); the bonus is 2x that.
 * - Time left: at most the whole round.
 * - Multiplier: Perfect Budget ($0 left) and Thrifty (50%+ left) can't both happen, nor can
 *   Balanced (3+ aisles) and Specialist (4+ from one aisle) with five slots. So with $0 left
 *   the best is Perfect x Specialist x Speed Demon, with money left Thrifty x Specialist x
 *   Speed Demon, and the budget bonus only counts in the second case.
 */
export function maxRoundScore(round: number): number {
  const config = ROUND_CONFIG[round - 1];
  const items = SLOT_COUNT * MAX_ITEM_COST;
  const time = (config.duration / 1000) * TIME_BONUS_MULTIPLIER;
  const budget = config.budget * BUDGET_CAP_MULTIPLIER * BUDGET_BONUS_MULTIPLIER;
  const m = COMBO_MULTIPLIERS;

  const nothingLeft = (BASE_SCORE + items + time) * m.perfectBudget * m.specialist * m.speedDemon;
  const moneyLeft = (BASE_SCORE + items + budget + time) * m.thrifty * m.specialist * m.speedDemon;
  return Math.ceil(Math.max(nothingLeft, moneyLeft) - 1e-9);
}

/**
 * The highest total a game can report for how many rounds it cleared: the cleared rounds'
 * ceilings, plus the timeout consolation (100 per filled slot, at most 4) if the game ended
 * in a round it didn't clear.
 */
export function maxGameScore(roundsCleared: number): number {
  let total = 0;
  for (let round = 1; round <= roundsCleared; round++) total += maxRoundScore(round);
  if (roundsCleared < TOTAL_ROUNDS) total += (SLOT_COUNT - 1) * TIMEOUT_SCORE_PER_SLOT;
  return total;
}

/**
 * The least play time a game that cleared `roundsCleared` rounds can have. Clearing a round
 * takes five items, each its own spawn, and spawns come one interval apart, so at least four
 * intervals pass per round.
 */
export function minPlayMs(roundsCleared: number): number {
  let total = 0;
  for (let round = 1; round <= roundsCleared; round++) {
    total += (SLOT_COUNT - 1) * ROUND_CONFIG[round - 1].spawnInterval;
  }
  return total;
}

/**
 * Rounds a finished game cleared: all of them on a win, otherwise every round before the one
 * that ended it (a bust or running out of time).
 */
export function roundsCleared(state: { round: number; failReason?: 'bust' | 'timeout' }): number {
  if (!state.failReason) return Math.min(state.round, TOTAL_ROUNDS);
  return Math.max(0, state.round - 1);
}
