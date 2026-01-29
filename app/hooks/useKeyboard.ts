'use client';

/**
 * Keyboard input hook for game engine
 *
 * CRITICAL PERFORMANCE PATTERN:
 * - Key state stored in useRef (NOT useState) to prevent re-renders
 * - At 60 FPS, useState would trigger 60 re-renders per second per held key
 * - Ref updates are silent - React doesn't know or care
 * - Game engine polls isKeyDown() in physics loop without triggering renders
 */

import { useRef, useEffect, useCallback } from 'react';

/**
 * Interface for keyboard state that can be queried by game engine
 * Implements InputState from types.ts for engine integration
 */
export interface KeyboardState {
  isKeyDown: (key: string) => boolean;
}

/**
 * Hook to track keyboard state without triggering React re-renders
 *
 * Uses ref-based storage so key state changes are invisible to React.
 * The game engine polls isKeyDown() at its own rate (typically 60 FPS)
 * without causing any React reconciliation overhead.
 *
 * @returns KeyboardState object with isKeyDown function
 *
 * @example
 * ```tsx
 * const keyboard = useKeyboard();
 *
 * // In game engine update loop:
 * if (keyboard.isKeyDown('ArrowLeft')) {
 *   catcher.velocityX = -CATCHER_SPEED;
 * }
 * ```
 */
export function useKeyboard(): KeyboardState {
  // Ref-based storage: updates don't trigger re-renders
  const keysRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent page scroll for arrow keys (critical for game controls)
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
      }
      keysRef.current[e.key] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };

    // Attach to window for global keyboard capture
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // CRITICAL: Cleanup to prevent memory leaks and stale handlers
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // useCallback for stable reference (defensive best practice)
  const isKeyDown = useCallback((key: string): boolean => {
    return keysRef.current[key] === true;
  }, []);

  return { isKeyDown };
}
