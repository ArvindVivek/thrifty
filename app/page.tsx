'use client';

/**
 * Home page - Game entry point
 *
 * Wraps GameContainer with GameProvider to enable game context.
 * This is the root of the game application.
 */

import { GameProvider } from '@/app/contexts/GameContext';
import { GameContainer } from '@/app/components/GameContainer';

export default function Home() {
  return (
    <GameProvider>
      <GameContainer />
    </GameProvider>
  );
}
