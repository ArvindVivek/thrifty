'use client';

/**
 * React hook for GameEngine integration
 *
 * CRITICAL PERFORMANCE PATTERN:
 * - GameEngine instance stored in useRef (NOT useState) to prevent 60 FPS re-renders
 * - Only gameState triggers React re-renders (for UI updates)
 * - Cleanup calls engine.stop() to prevent requestAnimationFrame memory leak
 */

import { useRef, useState, useEffect } from 'react';
import { GameEngine } from '@/app/lib/GameEngine';
import type { GameState, GameEvent } from '@/app/lib/types';

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
}

/**
 * Hook to integrate GameEngine with React
 *
 * Uses ref-based storage for the engine instance to prevent re-creation
 * on every render. Only gameState changes trigger React re-renders.
 *
 * @param options - Hook options including initial state and event callback
 * @returns Object containing engine instance and current game state
 *
 * @example
 * ```tsx
 * const { engine, gameState } = useGameEngine({
 *   initialState: createInitialGameState(),
 *   onGameEvent: (event) => console.log(event),
 * });
 *
 * // Start a round
 * engine.startRound(1);
 * ```
 */
export function useGameEngine(options: UseGameEngineOptions): UseGameEngineReturn {
  const { initialState, onGameEvent } = options;

  // Store engine in ref - NEVER in useState (causes 60 FPS re-renders)
  const engineRef = useRef<GameEngine | null>(null);

  // Game state for UI - only this triggers React re-renders
  const [gameState, setGameState] = useState<GameState>(initialState);

  // Lazy initialization of GameEngine (prevents re-creation on every render)
  if (engineRef.current === null) {
    engineRef.current = new GameEngine({
      initialState,
      onStateChange: setGameState,
      onGameEvent,
    });
  }

  // Lifecycle management: start on mount, stop on unmount
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    // Start the game loop
    engine.start();

    // CRITICAL: Cleanup function to prevent requestAnimationFrame memory leak
    return () => {
      engine.stop();
    };
  }, []); // Empty deps array - mount/unmount only

  // Return engine (guaranteed non-null after lazy init) and current state
  return {
    engine: engineRef.current!,
    gameState,
  };
}
