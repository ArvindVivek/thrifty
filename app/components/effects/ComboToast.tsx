import { toast } from 'sonner';
import { ComboBonus } from '@/app/lib/scoreCalculator';

/**
 * Show a toast notification for a combo achievement.
 * Uses Sonner which is already installed.
 */
export function showComboToast(combo: ComboBonus) {
  toast.success(combo.name, {
    description: `x${combo.multiplier.toFixed(1)} multiplier!`,
    duration: 2000,
    position: 'top-center',
  });
}

/**
 * Show toast for multiple combos (staggered)
 */
export function showComboToasts(combos: ComboBonus[]) {
  combos.forEach((combo, index) => {
    setTimeout(() => {
      showComboToast(combo);
    }, index * 300); // 300ms stagger between toasts
  });
}
