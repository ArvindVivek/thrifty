'use client';

/**
 * React hook for GameEngine integration
 *
 * CRITICAL PERFORMANCE PATTERN:
 * - GameEngine instance created once (lazy useState, never set again), so the 60 FPS loop never re-renders by itself
 * - Only gameState triggers React re-renders (for UI updates)
 * - Cleanup calls engine.stop() to prevent requestAnimationFrame memory leak
 */

import { useRef, useState, useEffect, useCallback } from 'react';
import { GameEngine } from '@/lib/game/GameEngine';
import type { GameState, GameEvent } from '@/lib/game/types';
import { useKeyboard } from './useKeyboard';

/**
 * Options for useGameEngine hook
 */
export interface UseGameEngineOptions {
  /** Initial game state */
  initialState: GameState;
  /** Optional callback for game events (item caught, round complete, etc.) */
  onGameEvent?: (event: GameEvent) => void;
}

/**
 * Return type for useGameEngine hook
 */
export interface UseGameEngineReturn {
  /** GameEngine instance (stable reference, stored in ref) */
  engine: GameEngine;
  /** Current game state (triggers re-renders for UI) */
  gameState: GameState;
  /** Touch/pointer steering: where the catcher's centre should go (play-area px), or null. */
  setPointerTarget: (x: number | null) => void;
}

/**
 * Hook to integrate GameEngine with React
 *
 * Creates the engine once and keeps it for the component's life. Only gameState changes trigger React re-renders.
 *
 * @example
 * ```tsx
 * const { engine, gameState } = useGameEngine({
 *   initialState: createInitialGameState(),
 *   onGameEvent: (event) => console.log(event),
 * });
 *
 * engine.newGame();
 * ```
 */
export function useGameEngine(options: UseGameEngineOptions): UseGameEngineReturn {
  const { initialState, onGameEvent } = options;

  // Get keyboard state (stable reference, no re-renders)
  const keyboardState = useKeyboard();

  // Touch steering lives in a ref too: the engine polls it every physics step
  const pointerTargetRef = useRef<number | null>(null);
  const setPointerTarget = useCallback((x: number | null) => {
    pointerTargetRef.current = x;
  }, []);

  // The latest event callback, so the engine (created once) never calls a stale closure
  const onGameEventRef = useRef(onGameEvent);
  useEffect(() => {
    onGameEventRef.current = onGameEvent;
  }, [onGameEvent]);

  // Game state for UI - only this triggers React re-renders
  const [gameState, setGameState] = useState<GameState>(initialState);

  // One engine for the component's life. A lazy useState initializer runs once, so the engine
  // is never re-created, and the engine itself is never set again (no 60 FPS re-renders: only
  // gameState changes render).
  const [engine] = useState(
    // eslint-disable-next-line react-hooks/refs -- the closures read the refs later, from the game loop, never during render
    () =>
      new GameEngine({
        initialState,
        inputState: {
          isKeyDown: keyboardState.isKeyDown,
          targetX: () => pointerTargetRef.current,
        },
        onStateChange: setGameState,
        onGameEvent: (event) => onGameEventRef.current?.(event),
      })
  );

  // Lifecycle management: start on mount, stop on unmount
  useEffect(() => {
    // Start the game loop
    engine.start();

    // CRITICAL: Cleanup function to prevent requestAnimationFrame memory leak
    return () => {
      engine.stop();
    };
  }, [engine]); // The engine never changes: mount/unmount only

  return {
    engine,
    gameState,
    setPointerTarget,
  };
}
