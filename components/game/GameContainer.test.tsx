// @vitest-environment jsdom
/**
 * Unit tests for GameContainer component
 *
 * Ported from the Jest suite (which never ran: its imports pulled in an ESM-only package).
 * Same intent per screen, against the screens that ship:
 * - Menu screen renders when status is 'menu'
 * - Start leads to the round card, which starts a fresh game (engine.newGame)
 * - Playing screen shows the HUD values
 * - Round complete screen has a Next Round button that calls engine.nextRound()
 * - A failed round ends the game and says why (bust or timeout)
 * - Game over screen has the final score, rank and Play Again (a fresh game)
 */

import React from 'react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { GameContainer } from './GameContainer';
import { useGame } from './GameContext';
import type { GameState, PowerUpEffect, FallingItem } from '@/lib/game/types';
import type { ScoreResult } from '@/lib/game/scoreCalculator';

vi.mock('./GameContext', () => ({
  useGame: vi.fn(),
}));

vi.mock('./PennyContext', () => ({
  usePennyContext: () => ({
    line: null,
    handleGameEvent: vi.fn(),
    triggerRoundStart: vi.fn(),
    triggerFourSlots: vi.fn(),
  }),
}));

// The leaderboard overlay must not touch the network in unit tests
vi.mock('@/lib/leaderboard', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/leaderboard')>()),
  fetchLeaderboard: vi.fn(async () => ({ ok: true, entries: [] })),
  submitScore: vi.fn(async () => ({ ok: true, id: 'new-id' })),
}));

const mockUseGame = useGame as unknown as Mock;

beforeAll(() => {
  // jsdom has no ResizeObserver; the play area measures its box with one
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});

// Helper to create mock game state
function createMockGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    catcher: { x: 196, y: 520, width: 88, height: 64, velocityX: 0 },
    items: [],
    slots: [null, null, null, null, null],
    budget: 4500,
    timer: 30000,
    round: 1,
    score: 0,
    totalScore: 0,
    status: 'menu',
    activePowerUps: [],
    playTimeMs: 0,
    ...overrides,
  };
}

// Helper to create mock engine
function createMockEngine() {
  return {
    newGame: vi.fn(),
    startRound: vi.fn(),
    nextRound: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    isRunning: vi.fn(() => true),
    getState: vi.fn(),
  };
}

function mockGame(state: Partial<GameState>) {
  const engine = createMockEngine();
  mockUseGame.mockReturnValue({ engine, gameState: createMockGameState(state), setPointerTarget: vi.fn() });
  return engine;
}

const item = (id: string, name: string, cost: number): FallingItem => ({
  id,
  itemId: id,
  itemName: name,
  category: 'snack',
  cost,
  value: cost / 2,
  x: 0,
  y: 0,
  width: 64,
  height: 64,
  velocityY: 180,
});

const roundScore: ScoreResult = {
  baseScore: 500,
  itemValue: 1500,
  budgetBonus: 2000,
  timeBonus: 600,
  combos: [{ name: 'Thrifty', multiplier: 1.4 }],
  multiplier: 1.4,
  totalScore: 6440,
};

