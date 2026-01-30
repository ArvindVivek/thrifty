'use client';

/**
 * Home page - Game entry point
 *
 * Wraps GameContainer with GameProvider and JunieProvider to enable game context.
 * This is the root of the game application.
 */

import { GameProvider } from '@/app/contexts/GameContext';
import { JunieProvider, useJunieContext } from '@/app/contexts/JunieContext';
import { GameContainer } from '@/app/components/GameContainer';
import { Toaster } from 'sonner';
import { showComboToasts } from '@/app/components/effects';
import { GameEvent } from '@/app/lib/types';

function GameWithEvents() {
  const { handleGameEvent } = useJunieContext();

  const onGameEvent = (event: GameEvent) => {
    handleGameEvent(event);
    if (event.type === 'round_complete' && event.score.combos.length > 0) {
      showComboToasts(event.score.combos);
    }
  };

  return (
    <GameProvider onGameEvent={onGameEvent}>
      <GameContainer />
    </GameProvider>
  );
}

export default function Home() {
  return (
    <>
      <JunieProvider>
        <GameWithEvents />
      </JunieProvider>
      <Toaster richColors position="top-center" />
    </>
  );
}
