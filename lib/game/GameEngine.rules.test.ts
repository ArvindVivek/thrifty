/**
 * Game rules the engine enforces, driven frame by frame through a fake requestAnimationFrame:
 * a fresh game on Play Again, 2x Score that really doubles, the Budget Boost cap, touch
 * steering, play time, busts and round completion.
 */

import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { GameEngine } from './GameEngine';
import type { FallingItem, GameEvent, GameState, InputState } from './types';
import {
  BUDGET_CAP_MULTIPLIER,
  CANVAS_WIDTH,
  CATCHER_HEIGHT,
  CATCHER_SPEED,
  CATCHER_WIDTH,
  CATCHER_Y,
  PHYSICS_DT,
  ROUND_CONFIG,
} from './constants';
import { applyPowerUpEffect, updatePowerUpEffects } from './powerUps';

let rafCallback: ((time: number) => void) | null = null;
let now = 0;

beforeAll(() => {
  globalThis.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
    rafCallback = callback;
    return 1;
  });
  globalThis.cancelAnimationFrame = vi.fn(() => {
    rafCallback = null;
  });
  globalThis.performance.now = vi.fn(() => now);
});

afterEach(() => {
  rafCallback = null;
  now = 0;
});

/** Run the loop for `ms` of game time, one physics step per frame. */
function run(ms: number) {
  const frames = Math.round(ms / PHYSICS_DT);
  for (let i = 0; i < frames; i++) {
    now += PHYSICS_DT;
    const callback = rafCallback;
    rafCallback = null;
    callback?.(now);
  }
}

function initialState(): GameState {
  return {
    catcher: { x: (CANVAS_WIDTH - CATCHER_WIDTH) / 2, y: CATCHER_Y, width: CATCHER_WIDTH, height: CATCHER_HEIGHT, velocityX: 0 },
    items: [],
    slots: [null, null, null, null, null],
    budget: 0,
    timer: 0,
    round: 0,
    score: 0,
    totalScore: 0,
    status: 'menu',
    activePowerUps: [],
    playTimeMs: 0,
  };
}

/** An item sitting right on top of the catcher, caught on the next step. */
function itemOnCatcher(state: GameState, cost: number, value: number): FallingItem {
  return {
    id: `item-${cost}-${Math.random()}`,
    category: 'snack',
    cost,
    value,
    x: state.catcher.x,
    y: CATCHER_Y - 10,
    width: 64,
    height: 64,
    velocityY: 0,
  };
}

/**
 * A predictable engine: `random` 0.99 means no power-ups, and every test here is shorter than
 * the ~3 s a spawned item needs to fall to the cart, so only the items a test places get caught.
 */
function quietEngine(input?: InputState, onGameEvent?: (e: GameEvent) => void) {
  const engine = new GameEngine({ initialState: initialState(), inputState: input, onGameEvent, random: () => 0.99 });
  return engine;
}

describe('newGame', () => {
  it('starts round 1 with the previous game total, last score and play time cleared', () => {
    const engine = quietEngine();
    const state = engine.getState();
    state.totalScore = 12345;
    state.playTimeMs = 99999;
    state.lastScore = { baseScore: 500, itemValue: 0, budgetBonus: 0, timeBonus: 0, combos: [], multiplier: 1, totalScore: 500 };
    state.status = 'game_over';

    engine.newGame();

    expect(state.totalScore).toBe(0);
    expect(state.playTimeMs).toBe(0);
    expect(state.lastScore).toBeUndefined();
    expect(state.round).toBe(1);
    expect(state.status).toBe('playing');
    expect(state.budget).toBe(ROUND_CONFIG[0].budget);
  });
});

