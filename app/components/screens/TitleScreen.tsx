'use client';

/**
 * TitleScreen - Entry screen with branding and navigation
 *
 * Full-screen centered layout with:
 * - THRIFTY title and tagline
 * - Start Game primary button with Play icon
 * - Leaderboard outline button with Trophy icon
 * - Fade-in animation on mount
 */

import { Button } from '@/components/ui/button';
import { Play, Trophy } from 'lucide-react';

interface TitleScreenProps {
  onStart: () => void;
  onLeaderboard: () => void;
}

/**
 * TitleScreen component
 *
 * Entry point to the game with branding and primary actions.
 * Uses shadcn/ui Button component and Lucide icons.
 */
export function TitleScreen({ onStart, onLeaderboard }: TitleScreenProps) {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Branding */}
      <h1 className="text-5xl font-bold mb-4 text-blue-400">THRIFTY</h1>
      <p className="text-lg text-gray-400 mb-12 text-center max-w-md px-4">
        Catch items to fill your slots without busting the budget!
      </p>

      {/* Action buttons */}
      <div className="flex flex-col gap-4 min-w-[200px]">
        <Button
          onClick={onStart}
          size="lg"
          className="w-full"
        >
          <Play />
          Start Game
        </Button>

        <Button
          onClick={onLeaderboard}
          variant="outline"
          size="lg"
          className="w-full"
        >
          <Trophy />
          Leaderboard
        </Button>
      </div>
    </div>
  );
}
