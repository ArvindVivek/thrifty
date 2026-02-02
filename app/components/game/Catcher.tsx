'use client';

import { memo } from 'react';
import Image from 'next/image';
import { CATCHER_WIDTH, CATCHER_HEIGHT, CATCHER_Y } from '@/app/lib/constants';

interface CatcherProps {
  x: number;
}

/**
 * Catcher - Player-controlled C9 jersey catching items
 *
 * Features:
 * - C9 logo branding
 * - Jersey-like appearance
 * - Subtle glow effect
 * - GPU-accelerated horizontal positioning
 */
export const Catcher = memo(function Catcher({ x }: CatcherProps) {
  return (
    <div
      className="absolute flex flex-col items-center justify-center"
      style={{
        transform: `translate3d(${x}px, ${CATCHER_Y}px, 0)`,
        width: CATCHER_WIDTH,
        height: CATCHER_HEIGHT,
        contain: 'layout style paint',
      }}
    >
      {/* Jersey body */}
      <div className="relative w-full h-full bg-gradient-to-b from-[#1E88E5] to-[#0D47A1] rounded-t-xl border-2 border-white/30 shadow-lg shadow-blue-500/40 flex items-center justify-center overflow-hidden">
        {/* Jersey collar */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-3 bg-white/90 rounded-b-full" />

        {/* Jersey stripes */}
        <div className="absolute top-0 left-4 w-1 h-full bg-white/20" />
        <div className="absolute top-0 right-4 w-1 h-full bg-white/20" />

        {/* C9 Logo */}
        <div className="relative w-14 h-14 flex items-center justify-center">
          <Image
            src="/assets/c9/c9_logo.png"
            alt="Cloud9"
            width={56}
            height={56}
            className="object-contain drop-shadow-lg"
            unoptimized
          />
        </div>

        {/* Bottom glow effect */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-white/30 to-transparent" />
      </div>

      {/* Catch zone indicator */}
      <div className="w-full h-1 bg-gradient-to-r from-transparent via-white/60 to-transparent mt-1 rounded-full" />
    </div>
  );
});
