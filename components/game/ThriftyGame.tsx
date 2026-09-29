'use client';

/**
 * The whole game on one page: Penny's reactions wrap the engine, which wraps the screens.
 */

import { useCallback } from 'react';
import type { GameEvent } from '@/lib/game/types';
import { GameProvider } from './GameContext';
import { PennyProvider, usePennyContext } from './PennyContext';
import { GameContainer } from './GameContainer';

function GameWithEvents() {
  const { handleGameEvent } = usePennyContext();
  const onGameEvent = useCallback((event: GameEvent) => handleGameEvent(event), [handleGameEvent]);
  return (
    <GameProvider onGameEvent={onGameEvent}>
      <GameContainer />
    </GameProvider>
  );
}

export function ThriftyGame() {
  return (
    <PennyProvider>
      <GameWithEvents />
    </PennyProvider>
  );
}
