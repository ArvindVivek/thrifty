// @vitest-environment jsdom
/**
 * Unit tests for GameContext provider and useGame hook
 *
 * Tests cover:
 * - useGame throws error when used outside GameProvider
 * - useGame returns engine and gameState inside provider
 * - GameProvider renders children correctly
 */

import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, renderHook } from '@testing-library/react';
import { GameProvider, useGame } from './GameContext';
import { useGameEngine } from '@/hooks/useGameEngine';
import { CANVAS_WIDTH, CATCHER_HEIGHT, CATCHER_WIDTH, CATCHER_Y } from '@/lib/game/constants';

// Mock useGameEngine: a fake engine, and the initial state straight back
vi.mock('@/hooks/useGameEngine', () => ({
  useGameEngine: vi.fn(({ initialState }) => ({
    engine: {
      start: vi.fn(),
      stop: vi.fn(),
      getState: vi.fn(() => initialState),
      isRunning: vi.fn(() => false),
      newGame: vi.fn(),
      startRound: vi.fn(),
      nextRound: vi.fn(),
    },
    gameState: initialState,
    setPointerTarget: vi.fn(),
  })),
}));

describe('GameContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console.error for expected error tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useGame hook', () => {
    it('should throw error when used outside GameProvider', () => {
      // Attempt to use hook outside provider should throw
      expect(() => {
        renderHook(() => useGame());
      }).toThrow('useGame must be used within GameProvider');
    });

    it('should return engine and gameState when used inside GameProvider', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <GameProvider>{children}</GameProvider>
      );

      const { result } = renderHook(() => useGame(), { wrapper });

      // Should return engine instance
      expect(result.current.engine).toBeDefined();
      expect(result.current.engine.start).toBeDefined();
      expect(result.current.engine.stop).toBeDefined();

      // Should return gameState
      expect(result.current.gameState).toBeDefined();
      expect(result.current.gameState.status).toBe('menu');
    });

    it('should return gameState with initial values', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <GameProvider>{children}</GameProvider>
      );

      const { result } = renderHook(() => useGame(), { wrapper });

      const { gameState } = result.current;

      // Check initial state shape
      expect(gameState.catcher).toBeDefined();
      expect(gameState.catcher.velocityX).toBe(0);
      expect(gameState.items).toEqual([]);
      expect(gameState.slots).toEqual([null, null, null, null, null]);
      expect(gameState.budget).toBe(0);
      expect(gameState.timer).toBe(0);
      expect(gameState.round).toBe(0);
      expect(gameState.score).toBe(0);
      expect(gameState.totalScore).toBe(0);
      expect(gameState.status).toBe('menu');
      expect(gameState.activePowerUps).toEqual([]);
      expect(gameState.playTimeMs).toBe(0);
    });

    it('should provide same engine instance to all consumers', () => {
      const engines: unknown[] = [];

      function Consumer() {
        const { engine } = useGame();
        engines.push(engine);
        return null;
      }

      render(
        <GameProvider>
          <Consumer />
          <Consumer />
        </GameProvider>
      );

      // Both consumers should receive same engine instance
      expect(engines[0]).toBe(engines[1]);
    });
  });

  describe('GameProvider component', () => {
    it('should render children', () => {
      render(
        <GameProvider>
          <div data-testid="child">Test Child</div>
        </GameProvider>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <GameProvider>
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
        </GameProvider>
      );

      expect(screen.getByTestId('child1')).toBeInTheDocument();
      expect(screen.getByTestId('child2')).toBeInTheDocument();
    });

    it('should render nested components', () => {
      function NestedComponent() {
        const { gameState } = useGame();
        return <div data-testid="nested">Status: {gameState.status}</div>;
      }

      render(
        <GameProvider>
          <NestedComponent />
        </GameProvider>
      );

      expect(screen.getByTestId('nested')).toBeInTheDocument();
      expect(screen.getByText('Status: menu')).toBeInTheDocument();
    });

    it('should pass onGameEvent callback to useGameEngine', () => {
      const onGameEvent = vi.fn();

      render(
        <GameProvider onGameEvent={onGameEvent}>
          <div>Test</div>
        </GameProvider>
      );

      // Verify useGameEngine was called with onGameEvent
      expect(useGameEngine).toHaveBeenCalledWith(
        expect.objectContaining({
          onGameEvent,
        })
      );
    });
  });

  describe('createInitialGameState', () => {
    it('should create state with catcher centered horizontally', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <GameProvider>{children}</GameProvider>
      );

      const { result } = renderHook(() => useGame(), { wrapper });

      const { catcher } = result.current.gameState;

      // Catcher should be centered: (480 - 88) / 2 = 196
      expect(catcher.x).toBe((CANVAS_WIDTH - CATCHER_WIDTH) / 2);
      expect(catcher.x).toBe(196);
      // Catcher at the bottom, where it's drawn (the hackathon build drew it 10 px above
      // where it collided)
      expect(catcher.y).toBe(CATCHER_Y);
      // Catcher dimensions
      expect(catcher.width).toBe(CATCHER_WIDTH);
      expect(catcher.height).toBe(CATCHER_HEIGHT);
    });

    it('should create state with 5 empty slots', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <GameProvider>{children}</GameProvider>
      );

      const { result } = renderHook(() => useGame(), { wrapper });

      expect(result.current.gameState.slots).toHaveLength(5);
      expect(result.current.gameState.slots.every((slot) => slot === null)).toBe(
        true
      );
    });
  });
});
