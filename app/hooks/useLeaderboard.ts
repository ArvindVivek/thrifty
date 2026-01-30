'use client';

/**
 * useLeaderboard - Hook for leaderboard CRUD operations and realtime updates
 *
 * Features:
 * - Fetches top N scores on mount
 * - Subscribes to realtime INSERT events
 * - Provides submitScore with profanity filter
 * - Cleans up subscription on unmount
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { createBrowserClient } from '@/app/lib/supabase/client';
import { LeaderboardEntry } from '@/app/lib/types';
import { Filter } from 'bad-words';

interface UseLeaderboardReturn {
  entries: LeaderboardEntry[];
  loading: boolean;
  error: string | null;
  submitScore: (name: string, score: number) => Promise<LeaderboardEntry | null>;
  refetch: () => Promise<void>;
}

export function useLeaderboard(limit = 100): UseLeaderboardReturn {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const filterRef = useRef(new Filter());

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createBrowserClient();
      const { data, error: fetchError } = await supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(limit);

      if (fetchError) {
        throw fetchError;
      }

      setEntries(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch leaderboard';
      setError(message);
      console.error('Leaderboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  // Initial fetch on mount
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Realtime subscription
  useEffect(() => {
    const supabase = createBrowserClient();

    const channel = supabase
      .channel('thrifty-leaderboard-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'thrifty',
          table: 'leaderboard'
        },
        (payload) => {
          const newEntry = payload.new as LeaderboardEntry;
          setEntries(prev => {
            // Insert and re-sort, then trim to limit
            const updated = [...prev, newEntry]
              .sort((a, b) => b.score - a.score)
              .slice(0, limit);
            return updated;
          });
        }
      )
      .subscribe();

    // Critical: Cleanup to prevent memory leaks (especially with React 18 Strict Mode)
    return () => {
      supabase.removeChannel(channel);
    };
  }, [limit]);

  // Submit score with validation and profanity filter
  const submitScore = useCallback(async (name: string, score: number): Promise<LeaderboardEntry | null> => {
    // Validate name length
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length > 15) {
      throw new Error('Name must be 1-15 characters');
    }

    // Validate score
    if (!Number.isInteger(score) || score < 0) {
      throw new Error('Score must be a non-negative integer');
    }

    // Filter profanity
    const cleanName = filterRef.current.clean(trimmedName);

    try {
      const supabase = createBrowserClient();
      const { data, error: insertError } = await supabase
        .from('leaderboard')
        .insert({ name: cleanName, score })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit score';
      console.error('Score submission error:', err);
      throw new Error(message);
    }
  }, []);

  return {
    entries,
    loading,
    error,
    submitScore,
    refetch: fetchLeaderboard
  };
}
