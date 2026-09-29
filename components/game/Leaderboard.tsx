'use client';

/**
 * The public leaderboard: best scores first, the player's own row marked "You". Loading,
 * empty ("Be the first on the board") and unreachable states each get a friendly screen;
 * the game never depends on any of them.
 */

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Play, RefreshCw, Trophy } from 'lucide-react';
import { Badge, Button, Card, EmptyState, ErrorState, Icon, Skeleton } from '@/components/kl';
import { cn } from '@/lib/kl/cn';
import { fadeUp } from '@/lib/kl/motion';
import { BOARD_SIZE, fetchLeaderboard, type LeaderboardEntry } from '@/lib/leaderboard';
import { points } from './visuals';

type BoardState =
  | { status: 'loading' }
  | { status: 'ready'; entries: LeaderboardEntry[] }
  | { status: 'error'; message: string };

export function useLeaderboard() {
  const [state, setState] = useState<BoardState>({ status: 'loading' });
  const load = useCallback(async () => {
    setState({ status: 'loading' });
    const result = await fetchLeaderboard();
    setState(result.ok ? { status: 'ready', entries: result.entries } : { status: 'error', message: result.message });
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading data on mount
    void load();
  }, [load]);
  return { state, reload: load };
}

/** "Sep 29", in the viewer's own time zone; the full date and time on hover or long-press. */
const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const longDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' });

const MEDALS = [
  'bg-warning-soft text-warning-text', // 1st
  'bg-surface-2 text-ink', // 2nd
  'bg-[var(--aisle-snack-soft)] text-[var(--aisle-snack)]', // 3rd
];

function Row({ entry, rank, isYou, index }: { entry: LeaderboardEntry; rank: number; isYou: boolean; index: number }) {
  const created = new Date(entry.createdAt);
  return (
    <motion.li
      {...fadeUp(index, 6)}
      className={cn('grid grid-cols-[2.75rem_1fr_auto] items-center gap-3 rounded-md px-3 py-2.5', isYou ? 'bg-accent-soft' : 'odd:bg-surface-2/60')}
      data-testid="board-row"
      data-entry-id={entry.id}
    >
      <span
        className={cn(
          'tabular relative flex size-9 items-center justify-center rounded-full font-display text-[16px]',
          rank <= 3 ? MEDALS[rank - 1] : 'text-ink-2'
        )}
      >
        <span className="sr-only">Rank </span>
        {rank}
      </span>
      <span className="flex min-w-0 items-center gap-2">
        <span className={cn('truncate font-bold', isYou ? 'text-accent-text' : 'text-ink')}>{entry.displayName}</span>
        {isYou && <Badge tone="accent">You</Badge>}
      </span>
      <span className="flex flex-col items-end">
        <span className="tabular font-display text-title3 leading-tight text-ink">{points(entry.score)}</span>
        <time dateTime={entry.createdAt} title={longDate.format(created)} className="text-[13px] text-ink-2">
          {shortDate.format(created)}
        </time>
      </span>
    </motion.li>
  );
}

export function LeaderboardBoard({
  highlightId,
  onPlay,
  playHref,
}: {
  highlightId?: string | null;
  onPlay?: () => void;
  playHref?: string;
}) {
  const { state, reload } = useLeaderboard();

  return (
    <Card padding="lg" className="w-full" aria-busy={state.status === 'loading'}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-full bg-warning-soft text-warning-text">
            <Icon icon={Trophy} size={22} />
          </span>
          <div>
            <h2 className="text-title2 text-ink">Leaderboard</h2>
            <p className="text-[15px] text-ink-2">Top {BOARD_SIZE} scores from every player</p>
          </div>
        </div>
        {state.status === 'ready' && (
          <Button variant="ghost" size="sm" icon={RefreshCw} onClick={() => void reload()} aria-label="Refresh the leaderboard">
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        )}
      </div>

      {state.status === 'loading' && (
        <ul className="flex flex-col gap-2" aria-label="Loading scores">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="flex items-center gap-3 px-3 py-2.5">
              <Skeleton className="size-9 rounded-full" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-5 w-16" />
            </li>
          ))}
        </ul>
      )}

      {state.status === 'error' && (
        <ErrorState title="The board is taking a break" message={state.message} onRetry={() => void reload()} />
      )}

      {state.status === 'ready' && state.entries.length === 0 && (
        <EmptyState
          icon={Trophy}
          title="Be the first on the board"
          message="No scores yet. Finish a game and save yours."
          action={
            onPlay || playHref ? (
              <Button icon={Play} {...(playHref ? { href: playHref } : { onClick: onPlay })}>
                Play now
              </Button>
            ) : undefined
          }
        />
      )}

      {state.status === 'ready' && state.entries.length > 0 && (
        <ol className="flex flex-col gap-1" aria-label="Top scores">
          {state.entries.map((entry, i) => (
            <Row key={entry.id} entry={entry} rank={i + 1} index={i} isYou={entry.id === highlightId} />
          ))}
        </ol>
      )}
    </Card>
  );
}
