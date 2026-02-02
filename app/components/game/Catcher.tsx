import { memo } from 'react';
import { CATCHER_WIDTH, CATCHER_HEIGHT, CATCHER_Y } from '@/app/lib/constants';

interface CatcherProps {
  x: number;
}

/**
 * Catcher - Player-controlled element at the bottom of the game area
 *
 * Sleek design with:
 * - Primary blue color scheme
 * - Subtle glow effect
 * - GPU-accelerated horizontal positioning
 */
export const Catcher = memo(function Catcher({ x }: CatcherProps) {
  return (
    <div
      className="absolute bg-c9-blue rounded-lg border-2 border-c9-blue-light shadow-lg shadow-c9-blue/30 flex items-center justify-center"
      style={{
        transform: `translate3d(${x}px, ${CATCHER_Y}px, 0)`,
        width: CATCHER_WIDTH,
        height: CATCHER_HEIGHT,
        contain: 'layout style paint',
      }}
    >
      {/* Top highlight for depth */}
      <div className="absolute inset-x-2 top-1 h-1 bg-white/20 rounded-full" />
    </div>
  );
});
