/**
 * Unit tests for useGameEngine hook
 *
 * Tests cover:
 * - Engine is created once (stored in ref, not recreated on re-renders)
 * - Cleanup calls engine.stop() on unmount
 * - gameState updates when onStateChange callback is invoked
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useGameEngine, UseGameEngineOptions } from '../useGameEngine';
import { GameEngine } from '@/app/lib/GameEngine';
import type { GameState, GameEvent } from '@/app/lib/types';

// Mock GameEngine
jest.mock('@/app/lib/GameEngine', () => {
  return {
    GameEngine: jest.fn().mockImplementation((options) => {
      return {
        start: jest.fn(),
        stop: jest.fn(),
        getState: jest.fn(() => options.initialState),
        isRunning: jest.fn(() => false),
        startRound: jest.fn(),
        // Store callbacks for testing
        _onStateChange: options.onStateChange,
        _onGameEvent: options.onGameEvent,
      };
    }),
  };
});

// Helper to create initial state
function createInitialState(): GameState {
  return {
    catcher: { x: 360, y: 480, width: 80, height: 100, velocityX: 0 },
    items: [],
    slots: [null, null, null, null, null],
    budget: 4500,
    timer: 30000,
    round: 1,
    score: 0,
    totalScore: 0,
    status: 'menu',
    activePowerUps: [],
  };
}

describe('useGameEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('engine creation', () => {
    it('should create GameEngine once on initial render', () => {
      const options: UseGameEngineOptions = {
        initialState: createInitialState(),
      };

      renderHook(() => useGameEngine(options));

      // GameEngine constructor should be called exactly once
      expect(GameEngine).toHaveBeenCalledTimes(1);
    });

    it('should not recreate GameEngine on re-renders', () => {
      const options: UseGameEngineOptions = {
        initialState: createInitialState(),
      };

      const { rerender } = renderHook(() => useGameEngine(options));

      // Initial render
      expect(GameEngine).toHaveBeenCalledTimes(1);

      // Rerender multiple times
      rerender();
      rerender();
      rerender();

      // Should still only be 1 constructor call (stored in ref)
      expect(GameEngine).toHaveBeenCalledTimes(1);
    });

    it('should pass initialState and onStateChange to GameEngine constructor', () => {
      const initialState = createInitialState();
      const onGameEvent = jest.fn();

      renderHook(() =>
        useGameEngine({
          initialState,
          onGameEvent,
        })
      );

      expect(GameEngine).toHaveBeenCalledWith({
        initialState,
        onStateChange: expect.any(Function),
        onGameEvent,
      });
    });
  });

  describe('lifecycle management', () => {
    it('should call engine.start() on mount', () => {
      const options: UseGameEngineOptions = {
        initialState: createInitialState(),
      };

      renderHook(() => useGameEngine(options));

      // Get the mock engine instance
      const mockEngine = (GameEngine as jest.Mock).mock.results[0].value;

      expect(mockEngine.start).toHaveBeenCalledTimes(1);
    });

    it('should call engine.stop() on unmount (cleanup)', () => {
      const options: UseGameEngineOptions = {
        initialState: createInitialState(),
      };

      const { unmount } = renderHook(() => useGameEngine(options));

      // Get the mock engine instance
      const mockEngine = (GameEngine as jest.Mock).mock.results[0].value;

      // stop() should not have been called yet
      expect(mockEngine.stop).not.toHaveBeenCalled();

      // Unmount the hook
      unmount();

      // CRITICAL: stop() must be called to prevent RAF memory leak
      expect(mockEngine.stop).toHaveBeenCalledTimes(1);
    });
  });

  describe('state updates', () => {
    it('should return initial gameState', () => {
      const initialState = createInitialState();

      const { result } = renderHook(() =>
        useGameEngine({
          initialState,
        })
      );

      expect(result.current.gameState).toEqual(initialState);
    });

    it('should update gameState when onStateChange is called', async () => {
      const initialState = createInitialState();

      const { result } = renderHook(() =>
        useGameEngine({
          initialState,
        })
      );

      // Get the mock engine instance
      const mockEngine = (GameEngine as jest.Mock).mock.results[0].value;

      // Simulate state change from engine
      const newState: GameState = {
        ...initialState,
        round: 2,
        budget: 4000,
      };

      act(() => {
        mockEngine._onStateChange(newState);
      });

      // gameState should be updated
      await waitFor(() => {
        expect(result.current.gameState.round).toBe(2);
        expect(result.current.gameState.budget).toBe(4000);
      });
    });

    it('should trigger re-render when gameState changes', () => {
      const initialState = createInitialState();
      let renderCount = 0;

      const { result } = renderHook(() => {
        renderCount++;
        return useGameEngine({
          initialState,
        });
      });

      const initialRenderCount = renderCount;

      // Get the mock engine instance
      const mockEngine = (GameEngine as jest.Mock).mock.results[0].value;

      // Simulate state change from engine
      act(() => {
        mockEngine._onStateChange({
          ...initialState,
          round: 2,
        });
      });

      // Should have triggered a re-render
      expect(renderCount).toBeGreaterThan(initialRenderCount);
    });
  });

  describe('return value', () => {
    it('should return engine instance', () => {
      const { result } = renderHook(() =>
        useGameEngine({
          initialState: createInitialState(),
        })
      );

      // Engine should be the mocked instance
      expect(result.current.engine).toBeDefined();
      expect(result.current.engine.start).toBeDefined();
      expect(result.current.engine.stop).toBeDefined();
    });

    it('should return same engine instance across re-renders', () => {
      const { result, rerender } = renderHook(() =>
        useGameEngine({
          initialState: createInitialState(),
        })
      );

      const initialEngine = result.current.engine;

      rerender();

      // Same engine instance (stored in ref)
      expect(result.current.engine).toBe(initialEngine);
    });
  });

  describe('event handling', () => {
    it('should pass onGameEvent callback to engine', () => {
      const onGameEvent = jest.fn();

      renderHook(() =>
        useGameEngine({
          initialState: createInitialState(),
          onGameEvent,
        })
      );

      // Get the mock engine instance
      const mockEngine = (GameEngine as jest.Mock).mock.results[0].value;

      // Simulate game event
      const event: GameEvent = { type: 'budget_warning' };
      mockEngine._onGameEvent(event);

      expect(onGameEvent).toHaveBeenCalledWith(event);
    });
  });
});
