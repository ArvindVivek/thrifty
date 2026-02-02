'use client';

/**
 * TitleScreen - Entry screen with tactical branding
 *
 * Esports-inspired design with:
 * - Animated THRIFTY logo with tactical corners
 * - Smooth staggered entrance animations
 * - Grid background with subtle tactical feel
 */

import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Play, Trophy } from 'lucide-react';

interface TitleScreenProps {
  onStart: () => void;
  onLeaderboard: () => void;
}

export function TitleScreen({ onStart, onLeaderboard }: TitleScreenProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-grid-tactical opacity-50" />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo container with tactical corners */}
        <motion.div
          className="relative mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Tactical corner accents */}
          <div className="absolute -top-3 -left-4 w-6 h-6 border-t-2 border-l-2 border-c9-blue" />
          <div className="absolute -top-3 -right-4 w-6 h-6 border-t-2 border-r-2 border-c9-blue" />
          <div className="absolute -bottom-3 -left-4 w-6 h-6 border-b-2 border-l-2 border-c9-blue" />
          <div className="absolute -bottom-3 -right-4 w-6 h-6 border-b-2 border-r-2 border-c9-blue" />

          <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
            <span className="text-c9-blue">THRIFTY</span>
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.p
          className="text-lg text-muted-foreground text-center max-w-md px-4 mb-12"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
        >
          Catch items to fill your slots without busting the budget
        </motion.p>

        {/* Action buttons */}
        <motion.div
          className="flex flex-col gap-3 min-w-[240px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
        >
          <Button
            onClick={onStart}
            size="lg"
            className="w-full group relative overflow-hidden"
          >
            <motion.span
              className="absolute inset-0 bg-c9-blue-light/20"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.5 }}
            />
            <Play className="mr-2 size-5" />
            Start Game
          </Button>

          <Button
            onClick={onLeaderboard}
            variant="outline"
            size="lg"
            className="w-full"
          >
            <Trophy className="mr-2 size-5" />
            Leaderboard
          </Button>
        </motion.div>

        {/* Keyboard hint */}
        <motion.p
          className="mt-8 text-xs text-muted-foreground/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          Use arrow keys to move • Catch wisely
        </motion.p>
      </div>

      {/* Bottom accent line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-c9-blue/50 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
      />
    </div>
  );
}