describe('2x Score', () => {
  it('stays active until the next catch (it used to expire on the next tick)', () => {
    const effects = updatePowerUpEffects([{ type: 'score_multiplier', duration: 0, active: true }], 5000);
    expect(effects).toHaveLength(1);
  });

  it('doubles the next caught item, then is used up', () => {
    const engine = quietEngine();
    engine.newGame();
    engine.start();
    const state = engine.getState();
    state.budget = 1000;
    applyPowerUpEffect(state, 'score_multiplier');

    run(PHYSICS_DT * 30); // time passes with no catch: still waiting
    expect(state.activePowerUps.some((e) => e.type === 'score_multiplier')).toBe(true);

    state.items.push(itemOnCatcher(state, 300, 150));
    run(PHYSICS_DT);
    engine.stop();

    expect(state.slots[0]?.value).toBe(300);
    expect(state.activePowerUps.some((e) => e.type === 'score_multiplier')).toBe(false);
  });
});

describe('Budget Boost', () => {
  it('adds $500 but never past twice the round budget', () => {
    const engine = quietEngine();
    engine.newGame();
    const state = engine.getState();
    const cap = ROUND_CONFIG[0].budget * BUDGET_CAP_MULTIPLIER;

    applyPowerUpEffect(state, 'budget_boost');
    expect(state.budget).toBe(ROUND_CONFIG[0].budget + 500);

    for (let i = 0; i < 20; i++) applyPowerUpEffect(state, 'budget_boost');
    expect(state.budget).toBe(cap);
  });
});

describe('touch steering', () => {
  it('moves the cart toward the finger at no more than the key speed, and stops on it', () => {
    let target: number | null = 400;
    const engine = quietEngine({ isKeyDown: () => false, targetX: () => target });
    engine.newGame();
    engine.start();
    const state = engine.getState();
    const startX = state.catcher.x;

    run(100);
    expect(state.catcher.velocityX).toBe(CATCHER_SPEED);
    expect(state.catcher.x - startX).toBeLessThanOrEqual(CATCHER_SPEED * 0.1 + 0.001);

    run(2000);
    expect(state.catcher.x + CATCHER_WIDTH / 2).toBeCloseTo(400, 5);

    target = null;
    run(100);
    engine.stop();
    expect(state.catcher.velocityX).toBe(0);
  });

  it('lets the arrow keys win over a finger', () => {
    const engine = quietEngine({ isKeyDown: (key) => key === 'ArrowLeft', targetX: () => 470 });
    engine.newGame();
    engine.start();
    run(100);
    engine.stop();
    expect(engine.getState().catcher.velocityX).toBe(-CATCHER_SPEED);
  });
});

describe('play time', () => {
  it('counts only time spent playing a round', () => {
    const engine = quietEngine();
    engine.start();
    run(1000); // on the menu: not playing
    expect(engine.getState().playTimeMs).toBe(0);

    engine.newGame();
    run(1000);
    engine.stop();
    // Within one physics step (the loop's accumulator can carry part of a step over)
    expect(Math.abs(engine.getState().playTimeMs - 1000)).toBeLessThanOrEqual(PHYSICS_DT + 0.001);
  });
});

describe('catching', () => {
  it('ends the game on a bust: catching what you cannot afford', () => {
    const events: GameEvent[] = [];
    const engine = quietEngine(undefined, (e) => events.push(e));
    engine.newGame();
    engine.start();
    const state = engine.getState();
    state.budget = 200;
    state.items.push(itemOnCatcher(state, 300, 150));

    run(PHYSICS_DT);
    engine.stop();

    expect(state.status).toBe('game_over');
    expect(state.failReason).toBe('bust');
    expect(events).toContainEqual({ type: 'round_failed', reason: 'bust' });
  });

  it('clears the round on the fifth catch and adds the round score to the total', () => {
    const engine = quietEngine();
    engine.newGame();
    engine.start();
    const state = engine.getState();

    for (let i = 0; i < 5; i++) {
      state.items.push(itemOnCatcher(state, 300, 150));
      run(PHYSICS_DT);
    }
    engine.stop();

    expect(state.status).toBe('round_complete');
    expect(state.lastScore?.totalScore).toBeGreaterThan(0);
    expect(state.totalScore).toBe(state.lastScore?.totalScore);
    expect(state.budget).toBe(ROUND_CONFIG[0].budget - 5 * 300);
  });
});
