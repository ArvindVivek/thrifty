'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { usePenny, type PennyState } from '@/hooks/usePenny';

/** Penny's current line, shared by the page (which feeds her game events) and the game screens. */
const PennyContext = createContext<PennyState | null>(null);

export function usePennyContext(): PennyState {
  const ctx = useContext(PennyContext);
  if (!ctx) throw new Error('usePennyContext must be used within PennyProvider');
  return ctx;
}

export function PennyProvider({ children }: { children: ReactNode }) {
  const penny = usePenny();
  return <PennyContext.Provider value={penny}>{children}</PennyContext.Provider>;
}
