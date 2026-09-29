'use client';

/**
 * Between rounds and at the end: the round's score breakdown, and the final result with the
 * form that saves a score to the public leaderboard.
 */

import { useMemo, useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, CircleCheck, Clock, Crown, PiggyBank, RotateCcw, Save, Trophy, Wallet } from 'lucide-react';
import { Badge, Button, Card, Field, Icon, Input } from '@/components/kl';
import { cn } from '@/lib/kl/cn';
import { fadeUp, popIn } from '@/lib/kl/motion';
import type { ScoreResult } from '@/lib/game/scoreCalculator';
import { getRankTitle } from '@/lib/game/scoreCalculator';
import { ROUND_CONFIG, TOTAL_ROUNDS } from '@/lib/game/constants';
import { pennyVerdict } from '@/lib/game/penny';
import { NAME_MAX_LENGTH, nameProblem, submitScore, type ScoreSubmission } from '@/lib/leaderboard';
import { points } from './visuals';

// ---------------------------------------------------------------------------------------------
// Confetti: a short burst of shop-coloured bits (skipped under Reduce Motion by MotionConfig)
// ---------------------------------------------------------------------------------------------

const CONFETTI_COLORS = ['var(--accent)', 'var(--aisle-snack)', 'var(--aisle-style)', 'var(--aisle-home)', 'var(--aisle-tech)', 'var(--warning)'];

/** A tiny seeded generator, so the burst renders the same on every render (pure). */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

