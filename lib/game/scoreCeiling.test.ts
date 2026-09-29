/**
 * The score ceiling the leaderboard enforces: it must be a true upper bound on what the game can
 * produce, and the database migration must hold exactly the same numbers.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { calculateRoundScore, maxGameScore, maxRoundScore, minPlayMs, roundsCleared } from './scoreCalculator';
import { CATALOG } from './catalog';
import { BUDGET_CAP_MULTIPLIER, ROUND_CONFIG } from './constants';
import type { FallingItem } from './types';

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

const asItem = (entry: (typeof CATALOG)[number], doubled: boolean, i: number): FallingItem => ({
  id: String(i),
  category: entry.category,
  cost: entry.cost,
  value: doubled ? entry.value * 2 : entry.value,
  x: 0,
  y: 0,
  width: 64,
  height: 64,
  velocityY: 180,
});

describe('maxRoundScore', () => {
  it('matches the worked numbers in the migration comment', () => {
    expect([1, 2, 3].map(maxRoundScore)).toEqual([122987, 111657, 100328]);
  });

  it('is never beaten by any cleared round the rules allow (20,000 random rounds)', () => {
    const random = seeded(2026);
    for (let n = 0; n < 20000; n++) {
      const round = 1 + Math.floor(random() * 3);
      const config = ROUND_CONFIG[round - 1];
      // Any five items, any of them doubled by 2x Score
      const pick = () => CATALOG[Math.floor(random() * CATALOG.length)];
      // Mostly specialist-shaped carts (the highest multiplier) plus fully random ones
      const specialist = random() < 0.5;
      const first = pick();
      const slots = Array.from({ length: 5 }, (_, i) => {
        const entry = specialist && i < 4 ? CATALOG.filter((c) => c.category === first.category)[i % 2] ?? first : pick();
        return asItem(entry, random() < 0.5, i);
      });
      // Any money left up to the Budget Boost cap (including exactly $0), any time left
      const cap = config.budget * BUDGET_CAP_MULTIPLIER;
      const left = random() < 0.2 ? 0 : Math.floor(random() * (cap + 1));
      const time = Math.floor(random() * (config.duration + 1));
      const result = calculateRoundScore(slots, left, config.budget, time, round);
      expect(result.totalScore).toBeLessThanOrEqual(maxRoundScore(round));
    }
  });

  it('comes close to the best case, so it is not uselessly loose', () => {
    // Round 1, money left at the cap, full clock, five doubled TVs (4+ of one aisle: Specialist)
    const tv = CATALOG.find((c) => c.id === 'tv')!;
    const slots = Array.from({ length: 5 }, (_, i) => asItem(tv, true, i));
    const best = calculateRoundScore(slots, 10000, 5000, 35000, 1);
    expect(best.totalScore).toBe(maxRoundScore(1));
  });
});

describe('maxGameScore and minPlayMs', () => {
  it('sums the cleared rounds, plus the 400-point timeout consolation for an unfinished round', () => {
    expect([0, 1, 2, 3].map(maxGameScore)).toEqual([400, 123387, 235044, 334972]);
  });

  it('needs at least four spawn intervals per cleared round', () => {
    expect([0, 1, 2, 3].map(minPlayMs)).toEqual([0, 5600, 9600, 12400]);
  });
});

describe('roundsCleared', () => {
  it('counts every round on a win', () => {
    expect(roundsCleared({ round: 3 })).toBe(3);
  });

  it('counts the rounds before the one that ended the game', () => {
    expect(roundsCleared({ round: 1, failReason: 'bust' })).toBe(0);
    expect(roundsCleared({ round: 2, failReason: 'timeout' })).toBe(1);
    expect(roundsCleared({ round: 3, failReason: 'bust' })).toBe(2);
  });
});

describe('the database migration', () => {
  const dir = fileURLToPath(new URL('../../supabase/migrations/', import.meta.url));
  const file = readdirSync(dir).find((name) => name.endsWith('_thrifty_init.sql'))!;
  const sql = readFileSync(`${dir}${file}`, 'utf8');

  it('holds the same per-rounds score ceilings as the game', () => {
    const match = sql.match(/max_score\s+constant integer\[\] := ARRAY\[([\d,\s]+)\]/);
    expect(match).not.toBeNull();
    expect(match![1].split(',').map((n) => Number(n.trim()))).toEqual([0, 1, 2, 3].map(maxGameScore));
  });

  it('holds the same minimum play times as the game', () => {
    const match = sql.match(/min_play\s+constant integer\[\] := ARRAY\[([\d,\s]+)\]/);
    expect(match).not.toBeNull();
    expect(match![1].split(',').map((n) => Number(n.trim()))).toEqual([0, 1, 2, 3].map(minPlayMs));
  });

  it('caps the score column at the whole-game ceiling', () => {
    expect(sql).toContain(`CHECK (score BETWEEN 0 AND ${maxGameScore(3)})`);
  });
});
