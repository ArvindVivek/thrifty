import { memo } from 'react';
import { CATCHER_WIDTH, CATCHER_HEIGHT, CATCHER_Y } from '@/app/lib/constants';

interface CatcherProps {
  x: number;
}

/**
 * Catcher component renders the player-controlled element at the bottom of the game area.
 * Uses CSS transform (translate3d) for GPU-accelerated horizontal positioning.
 * Fixed Y position defined by CATCHER_Y constant.
 * Memoized to prevent unnecessary re-renders during game loop.
 */
export const Catcher = memo(function Catcher({ x }: CatcherProps) {
  return (
    <div
      className="absolute bg-blue-600 rounded-lg border-2 border-blue-400 shadow-lg flex items-center justify-center"
      style={{
        transform: `translate3d(${x}px, ${CATCHER_Y}px, 0)`,
        width: CATCHER_WIDTH,
        height: CATCHER_HEIGHT,
        contain: 'layout style paint',
      }}
    >
      <span className="text-white font-bold text-sm">C9</span>
    </div>
  );
});