function Confetti({ seed }: { seed: number }) {
  const bits = useMemo(() => {
    const rand = seeded(seed);
    return Array.from({ length: 36 }, (_, i) => ({
      id: i,
      left: rand() * 100,
      delay: rand() * 0.3,
      drift: (rand() - 0.5) * 160,
      spin: (rand() - 0.5) * 720,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      round: rand() > 0.5,
    }));
  }, [seed]);
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden>
      {bits.map((b) => (
        <motion.span
          key={b.id}
          className={cn('absolute top-0 block size-2.5', b.round ? 'rounded-full' : 'rounded-[2px]')}
          style={{ left: `${b.left}%`, background: b.color }}
          initial={{ y: -20, x: 0, rotate: 0, opacity: 1 }}
          animate={{ y: '105vh', x: b.drift, rotate: b.spin, opacity: [1, 1, 0] }}
          transition={{ duration: 2.4, delay: b.delay, ease: [0.3, 0.6, 0.6, 1] }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Round complete
// ---------------------------------------------------------------------------------------------

function Line({ label, detail, value, index }: { label: string; detail?: string; value: string; index: number }) {
  return (
    <motion.div {...fadeUp(index, 6)} className="flex items-baseline justify-between gap-3 py-1">
      <span className="min-w-0">
        <span className="font-bold text-ink">{label}</span>
        {detail && <span className="ml-1.5 text-[15px] text-ink-2">{detail}</span>}
      </span>
      <span className="tabular font-display text-title3 text-ink">{value}</span>
    </motion.div>
  );
}

export function RoundCompleteScreen({
  round,
  score,
  totalScore,
  onNextRound,
}: {
  round: number;
  score: ScoreResult;
  totalScore: number;
  onNextRound: () => void;
}) {
  const moneyLeft = score.budgetBonus / 2;
  const secondsLeft = (score.timeBonus / 30).toFixed(1).replace(/\.0$/, '');
  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-8">
      <Confetti seed={round * 7919 + score.totalScore} />
      <Card padding="lg" className="w-full max-w-md">
        <motion.div {...popIn()} className="flex items-center gap-2 text-success-text">
          <Icon icon={CircleCheck} size={22} />
          <span className="text-[13px] font-bold uppercase tracking-wide">Round {round} cleared</span>
        </motion.div>
        <h1 className="mt-1 text-large text-ink">{ROUND_CONFIG[round - 1]?.name ?? `Round ${round}`}</h1>

        <div className="mt-4 divide-y divide-line">
          <Line index={0} label="Base" value={points(score.baseScore)} />
          <Line index={1} label="Your cart" detail="points of what you caught" value={`+${points(score.itemValue)}`} />
          <Line index={2} label="Money left" detail={`$${points(moneyLeft)} x 2`} value={`+${points(score.budgetBonus)}`} />
          <Line index={3} label="Time left" detail={`${secondsLeft} s x 30`} value={`+${points(score.timeBonus)}`} />
        </div>

        {score.combos.length > 0 && (
          <div className="mt-4">
            <h2 className="text-[13px] font-bold uppercase tracking-wide text-ink-2">Bonuses</h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {score.combos.map((combo, i) => (
                <motion.li key={combo.name} {...popIn(0.3 + i * 0.08)} className="rounded-full bg-accent-soft px-3 py-1 font-bold text-accent-text">
                  {combo.name} <span className="tabular">x{combo.multiplier.toFixed(1)}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-5 rounded-md bg-surface-2 px-4 py-3">
          <div className="flex items-baseline justify-between">
            <span className="font-bold text-ink">Round score</span>
            <span className="tabular font-display text-number text-ink" data-testid="round-score">
              {points(score.totalScore)}
            </span>
          </div>
          {score.multiplier > 1 && (
            <p className="text-right text-[15px] text-ink-2">
              after x{score.multiplier.toFixed(2).replace(/0$/, '')} in bonuses
            </p>
          )}
          <div className="mt-1 flex items-baseline justify-between text-[15px] text-ink-2">
            <span>Total so far</span>
            <span className="tabular font-bold text-ink">{points(totalScore)}</span>
          </div>
        </div>

        <Button className="mt-5" size="lg" fullWidth iconRight={ArrowRight} onClick={onNextRound} autoFocus>
          {round < TOTAL_ROUNDS ? `Start round ${round + 1}` : 'See results'}
        </Button>
      </Card>
    </main>
  );
}

// ---------------------------------------------------------------------------------------------
// Game over
// ---------------------------------------------------------------------------------------------

const RANK_TONES: Record<string, string> = {
  S: 'bg-warning-soft text-warning-text ring-warning',
  A: 'bg-success-soft text-success-text ring-success',
  B: 'bg-accent-soft text-accent-text ring-accent',
  C: 'bg-[var(--aisle-tech-soft)] text-ink ring-[var(--aisle-tech)]',
  D: 'bg-surface-2 text-ink ring-line',
  F: 'bg-danger-soft text-danger-text ring-danger',
};

type SaveState = { status: 'idle' } | { status: 'saving' } | { status: 'saved'; id: string; name: string } | { status: 'failed'; message: string };

function SaveScoreForm({
  submission,
  savedId,
  onSaved,
}: {
  submission: Omit<ScoreSubmission, 'displayName'>;
  /** Set once this game's score is saved (survives a trip to the leaderboard and back). */
  savedId?: string | null;
  onSaved: (id: string) => void;
}) {
  const [name, setName] = useState('');
  const [touched, setTouched] = useState(false);
  const [save, setSave] = useState<SaveState>(savedId ? { status: 'saved', id: savedId, name: '' } : { status: 'idle' });
  const problem = nameProblem(name);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (problem || save.status === 'saving') return;
    setSave({ status: 'saving' });
    const result = await submitScore({ ...submission, displayName: name });
    if (result.ok) {
      setSave({ status: 'saved', id: result.id, name: name.trim() });
      onSaved(result.id);
    } else {
      setSave({ status: 'failed', message: result.message });
    }
  }

  if (save.status === 'saved') {
    return (
      <p className="flex items-center gap-2 rounded-md bg-success-soft px-4 py-3 font-bold text-success-text" role="status">
        <Icon icon={CircleCheck} size={20} />
        {save.name ? <>Saved to the board as &ldquo;{save.name}&rdquo;</> : 'Your score is on the board.'}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
      <Field
        label="Your name on the board"
        hint={`Up to ${NAME_MAX_LENGTH} letters or numbers. Everyone can see it with your score.`}
        error={(touched && problem) || (save.status === 'failed' ? save.message : null)}
      >
        <Input
          value={name}
          onChange={(e) => {
            setName(e.target.value.slice(0, NAME_MAX_LENGTH + 5));
            if (save.status === 'failed') setSave({ status: 'idle' });
          }}
          onBlur={() => setTouched(name.length > 0)}
          maxLength={NAME_MAX_LENGTH + 5}
          autoComplete="nickname"
          placeholder="e.g. Penny"
          disabled={save.status === 'saving'}
        />
      </Field>
      <Button type="submit" icon={Save} loading={save.status === 'saving'} fullWidth>
        {save.status === 'saving' ? 'Saving' : 'Save my score'}
      </Button>
    </form>
  );
}

export function GameOverScreen({
  totalScore,
  failReason,
  round,
  roundsCleared,
  playMs,
  savedId,
  onPlayAgain,
  onLeaderboard,
  onScoreSubmitted,
}: {
  totalScore: number;
  failReason?: 'bust' | 'timeout';
  round: number;
  roundsCleared: number;
  playMs: number;
  savedId?: string | null;
  onPlayAgain: () => void;
  onLeaderboard: () => void;
  onScoreSubmitted?: (entryId: string) => void;
}) {
  const { rank, title } = getRankTitle(totalScore);
  const won = !failReason;
  const headline = won ? 'You cleared all 3 rounds!' : failReason === 'bust' ? `Over budget in round ${round}` : `Out of time in round ${round}`;
  const HeadIcon = won ? Crown : failReason === 'bust' ? Wallet : Clock;
  const penny = pennyVerdict(totalScore, won);

  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-8">
      {won && <Confetti seed={totalScore + 17} />}
      <Card padding="lg" className="w-full max-w-md">
        <motion.p {...popIn()} className={cn('flex items-center gap-2 font-bold', won ? 'text-success-text' : 'text-danger-text')}>
          <Icon icon={HeadIcon} size={22} />
          {headline}
        </motion.p>

        <div className="mt-4 flex items-center gap-4">
          <motion.div
            {...popIn(0.15)}
            className={cn('flex size-20 shrink-0 items-center justify-center rounded-xl font-display text-hero ring-4', RANK_TONES[rank] ?? RANK_TONES.F)}
            aria-label={`Rank ${rank}`}
          >
            {rank}
          </motion.div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold uppercase tracking-wide text-ink-2">Final score</p>
            <p className="tabular font-display text-hero leading-none text-ink" data-testid="final-score">
              {points(totalScore)}
            </p>
            <p className="mt-1 font-bold text-ink">{title}</p>
          </div>
        </div>

        <p className="mt-4 flex items-center gap-2 text-[15px] text-ink-2">
          <Icon icon={PiggyBank} size={18} className="text-accent-text" />
          <span>
            <span className="font-bold text-ink">Penny the piggy bank:</span> {penny.text}
          </span>
        </p>

        <div className="mt-5 border-t border-line pt-5">
          <h2 className="mb-3 flex items-center gap-2 text-title3 text-ink">
            <Icon icon={Trophy} size={20} className="text-accent-text" />
            Save to the leaderboard
            {roundsCleared > 0 && <Badge tone="accent">{roundsCleared} {roundsCleared === 1 ? 'round' : 'rounds'}</Badge>}
          </h2>
          <SaveScoreForm
            submission={{ score: totalScore, roundsCleared, playMs }}
            savedId={savedId}
            onSaved={(id) => onScoreSubmitted?.(id)}
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button size="lg" icon={RotateCcw} onClick={onPlayAgain}>
            Play again
          </Button>
          <Button size="lg" variant="secondary" icon={Trophy} onClick={onLeaderboard}>
            Leaderboard
          </Button>
        </div>
      </Card>
    </main>
  );
}
