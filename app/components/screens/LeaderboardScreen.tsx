'use client';

/**
 * LeaderboardScreen - Displays top 100 scores with realtime updates
 *
 * Features:
 * - Shows rank, name, score for each entry
 * - Highlights current player's submitted score
 * - Loading and error states
 * - Back button to return to menu
 * - Responsive scrollable list
 */

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Loader2 } from 'lucide-react';
import { useLeaderboard } from '@/app/hooks/useLeaderboard';

interface LeaderboardScreenProps {
  onBack: () => void;
  highlightEntryId?: string | null;  // ID of current player's submitted score
}

export function LeaderboardScreen({ onBack, highlightEntryId }: LeaderboardScreenProps) {
  const { entries, loading, error } = useLeaderboard(100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-6 animate-in fade-in duration-500">
      <Card className="max-w-lg w-full bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Trophy className="size-8 text-yellow-500" />
            <CardTitle className="text-3xl text-yellow-500">
              Leaderboard
            </CardTitle>
          </div>
          <p className="text-sm text-gray-400">Top 100 Thrifty Champions</p>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-8 text-blue-400 animate-spin" />
              <span className="ml-3 text-gray-400">Loading scores...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <p className="text-sm text-gray-500">Check your connection and try again</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-2">No scores yet!</p>
              <p className="text-sm text-gray-500">Be the first to set a high score</p>
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto">
              {/* Header row */}
              <div className="grid grid-cols-[50px_1fr_100px] gap-2 px-3 py-2 text-sm text-gray-500 border-b border-gray-700 sticky top-0 bg-gray-800">
                <span>Rank</span>
                <span>Name</span>
                <span className="text-right">Score</span>
              </div>

              {/* Entries */}
              {entries.map((entry, index) => {
                const isHighlighted = entry.id === highlightEntryId;
                const rank = index + 1;

                // Medal colors for top 3
                const rankColor = rank === 1 ? 'text-yellow-500' :
                                  rank === 2 ? 'text-gray-300' :
                                  rank === 3 ? 'text-amber-600' :
                                  'text-gray-400';

                return (
                  <div
                    key={entry.id}
                    className={`grid grid-cols-[50px_1fr_100px] gap-2 px-3 py-3 border-b border-gray-700/50 transition-colors ${
                      isHighlighted
                        ? 'bg-blue-900/30 border-blue-500/50'
                        : 'hover:bg-gray-700/30'
                    }`}
                  >
                    <span className={`font-bold ${rankColor}`}>
                      #{rank}
                    </span>
                    <span className={`truncate ${isHighlighted ? 'text-blue-300 font-medium' : 'text-white'}`}>
                      {entry.name}
                      {isHighlighted && <span className="text-xs text-blue-400 ml-2">(You)</span>}
                    </span>
                    <span className={`text-right font-mono ${isHighlighted ? 'text-blue-300' : 'text-gray-300'}`}>
                      {entry.score.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center pt-4">
          <Button onClick={onBack} variant="outline" size="lg" className="gap-2">
            <ArrowLeft className="size-4" />
            Back to Menu
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
