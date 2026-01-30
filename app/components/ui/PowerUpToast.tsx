/**
 * Power-up toast notification helpers
 * Shows clear visual feedback when power-ups are activated
 */

import { toast } from 'sonner';
import type { PowerUpType } from '@/app/lib/types';

interface PowerUpInfo {
  name: string;
  effect: string;
  icon: string;
  isPositive: boolean;
}

const POWER_UP_INFO: Record<PowerUpType, PowerUpInfo> = {
  slow_motion: {
    name: 'Slow Motion',
    effect: 'Items fall 50% slower for 5s',
    icon: '🐌',
    isPositive: true,
  },
  budget_boost: {
    name: 'Budget Boost',
    effect: '+$500 to your budget',
    icon: '💰',
    isPositive: true,
  },
  optimal_hint: {
    name: 'Optimal Hint',
    effect: 'Best items highlighted for 4s',
    icon: '💡',
    isPositive: true,
  },
  time_freeze: {
    name: 'Time Freeze',
    effect: 'Timer paused for 3s',
    icon: '⏸️',
    isPositive: true,
  },
  score_multiplier: {
    name: '2x Score',
    effect: 'Next catch worth double points',
    icon: '✨',
    isPositive: true,
  },
  budget_drain: {
    name: 'Budget Drain',
    effect: '-$300 from your budget',
    icon: '💸',
    isPositive: false,
  },
  speed_up: {
    name: 'Speed Up',
    effect: 'Items fall 50% faster for 4s',
    icon: '⚡',
    isPositive: false,
  },
  slot_lock: {
    name: 'Slot Lock',
    effect: 'One slot locked for 5s',
    icon: '🔒',
    isPositive: false,
  },
  point_drain: {
    name: 'Point Drain',
    effect: '-200 points from your score',
    icon: '📉',
    isPositive: false,
  },
};

/**
 * Show a toast notification for a power-up activation
 */
export function showPowerUpToast(powerUpType: PowerUpType) {
  const info = POWER_UP_INFO[powerUpType];

  const toastContent = (
    <div className="flex items-center gap-3">
      <span className="text-3xl">{info.icon}</span>
      <div>
        <div className="font-bold">{info.name}</div>
        <div className="text-sm opacity-90">{info.effect}</div>
      </div>
    </div>
  );

  if (info.isPositive) {
    toast.success(toastContent, {
      duration: 2000,
      className: 'bg-green-900 border-green-500',
    });
  } else {
    toast.error(toastContent, {
      duration: 2000,
      className: 'bg-red-900 border-red-500',
    });
  }
}
