import { describe, expect, it } from 'vitest';
import { EXPENSIVE_THRESHOLD, GOOD_GAME_SCORE, POWER_UP_EFFECTS, POWER_UP_NAMES, pennyLineFor, pennyVerdict } from './penny';
import { POWER_UPS } from './powerUps';
import type { FallingItem, PowerUpType } from './types';

const item = (cost: number): FallingItem => ({
  id: 'x',
  category: 'snack',
  cost,
  value: cost / 2,
  x: 0,
  y: 0,
  width: 64,
  height: 64,
  velocityY: 0,
});

describe('pennyLineFor', () => {
  it('cheers a cheap catch and teases an expensive one', () => {
    expect(pennyLineFor({ type: 'item_caught', item: item(EXPENSIVE_THRESHOLD - 1), slotIndex: 0 })?.text).toBe("That's thrifty!");
    expect(pennyLineFor({ type: 'item_caught', item: item(EXPENSIVE_THRESHOLD), slotIndex: 0 })?.text).toBe('Big spender...');
  });

  it.each(Object.keys(POWER_UPS) as PowerUpType[])('explains the %s power-up with its tone', (type) => {
    const line = pennyLineFor({ type: 'power_up_activated', powerUp: type })!;
    expect(line.text).toBe(`${POWER_UP_NAMES[type]}: ${POWER_UP_EFFECTS[type]}`);
    expect(line.tone).toBe(POWER_UPS[type].isPositive ? 'good' : 'bad');
    expect(line.powerUp).toBe(type);
  });

  it('calls out a perfect budget', () => {
    const score = { baseScore: 500, itemValue: 0, budgetBonus: 0, timeBonus: 0, multiplier: 2, totalScore: 1000, combos: [{ name: 'Perfect Budget', multiplier: 2 }] };
    expect(pennyLineFor({ type: 'round_complete', score })?.text).toBe('Perfect budget!');
    expect(pennyLineFor({ type: 'round_complete', score: { ...score, combos: [] } })?.text).toBe('Cart full!');
  });

  it('says why a round failed', () => {
    expect(pennyLineFor({ type: 'round_failed', reason: 'bust' })?.text).toBe('Over budget!');
    expect(pennyLineFor({ type: 'round_failed', reason: 'timeout' })?.text).toBe('Out of time...');
  });

  it('stays quiet for combo events (the round screen lists them)', () => {
    expect(pennyLineFor({ type: 'combo_achieved', combo: { name: 'Thrifty', multiplier: 1.4 } })).toBeNull();
  });
});

describe('pennyVerdict', () => {
  it('never tells a winner to try again', () => {
    expect(pennyVerdict(GOOD_GAME_SCORE, false).text).toBe('Amazing work!');
    expect(pennyVerdict(GOOD_GAME_SCORE - 1, true).text).toBe('You cleared the whole shop!');
    expect(pennyVerdict(GOOD_GAME_SCORE - 1, false).text).toBe('Try again!');
  });
});
