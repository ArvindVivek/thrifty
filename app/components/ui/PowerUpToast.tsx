/**
 * Power-up toast notification helpers
 * Shows clear visual feedback when power-ups are activated
 */

import { toast } from 'sonner';
import Image from 'next/image';
import type { PowerUpType } from '@/app/lib/types';

interface PowerUpInfo {
  name: string;
  effect: string;
  image: string;
  isPositive: boolean;
}

const POWER_UP_INFO: Record<PowerUpType, PowerUpInfo> = {
  slow_motion: {
    name: 'Slow Motion',
    effect: 'Items fall 50% slower for 5s',
    image: '/assets/powerups/slow_motion.svg',
    isPositive: true,
  },
  budget_boost: {
    name: 'Budget Boost',
    effect: '+$500 to your budget',
    image: '/assets/powerups/budget_boost.svg',
    isPositive: true,
  },
  optimal_hint: {
    name: 'Optimal Hint',
    effect: 'Best items highlighted for 4s',
    image: '/assets/powerups/optimal_hint.svg',
    isPositive: true,
  },
  time_freeze: {
    name: 'Time Freeze',
    effect: 'Timer paused for 3s',
    image: '/assets/powerups/time_freeze.svg',
    isPositive: true,
  },
  score_multiplier: {
    name: '2x Score',
    effect: 'Next catch worth double points',
    image: '/assets/powerups/score_multiplier.svg',
    isPositive: true,
  },
  budget_drain: {
    name: 'Budget Drain',
    effect: '-$300 from your budget',
    image: '/assets/powerups/budget_drain.svg',
    isPositive: false,
  },
  speed_up: {
    name: 'Speed Up',
    effect: 'Items fall 50% faster for 4s',
    image: '/assets/powerups/speed_up.svg',
    isPositive: false,
  },
  slot_lock: {
    name: 'Slot Lock',
    effect: 'One slot locked for 5s',
    image: '/assets/powerups/slot_lock.svg',
    isPositive: false,
  },
  point_drain: {
    name: 'Point Drain',
    effect: '-200 points from your score',
    image: '/assets/powerups/point_drain.svg',
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
      <div className="w-10 h-10 flex-shrink-0">
        <Image
          src={info.image}
          alt={info.name}
          width={40}
          height={40}
          className="object-contain"
          unoptimized
        />
      </div>
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
