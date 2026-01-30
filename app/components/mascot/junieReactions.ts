// app/components/mascot/junieReactions.ts

export type JunieReactionType =
  | 'round_start'
  | 'catch_cheap'
  | 'catch_expensive'
  | 'catch_powerup'
  | 'four_slots_filled'
  | 'budget_warning'
  | 'round_complete'
  | 'perfect_budget'
  | 'budget_bust'
  | 'time_warning'
  | 'timeout'
  | 'hit_negative'
  | 'game_over_good'
  | 'game_over_bad'
  | 'idle';

export interface JunieReaction {
  emoji: string;
  text: string;
}

export const JUNIE_REACTIONS: Record<JunieReactionType, JunieReaction> = {
  // From REQUIREMENTS.md
  round_start: { emoji: '🐱', text: "Let's gear up!" },
  catch_cheap: { emoji: '😸', text: "That's thrifty!" },
  catch_expensive: { emoji: '😰', text: 'Big spender...' },
  catch_powerup: { emoji: '😺', text: 'Nice find!' },
  four_slots_filled: { emoji: '😼', text: 'One more!' },
  budget_warning: { emoji: '😿', text: 'Watch the budget!' },
  round_complete: { emoji: '😻', text: 'Squad ready!' },
  perfect_budget: { emoji: '🎉', text: 'PERFECT!' },
  budget_bust: { emoji: '🙀', text: 'Over budget!' },
  time_warning: { emoji: '😿', text: 'Hurry up!' },
  timeout: { emoji: '😿', text: 'Too slow...' },
  hit_negative: { emoji: '😾', text: 'Ouch!' },
  game_over_good: { emoji: '😻', text: 'Amazing work!' },
  game_over_bad: { emoji: '😿', text: 'Try again!' },
  idle: { emoji: '🐱', text: '' }, // No speech bubble for idle
};
