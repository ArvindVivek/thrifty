'use client';

/**
 * LeaderboardScreen - Top 100 scores with medal rankings
 *
 * Features:
 * - Gold/Silver/Bronze medals for top 3
 * - Current player highlight
 * - Staggered list animation
 * - Loading and error states
 */

import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Loader2 } from 'lucide-react';
import { useLeaderboard } from '@/app/hooks/useLeaderboard';

interface LeaderboardScreenProps {
  onBack: () => void;
  highlightEntryId?: string | null;
}

// Medal colors for top 3
const MEDAL_STYLES = {
  1: { color: 'text-warning', bg: 'bg-warning/20', label: '1st' },
  2: { color: 'text-gray-300', bg: 'bg-gray-300/20', label: '2nd' },
  3: { color: 'text-amber-600', bg: 'bg-amber-600/20', label: '3rd' },
} as const;

export function LeaderboardScreen({ onBack, highlightEntryId }: LeaderboardScreenProps) {
  const { entries, loading, error } = useLeaderboard(100);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid-tactical opacity-30" />

      {/* Main card */}
      <motion.div
        className="glass-panel-solid p-6 max-w-lg w-full relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Tactical corners */}
        <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-c9-blue" />
        <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-c9-blue" />
        <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-c9-blue" />
        <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-c9-blue" />

        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            className="inline-flex items-center gap-3 mb-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Trophy className="size-7 text-warning" />
            <h1 className="text-2xl font-bold text-c9-blue">Leaderboard</h1>
          </motion.div>
          <p className="text-sm text-muted-foreground">Top 100 Thrifty Champions</p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-8 text-c9-blue animate-spin" />
            <span className="ml-3 text-muted-foreground">Loading scores...</span>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-val-red mb-2">{error}</p>
            <p className="text-sm text-muted-foreground">Check your connection and try again</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-2">No scores yet!</p>
            <p className="text-sm text-muted-foreground">Be the first to set a high score</p>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto -mx-2 px-2">
            {/* Header row */}
            <div className="grid grid-cols-[60px_1fr_100px] gap-2 px-3 py-2 text-sm hud-label border-b border-border sticky top-0 bg-card z-10">
              <span>Rank</span>
              <span>Name</span>
              <span className="text-right">Score</span>
            </div>

            {/* Entries */}
            {entries.map((entry, index) => {
              const rank = index + 1;
              const isHighlighted = entry.id === highlightEntryId;
              const medalStyle = MEDAL_STYLES[rank as keyof typeof MEDAL_STYLES];

              return (
                <motion.div
                  key={entry.id}
                  className={`
                    grid grid-cols-[60px_1fr_100px] gap-2 px-3 py-3
                    border-b border-border/50 transition-colors
                    ${isHighlighted
                      ? 'bg-c9-blue/10 border-c9-blue/30'
                      : 'hover:bg-secondary/50'
                    }
                  `}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(index * 0.02, 0.5) }}
                >
                  {/* Rank */}
                  <div className="flex items-center">
                    {medalStyle ? (
                      <span className={`
                        inline-flex items-center justify-center
                        w-8 h-8 rounded-lg text-sm font-bold
                        ${medalStyle.bg} ${medalStyle.color}
                      `}>
                        {rank}
                      </span>
                    ) : (
                      <span className="text-muted-foreground font-mono pl-2">
                        #{rank}
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <div className="flex items-center min-w-0">
                    <span className={`truncate ${isHighlighted ? 'text-c9-blue font-medium' : 'text-foreground'}`}>
                      {entry.name}
                    </span>
                    {isHighlighted && (
                      <span className="ml-2 text-xs text-c9-blue/70">(You)</span>
                    )}
                  </div>

                  {/* Score */}
                  <span className={`text-right hud-value ${isHighlighted ? 'text-c9-blue' : 'text-muted-foreground'}`}>
                    {entry.score.toLocaleString()}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Back button */}
        <motion.div
          className="mt-6 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button onClick={onBack} variant="outline" size="lg">
            <ArrowLeft className="size-4 mr-2" />
            Back to Menu
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