describe('GameContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Menu screen', () => {
    it('should render menu screen when status is menu', () => {
      mockGame({ status: 'menu' });
      render(<GameContainer />);

      expect(screen.getByRole('heading', { level: 1, name: 'Thrifty' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Start game' })).toBeInTheDocument();
    });

    it('should start a fresh game (engine.newGame) from the round card after Start', () => {
      const engine = mockGame({ status: 'menu' });
      render(<GameContainer />);

      fireEvent.click(screen.getByRole('button', { name: 'Start game' }));
      // The round card comes first, so nobody is dropped straight into falling items
      expect(screen.getByText('Easy')).toBeInTheDocument();
      expect(engine.newGame).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole('button', { name: 'Start round' }));
      expect(engine.newGame).toHaveBeenCalledTimes(1);
      expect(engine.startRound).not.toHaveBeenCalled();
    });
  });

  describe('Playing screen', () => {
    it('should render the HUD values when status is playing', () => {
      mockGame({
        status: 'playing',
        round: 2,
        budget: 3500,
        timer: 25000,
        totalScore: 1500,
        slots: [item('apple', 'Apple', 300), item('pizza', 'Pizza', 800), null, null, null],
        activePowerUps: [{ type: 'slow_motion', duration: 5000, active: true } as PowerUpEffect],
      });
      render(<GameContainer />);

      expect(screen.getByTestId('hud-round')).toHaveTextContent('2/3');
      expect(screen.getByTestId('hud-budget')).toHaveTextContent('$3,500');
      expect(screen.getByTestId('hud-time')).toHaveTextContent('25s');
      expect(screen.getByTestId('hud-score')).toHaveTextContent('1,500');
      expect(screen.getByLabelText('Your cart: 2 of 5 filled')).toBeInTheDocument();
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    it('should show active power-ups with the seconds left', () => {
      mockGame({
        status: 'playing',
        activePowerUps: [{ type: 'slow_motion', duration: 4200, active: true } as PowerUpEffect],
      });
      render(<GameContainer />);

      const effects = screen.getByLabelText('Active power-ups');
      expect(within(effects).getByLabelText('Slow Motion')).toBeInTheDocument();
      expect(within(effects).getByText('5s')).toBeInTheDocument();
    });
  });

  describe('Round complete screen', () => {
    it('should render round complete screen with the running total and a next-round button', () => {
      mockGame({ status: 'round_complete', round: 2, totalScore: 5000, lastScore: roundScore });
      render(<GameContainer />);

      expect(screen.getByText('Round 2 cleared')).toBeInTheDocument();
      expect(screen.getByTestId('round-score')).toHaveTextContent('6,440');
      expect(screen.getByText('5,000')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Start round 3' })).toBeInTheDocument();
    });

    it('should call engine.nextRound() when clicking the next-round button', () => {
      const engine = mockGame({ status: 'round_complete', round: 1, totalScore: 6440, lastScore: roundScore });
      render(<GameContainer />);

      fireEvent.click(screen.getByRole('button', { name: 'Start round 2' }));

      expect(engine.nextRound).toHaveBeenCalledTimes(1);
    });
  });

  describe('Failed round', () => {
    it('should end the game and say the budget ran out on a bust', () => {
      mockGame({ status: 'game_over', round: 2, failReason: 'bust', totalScore: 7000 });
      render(<GameContainer />);

      expect(screen.getByText('Over budget in round 2')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Play again' })).toBeInTheDocument();
    });

    it('should show timeout message for timeout fail reason', () => {
      mockGame({ status: 'game_over', round: 1, failReason: 'timeout', totalScore: 300 });
      render(<GameContainer />);

      expect(screen.getByText('Out of time in round 1')).toBeInTheDocument();
    });

    it('should offer the leaderboard and come back to the result', async () => {
      mockGame({ status: 'game_over', round: 3, failReason: 'timeout', totalScore: 300 });
      render(<GameContainer />);

      fireEvent.click(screen.getByRole('button', { name: 'Leaderboard' }));
      expect(await screen.findByText('Be the first on the board')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Back' }));
      expect(screen.getByText('Out of time in round 3')).toBeInTheDocument();
    });
  });

  describe('Game over screen', () => {
    it('should render game over screen with final score, rank and Play Again button', () => {
      mockGame({ status: 'game_over', round: 3, totalScore: 25000 });
      render(<GameContainer />);

      expect(screen.getByText('You cleared all 3 rounds!')).toBeInTheDocument();
      expect(screen.getByTestId('final-score')).toHaveTextContent('25,000');
      expect(screen.getByLabelText('Rank B')).toBeInTheDocument();
      expect(screen.getByText('Smart Shopper')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Play again' })).toBeInTheDocument();
      expect(screen.getByLabelText('Your name on the board')).toBeInTheDocument();
    });

    it('should start a fresh game (engine.newGame, not startRound) after Play Again', () => {
      const engine = mockGame({ status: 'game_over', round: 3, totalScore: 25000 });
      render(<GameContainer />);

      fireEvent.click(screen.getByRole('button', { name: 'Play again' }));
      fireEvent.click(screen.getByRole('button', { name: 'Start round' }));

      expect(engine.newGame).toHaveBeenCalledTimes(1);
      expect(engine.startRound).not.toHaveBeenCalled();
    });
  });
});
