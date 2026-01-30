'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useJunieReactions } from '@/app/hooks/useJunieReactions';
import { JunieReactionType } from '@/app/components/mascot';
import { GameEvent } from '@/app/lib/types';

interface JunieContextValue {
  reaction: JunieReactionType;
  triggerRoundStart: () => void;
  triggerFourSlots: () => void;
  triggerGameOver: (score: number) => void;
  handleGameEvent: (event: GameEvent) => void;
}

const JunieContext = createContext<JunieContextValue | null>(null);

export function useJunieContext() {
  const ctx = useContext(JunieContext);
  if (!ctx) throw new Error('useJunieContext must be used within JunieProvider');
  return ctx;
}

export function JunieProvider({ children }: { children: ReactNode }) {
  const junieState = useJunieReactions();
  return (
    <JunieContext.Provider value={junieState}>
      {children}
    </JunieContext.Provider>
  );
}
