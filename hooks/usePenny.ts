'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameEvent } from '@/lib/game/types';
import { PENNY, pennyLineFor, type PennyLine } from '@/lib/game/penny';

/** How long a line stays up. Power-up lines explain an effect, so they get longer. */
const LINE_MS = 1800;
const POWER_UP_LINE_MS = 2600;

export interface PennyState {
  /** The line on screen, or null. `id` changes with every new line (for animation keys). */
  line: (PennyLine & { id: number }) | null;
  handleGameEvent: (event: GameEvent) => void;
  triggerRoundStart: () => void;
  triggerFourSlots: () => void;
}

/**
 * Times Penny's lines: each new line replaces the old one and clears itself later. (The
 * hackathon version reset to idle on a fixed timer, which could cut a newer line short.)
 */
export function usePenny(): PennyState {
  const [line, setLine] = useState<PennyState['line']>(null);
  const nextId = useRef(1);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const say = useCallback((next: PennyLine | null) => {
    if (!next) return;
    const id = nextId.current++;
    setLine({ ...next, id });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setLine((current) => (current?.id === id ? null : current)), next.powerUp ? POWER_UP_LINE_MS : LINE_MS);
  }, []);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const handleGameEvent = useCallback((event: GameEvent) => say(pennyLineFor(event)), [say]);
  const triggerRoundStart = useCallback(() => say(PENNY.roundStart), [say]);
  const triggerFourSlots = useCallback(() => say(PENNY.fourSlots), [say]);

  return { line, handleGameEvent, triggerRoundStart, triggerFourSlots };
}
