"use client";

/**
 * GameOverScreen - Final results with rank reveal and leaderboard submission
 *
 * Features:
 * - Dramatic rank reveal animation
 * - Final score display with glow effect
 * - Name submission form
 * - Victory/defeat states
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from 'motion/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RotateCcw, Trophy, Send, Loader2, Check, Crown, XCircle } from "lucide-react";
import { getRankTitle } from "@/app/lib/scoreCalculator";
import { useLeaderboard } from "@/app/hooks/useLeaderboard";

interface GameOverScreenProps {
  totalScore: number;
  onPlayAgain: () => void;
  onLeaderboard: () => void;
  onScoreSubmitted?: (entryId: string) => void;
  failReason?: 'bust' | 'timeout';
  round?: number;
}

// Rank color mapping
const RANK_COLORS: Record<string, { text: string; bg: string; glow: string }> = {
  S: { text: 'text-warning', bg: 'bg-warning/20', glow: 'shadow-warning/50' },
  A: { text: 'text-success', bg: 'bg-success/20', glow: 'shadow-success/50' },
  B: { text: 'text-c9-blue', bg: 'bg-c9-blue/20', glow: 'shadow-c9-blue/50' },
  C: { text: 'text-jb-purple', bg: 'bg-jb-purple/20', glow: 'shadow-jb-purple/50' },
  D: { text: 'text-warning', bg: 'bg-warning/20', glow: 'shadow-warning/50' },
  F: { text: 'text-val-red', bg: 'bg-val-red/20', glow: 'shadow-val-red/50' },
};

export function GameOverScreen({
  totalScore,
  onPlayAgain,
  onLeaderboard,
  onScoreSubmitted,
  failReason,
  round,
}: GameOverScreenProps) {
  const { rank, title } = getRankTitle(totalScore);
  const { submitScore } = useLeaderboard();
  const rankStyle = RANK_COLORS[rank] || RANK_COLORS.F;

  // Form state
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isVictory = !failReason;

  // Handle score submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || submitted) return;

    // Check for profanity
    const filter = new (await import('bad-words')).Filter();
    if (filter.isProfane(name)) {
      setSubmitError("Please choose an appropriate name");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const entry = await submitScore(name, totalScore);
      if (entry) {
        setSubmitted(true);
        onScoreSubmitted?.(entry.id);
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit score");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid-tactical opacity-30" />

      {/* Main card */}
      <motion.div
        className="glass-panel-solid p-8 max-w-lg w-full relative z-10"
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
            className={`inline-flex items-center gap-2 mb-2 ${isVictory ? 'text-success' : 'text-val-red'}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
          >
            {isVictory ? <Crown className="size-6" /> : <XCircle className="size-6" />}
            <span className="hud-label">{isVictory ? 'Victory' : 'Game Over'}</span>
          </motion.div>

          {failReason && (
            <motion.p
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {failReason === 'bust' && `Budget bust on Round ${round}`}
              {failReason === 'timeout' && `Time ran out on Round ${round}`}
            </motion.p>
          )}
        </div>

        {/* Score display */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="hud-label mb-2">Final Score</p>
          <motion.p
            className="text-5xl font-bold hud-value text-foreground text-glow-subtle"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
          >
            {totalScore.toLocaleString()}
          </motion.p>
        </motion.div>

        {/* Rank reveal */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="hud-label mb-3">Rank</p>
          <div className="flex items-center justify-center gap-4">
            <motion.div
              className={`
                w-20 h-20 rounded-xl flex items-center justify-center
                ${rankStyle.bg} border-2 border-current ${rankStyle.text}
                shadow-lg ${rankStyle.glow}
              `}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.6,
                type: 'spring',
                stiffness: 200,
                damping: 15
              }}
            >
              <span className="text-4xl font-bold">{rank}</span>
            </motion.div>

            <motion.div
              className="text-left"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <p className={`text-xl font-bold ${rankStyle.text}`}>{title}</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Name submission */}
        <motion.div
          className="border-t border-border pt-6 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="submitted"
                className="flex items-center justify-center gap-2 text-success py-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Check className="size-5" />
                <span>Score saved as &quot;{name}&quot;</span>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-sm text-muted-foreground text-center mb-3">
                  Save your score to the leaderboard
                </p>

                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 15))}
                  placeholder="Enter your name"
                  maxLength={15}
                  disabled={submitting}
                  className="text-center"
                />

                <p className="text-xs text-muted-foreground text-center">
                  {name.length}/15 characters
                </p>

                {submitError && (
                  <p className="text-sm text-val-red text-center">{submitError}</p>
                )}

                <Button
                  type="submit"
                  disabled={!name.trim() || submitting}
                  className="w-full"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="size-4 mr-2" />
                      Submit Score
                    </>
                  )}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          className="flex gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Button onClick={onPlayAgain} size="lg" className="flex-1">
            <RotateCcw className="size-4 mr-2" />
            Play Again
          </Button>

          <Button onClick={onLeaderboard} variant="outline" size="lg" className="flex-1">
            <Trophy className="size-4 mr-2" />
            Leaderboard
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
