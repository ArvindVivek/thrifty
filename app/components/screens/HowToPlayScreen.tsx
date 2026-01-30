'use client';

/**
 * HowToPlayScreen - Instructions with auto-advance timer
 *
 * Full-screen centered layout with:
 * - Card displaying how-to-play instructions
 * - 5-second countdown with proper useEffect cleanup
 * - Click/tap anywhere to skip immediately
 * - Fade-in animation on mount
 */

import { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';

interface HowToPlayScreenProps {
  onAdvance: () => void;
}

/**
 * HowToPlayScreen component
 *
 * Displays game instructions with auto-advance timer.
 * Uses chained setTimeout (not setInterval) to prevent memory leaks.
 * Clicking anywhere on the screen skips to the game.
 */
export function HowToPlayScreen({ onAdvance }: HowToPlayScreenProps) {
  const [countdown, setCountdown] = useState(5);

  // Auto-advance timer with cleanup
  useEffect(() => {
    if (countdown <= 0) {
      onAdvance();
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, onAdvance]);

  return (
    <div
      onClick={onAdvance}
      className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center cursor-pointer animate-in fade-in duration-500"
    >
      <Card className="max-w-md mx-4 bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-white">
            How to Play
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-blue-400 font-bold">1.</span>
              <span>Use arrow keys to move left and right</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 font-bold">2.</span>
              <span>Catch falling items to fill your 5 equipment slots</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 font-bold">3.</span>
              <span>Stay within your budget - don't go over!</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 font-bold">4.</span>
              <span>Complete all 5 rounds to win</span>
            </li>
          </ul>

          <div className="text-center text-sm text-gray-400 pt-4 border-t border-gray-700">
            Starting in {countdown}s... (tap to skip)
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
