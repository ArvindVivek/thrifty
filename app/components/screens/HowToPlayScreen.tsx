'use client';

/**
 * HowToPlayScreen - Interactive tutorial
 *
 * Features:
 * - Staggered instruction reveal
 * - Click/tap to start
 * - Tactical UI styling
 */

import { motion } from 'motion/react';
import { Keyboard, Target, Wallet, Trophy } from 'lucide-react';

interface HowToPlayScreenProps {
  onAdvance: () => void;
}

const INSTRUCTIONS = [
  { icon: Keyboard, text: 'Use arrow keys to move left and right' },
  { icon: Target, text: 'Catch falling items to fill your 5 equipment slots' },
  { icon: Wallet, text: "Stay within your budget - don't go over!" },
  { icon: Trophy, text: 'Complete all 3 rounds to win' },
];

export function HowToPlayScreen({ onAdvance }: HowToPlayScreenProps) {

  return (
    <div
      onClick={onAdvance}
      className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center cursor-pointer relative overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-grid-tactical opacity-30" />

      {/* Main card */}
      <motion.div
        className="glass-panel-solid p-8 max-w-md w-full mx-4 relative z-10"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Tactical corners */}
        <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-c9-blue" />
        <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-c9-blue" />
        <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-c9-blue" />
        <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-c9-blue" />

        {/* Header */}
        <motion.h2
          className="text-2xl font-bold text-center text-c9-blue mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          How to Play
        </motion.h2>

        {/* Instructions */}
        <div className="space-y-4 mb-8">
          {INSTRUCTIONS.map((instruction, index) => {
            const Icon = instruction.icon;
            return (
              <motion.div
                key={index}
                className="flex items-start gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-c9-blue/20 border border-c9-blue/30 flex items-center justify-center">
                  <Icon className="size-5 text-c9-blue" />
                </div>
                <p className="text-foreground pt-2">{instruction.text}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Click to start */}
        <motion.div
          className="text-center border-t border-border pt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <motion.p
            className="text-muted-foreground animate-pulse"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Click anywhere to start
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}
