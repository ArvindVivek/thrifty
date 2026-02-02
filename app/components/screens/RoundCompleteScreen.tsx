'use client';

/**
 * RoundCompleteScreen - Victory celebration with score breakdown
 *
 * Features:
 * - Staggered score reveal animations
 * - Confetti celebration
 * - Combo multiplier highlights
 * - Tactical UI styling
 */

import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { motion } from 'motion/react';
import { ScoreResult } from '@/app/lib/scoreCalculator';
import { ROUND_CONFIG } from '@/app/lib/constants';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface RoundCompleteScreenProps {
  round: number;
  score: ScoreResult;
  totalScore: number;
  onNextRound: () => void;
}

export function RoundCompleteScreen({
  round,
  score,
  totalScore,
  onNextRound,
}: RoundCompleteScreenProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setDimensions({ width: window.innerWidth, height: window.innerHeight });
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  // Animation variants for staggered reveals
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' as const } }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid-tactical opacity-30" />

      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={dimensions.width}
          height={dimensions.height}
          recycle={false}
          numberOfPieces={150}
          gravity={0.25}
          colors={['#0099FF', '#9775FA', '#00C896', '#F5A524', '#FFFFFF']}
        />
      )}

      {/* Main card */}
      <motion.div
        className="glass-panel-solid p-8 max-w-md w-full relative z-10"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {/* Tactical corners */}
        <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-c9-blue" />
        <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-c9-blue" />
        <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-c9-blue" />
        <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-c9-blue" />

        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            className="inline-flex items-center gap-2 text-success mb-2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
          >
            <CheckCircle2 className="size-6" />
            <span className="hud-label text-success">Round Complete</span>
          </motion.div>

          <motion.h2
            className="text-3xl font-bold text-c9-blue"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {ROUND_CONFIG[round - 1]?.name || `Round ${round}`}
          </motion.h2>
        </div>

        {/* Score breakdown */}
        <motion.div
          className="space-y-3 mb-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="flex justify-between text-sm" variants={itemVariants}>
            <span className="text-muted-foreground">Base Score</span>
            <span className="hud-value">{score.baseScore.toLocaleString()}</span>
          </motion.div>

          <motion.div className="flex justify-between text-sm" variants={itemVariants}>
            <span className="text-muted-foreground">Item Value</span>
            <span className="hud-value text-success">+{score.itemValue.toLocaleString()}</span>
          </motion.div>

          <motion.div className="flex justify-between text-sm" variants={itemVariants}>
            <span className="text-muted-foreground">Budget Bonus</span>
            <span className="hud-value text-success">+{score.budgetBonus.toLocaleString()}</span>
          </motion.div>

          <motion.div className="flex justify-between text-sm" variants={itemVariants}>
            <span className="text-muted-foreground">Time Bonus</span>
            <span className="hud-value text-success">+{Math.round(score.timeBonus).toLocaleString()}</span>
          </motion.div>
        </motion.div>

        {/* Combos section */}
        {score.combos.length > 0 && (
          <motion.div
            className="border-t border-border pt-4 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="hud-label mb-3 text-jb-purple">Combo Bonuses</h3>
            <div className="space-y-2">
              {score.combos.map((combo, index) => (
                <motion.div
                  key={combo.name}
                  className="flex justify-between text-sm"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  <span className="text-jb-purple">{combo.name}</span>
                  <span className="hud-value text-jb-purple">×{combo.multiplier.toFixed(1)}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Total multiplier */}
        {score.multiplier > 1 && (
          <motion.div
            className="flex justify-between py-3 border-t border-border"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <span className="font-semibold">Total Multiplier</span>
            <span className="hud-value text-jb-purple text-lg">×{score.multiplier.toFixed(1)}</span>
          </motion.div>
        )}

        {/* Round total */}
        <motion.div
          className="flex justify-between py-3 border-t border-border"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.0, type: 'spring', stiffness: 200 }}
        >
          <span className="text-lg font-bold">Round Total</span>
          <span className="text-2xl font-bold text-c9-blue hud-value">
            {score.totalScore.toLocaleString()}
          </span>
        </motion.div>

        {/* Running total */}
        <motion.div
          className="flex justify-between text-sm mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          <span className="text-muted-foreground">Running Total</span>
          <span className="hud-value">{totalScore.toLocaleString()}</span>
        </motion.div>

        {/* Continue button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <Button onClick={onNextRound} size="lg" className="w-full">
            {round < 3 ? 'Next Round' : 'View Results'}
            <ArrowRight className="ml-2 size-5" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
