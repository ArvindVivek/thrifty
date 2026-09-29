// How game things look: one lucide icon per shop item and power-up, and each aisle's colours.
// lucide-react (ISC) is the only icon set (docs/CREDITS.md); no images to license.
import {
  Apple,
  Armchair,
  Backpack,
  Bike,
  Camera,
  CircleArrowDown,
  Coffee,
  Coins,
  Cookie,
  Flame,
  Gamepad2,
  Glasses,
  Headphones,
  Lamp,
  Laptop,
  Lightbulb,
  Lock,
  Pizza,
  Shirt,
  Snail,
  Snowflake,
  Sofa,
  Sparkles,
  Sprout,
  Tablet,
  Tv,
  WashingMachine,
  Watch,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { ItemCategory, PowerUpType } from '@/lib/game/types';

export const ITEM_ICONS: Record<string, LucideIcon> = {
  apple: Apple,
  cookie: Cookie,
  coffee: Coffee,
  pizza: Pizza,
  shirt: Shirt,
  glasses: Glasses,
  backpack: Backpack,
  plant: Sprout,
  lamp: Lamp,
  armchair: Armchair,
  bike: Bike,
  sofa: Sofa,
  washer: WashingMachine,
  headphones: Headphones,
  watch: Watch,
  camera: Camera,
  console: Gamepad2,
  tablet: Tablet,
  laptop: Laptop,
  tv: Tv,
};

export const POWER_UP_ICONS: Record<PowerUpType, LucideIcon> = {
  slow_motion: Snail,
  budget_boost: Coins,
  optimal_hint: Lightbulb,
  time_freeze: Snowflake,
  score_multiplier: Sparkles,
  budget_drain: Flame,
  speed_up: Zap,
  slot_lock: Lock,
  point_drain: CircleArrowDown,
};

/** Aisle colours as CSS variables (app/globals.css), for inline styles. */
export const AISLE_COLORS: Record<ItemCategory, { icon: string; tile: string }> = {
  snack: { icon: 'var(--aisle-snack)', tile: 'var(--aisle-snack-soft)' },
  style: { icon: 'var(--aisle-style)', tile: 'var(--aisle-style-soft)' },
  home: { icon: 'var(--aisle-home)', tile: 'var(--aisle-home-soft)' },
  tech: { icon: 'var(--aisle-tech)', tile: 'var(--aisle-tech-soft)' },
};

/** "$1,600": whole dollars with a thousands separator, the same on server and client. */
export function money(amount: number): string {
  const sign = amount < 0 ? '-' : '';
  return `${sign}$${Math.abs(Math.round(amount)).toLocaleString('en-US')}`;
}

/** "12,345" */
export function points(amount: number): string {
  return Math.round(amount).toLocaleString('en-US');
}
