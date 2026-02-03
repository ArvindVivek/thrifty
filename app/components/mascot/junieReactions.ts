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
  image: string;  // Changed from emoji to image path
  text: string;
}

export const JUNIE_REACTIONS: Record<JunieReactionType, JunieReaction> = {
  round_start: { image: '/kodee/kodee-pleased.png', text: "Let's gear up!" },
  catch_cheap: { image: '/kodee/kodee-excited.png', text: "That's thrifty!" },
  catch_expensive: { image: '/kodee/kodee-shocked.png', text: 'Big spender...' },
  catch_powerup: { image: '/kodee/kodee-surprised.png', text: 'Nice find!' },
  four_slots_filled: { image: '/kodee/kodee-naughty.png', text: 'One more!' },
  budget_warning: { image: '/kodee/kodee-frustrated.png', text: 'Watch the budget!' },
  round_complete: { image: '/kodee/kodee-loving.png', text: 'Squad ready!' },
  perfect_budget: { image: '/kodee/kodee-excited.png', text: 'PERFECT!' },
  budget_bust: { image: '/kodee/kodee-angry.png', text: 'Over budget!' },
  time_warning: { image: '/kodee/kodee-frightened.png', text: 'Hurry up!' },
  timeout: { image: '/kodee/kodee-sad.png', text: 'Too slow...' },
  hit_negative: { image: '/kodee/kodee-grumpy.png', text: 'Ouch!' },
  game_over_good: { image: '/kodee/kodee-welcoming.png', text: 'Amazing work!' },
  game_over_bad: { image: '/kodee/kodee-broken-hearted.png', text: 'Try again!' },
  idle: { image: '/kodee/kodee-pleased.png', text: '' },
};
