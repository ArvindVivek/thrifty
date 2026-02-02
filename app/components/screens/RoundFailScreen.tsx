'use client';

/**
 * RoundFailScreen - Failure state with animated feedback
 *
 * Features:
 * - Budget bust and timeout states
 * - Animated entrance
 * - Slots filled progress for timeout
 * - Retry action
 */

import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, RotateCcw, XCircle } from 'lucide-react';

interface RoundFailScreenProps {
  round: number;
  failReason: 'bust' | 'timeout';
  slotsFilledCount: number;
  onRetry: () => void;
}

export function RoundFailScreen({
  round,
  failReason,
  slotsFilledCount,
  onRetry,
}: RoundFailScreenProps) {
  const isBust = failReason === 'bust';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid-tactical opacity-30" />

      {/* Danger vignette */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent to-val-red/5" />

      {/* Main card */}
      <motion.div
        className="glass-panel-solid p-8 max-w-md w-full relative z-10"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {/* Tactical corners - red for failure */}
        <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-val-red" />
        <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-val-red" />
        <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-val-red" />
        <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-val-red" />

        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            className="inline-flex items-center gap-2 text-val-red mb-2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
          >
            <XCircle className="size-6" />
            <span className="hud-label text-val-red">Round Failed</span>
          </motion.div>
        </div>

        {/* Failure reason */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-3 mb-3">
            {isBust ? (
              <AlertTriangle className="size-8 text-val-red" />
            ) : (
              <Clock className="size-8 text-val-red" />
            )}
            <h2 className="text-2xl font-bold text-val-red">
              {isBust ? 'Over Budget!' : "Time's Up!"}
            </h2>
          </div>

          <p className="text-muted-foreground">
            {isBust
              ? 'You tried to catch an item that exceeded your remaining budget.'
              : 'You ran out of time before filling all 5 slots.'}
          </p>
        </motion.div>

        {/* Timeout-specific: Slots progress */}
        {!isBust && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-secondary/50 rounded-lg p-4 text-center">
              <p className="hud-label mb-2">Slots Filled</p>
              <div className="flex items-center justify-center gap-2 mb-3">
                {[1, 2, 3, 4, 5].map((slot) => (
                  <div
                    key={slot}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      slot <= slotsFilledCount
                        ? 'bg-c9-blue text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {slot}
                  </div>
                ))}
              </div>
              <p className="text-2xl font-bold hud-value">
                {slotsFilledCount}/5
              </p>
            </div>

            <div className="flex justify-between text-sm mt-3 pt-3 border-t border-border">
              <span className="text-muted-foreground">Partial Score</span>
              <span className="hud-value">{(slotsFilledCount * 100).toLocaleString()} points</span>
            </div>
          </motion.div>
        )}

        {/* Round info */}
        <motion.div
          className="text-center mb-6 py-3 bg-secondary/30 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-sm text-muted-foreground">
            Failed on <span className="text-c9-blue font-semibold">Round {round}</span>
          </p>
        </motion.div>

        {/* Retry button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button onClick={onRetry} variant="outline" size="lg" className="w-full">
            <RotateCcw className="size-4 mr-2" />
            Retry Round
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
