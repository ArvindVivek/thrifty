'use client';

/**
 * GameContext - React Context for game state management
 *
 * Provides GameEngine instance and current game state to all game components.
 * Uses useGameEngine hook internally for proper ref-based engine storage.
 *
 * Pattern:
 * - GameProvider wraps game components
 * - useGame() hook consumes the context
 * - Engine accessed directly for imperative actions
 * - gameState triggers re-renders for UI updates
 */

import { createContext, useContext, useState, type ReactNode } from 'react';
import { GameEngine } from '@/lib/game/GameEngine';
import type { GameState, GameEvent } from '@/lib/game/types';
import { useGameEngine } from '@/hooks/useGameEngine';
import {
  CANVAS_WIDTH,
  CATCHER_WIDTH,
  CATCHER_HEIGHT,
  CATCHER_Y,
} from '@/lib/game/constants';

/**
 * Context value containing engine and current state
 */
export interface GameContextValue {
  /** GameEngine instance for imperative game control */
  engine: GameEngine;
  /** Current game state (triggers re-renders) */
  gameState: GameState;
  /** Touch steering for the play area (play-area px of the catcher's centre, or null) */
  setPointerTarget: (x: number | null) => void;
}

/**
 * Props for GameProvider component
 */
export interface GameProviderProps {
  /** Child components that need access to game context */
  children: ReactNode;
  /** Optional callback for game events */
  onGameEvent?: (event: GameEvent) => void;
}

/**
 * Game context (internal - not exported to encourage useGame usage)
 * Default value is null, useGame throws if context missing
 */
const GameContext = createContext<GameContextValue | null>(null);

/**
 * Create initial game state with default values
 *
 * - Catcher centered horizontally, positioned near bottom
 * - Empty slots and items
 * - Round 0 (pre-game), status 'menu'
 *
 * @returns Initial GameState object
 */
export function createInitialGameState(): GameState {
  return {
    catcher: {
      x: (CANVAS_WIDTH - CATCHER_WIDTH) / 2,
      y: CATCHER_Y,
      width: CATCHER_WIDTH,
      height: CATCHER_HEIGHT,
      velocityX: 0,
    },
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

/**
 * GameProvider component
 *
 * Wraps game components to provide GameEngine and state via context.
 * Uses useGameEngine internally for proper ref storage and lifecycle.
 *
 * @param props - Provider props including children and optional event callback
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <GameProvider onGameEvent={handleEvent}>
 *       <GameCanvas />
 *       <GameUI />
 *     </GameProvider>
 *   );
 * }
 * ```
 */
export function GameProvider({ children, onGameEvent }: GameProviderProps) {
  const [initialState] = useState(createInitialGameState);
  const { engine, gameState, setPointerTarget } = useGameEngine({
    initialState,
    onGameEvent,
  });

  // Defensive check - engine should always exist after useGameEngine returns
  if (!engine) {
    throw new Error('GameEngine failed to initialize');
  }

  return (
    <GameContext.Provider value={{ engine, gameState, setPointerTarget }}>
      {children}
    </GameContext.Provider>
  );
}

/**
 * Hook to access game context
 *
 * Must be used within GameProvider. Throws error if used outside provider
 * to fail fast and provide clear error message.
 *
 * @returns GameContextValue containing engine and gameState
 * @throws Error if used outside GameProvider
 *
 * @example
 * ```tsx
 * function GameCanvas() {
 *   const { engine, gameState } = useGame();
 *
 *   const handleStart = () => {
 *     engine.newGame();
 *   };
 *
 *   return (
 *     <div>
 *       <p>Round: {gameState.round}</p>
 *       <button onClick={handleStart}>Start</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useGame(): GameContextValue {
  const context = useContext(GameContext);

  if (context === null) {
    throw new Error('useGame must be used within GameProvider');
  }

  return context;
}
