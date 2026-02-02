/**
 * Valorant Items Database
 *
 * Real Valorant weapons and gear with authentic prices.
 * Images sourced from valorant-api.com
 */

export type ValorantCategory = 'sidearm' | 'smg' | 'shotgun' | 'rifle' | 'sniper' | 'heavy' | 'shield';

export interface ValorantItem {
  id: string;
  name: string;
  category: ValorantCategory;
  cost: number;
  image: string;
  value: number; // Base point value
}

/**
 * All Valorant items with their real in-game prices
 */
export const VALORANT_ITEMS: ValorantItem[] = [
  // === SIDEARMS ===
  { id: 'shorty', name: 'Shorty', category: 'sidearm', cost: 300, image: '/assets/weapons/shorty.png', value: 150 },
  { id: 'frenzy', name: 'Frenzy', category: 'sidearm', cost: 450, image: '/assets/weapons/frenzy.png', value: 225 },
  { id: 'ghost', name: 'Ghost', category: 'sidearm', cost: 500, image: '/assets/weapons/ghost.png', value: 250 },
  { id: 'sheriff', name: 'Sheriff', category: 'sidearm', cost: 800, image: '/assets/weapons/sheriff.png', value: 400 },

  // === SMGs ===
  { id: 'stinger', name: 'Stinger', category: 'smg', cost: 1100, image: '/assets/weapons/stinger.png', value: 550 },
  { id: 'spectre', name: 'Spectre', category: 'smg', cost: 1600, image: '/assets/weapons/spectre.png', value: 800 },

  // === SHOTGUNS ===
  { id: 'bucky', name: 'Bucky', category: 'shotgun', cost: 850, image: '/assets/weapons/bucky.png', value: 425 },
  { id: 'judge', name: 'Judge', category: 'shotgun', cost: 1850, image: '/assets/weapons/judge.png', value: 925 },

  // === RIFLES ===
  { id: 'bulldog', name: 'Bulldog', category: 'rifle', cost: 2050, image: '/assets/weapons/bulldog.png', value: 1025 },
  { id: 'guardian', name: 'Guardian', category: 'rifle', cost: 2250, image: '/assets/weapons/guardian.png', value: 1125 },
  { id: 'phantom', name: 'Phantom', category: 'rifle', cost: 2900, image: '/assets/weapons/phantom.png', value: 1450 },
  { id: 'vandal', name: 'Vandal', category: 'rifle', cost: 2900, image: '/assets/weapons/vandal.png', value: 1450 },

  // === SNIPERS ===
  { id: 'marshal', name: 'Marshal', category: 'sniper', cost: 950, image: '/assets/weapons/marshal.png', value: 475 },
  { id: 'outlaw', name: 'Outlaw', category: 'sniper', cost: 2400, image: '/assets/weapons/outlaw.png', value: 1200 },
  { id: 'operator', name: 'Operator', category: 'sniper', cost: 4700, image: '/assets/weapons/operator.png', value: 2350 },

  // === HEAVY ===
  { id: 'ares', name: 'Ares', category: 'heavy', cost: 1600, image: '/assets/weapons/ares.png', value: 800 },
  { id: 'odin', name: 'Odin', category: 'heavy', cost: 3200, image: '/assets/weapons/odin.png', value: 1600 },

  // === SHIELDS ===
  { id: 'light_armor', name: 'Light Shield', category: 'shield', cost: 400, image: '/assets/shields/light_armor.png', value: 200 },
  { id: 'regen_shield', name: 'Regen Shield', category: 'shield', cost: 650, image: '/assets/shields/regen_shield.png', value: 325 },
  { id: 'heavy_armor', name: 'Heavy Shield', category: 'shield', cost: 1000, image: '/assets/shields/heavy_armor.png', value: 500 },
];

/**
 * Category display colors for UI
 */
export const CATEGORY_COLORS: Record<ValorantCategory, { bg: string; border: string; text: string }> = {
  sidearm: { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-400' },
  smg: { bg: 'bg-green-500/20', border: 'border-green-500/50', text: 'text-green-400' },
  shotgun: { bg: 'bg-orange-500/20', border: 'border-orange-500/50', text: 'text-orange-400' },
  rifle: { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-400' },
  sniper: { bg: 'bg-purple-500/20', border: 'border-purple-500/50', text: 'text-purple-400' },
  heavy: { bg: 'bg-blue-500/20', border: 'border-blue-500/50', text: 'text-blue-400' },
  shield: { bg: 'bg-cyan-500/20', border: 'border-cyan-500/50', text: 'text-cyan-400' },
};

/**
 * Get items filtered by max cost (for budget-appropriate spawning)
 */
export function getItemsUnderCost(maxCost: number): ValorantItem[] {
  return VALORANT_ITEMS.filter(item => item.cost <= maxCost);
}

/**
 * Get a random item appropriate for the current budget
 */
export function getRandomItem(maxCost: number): ValorantItem | null {
  const availableItems = getItemsUnderCost(maxCost);
  if (availableItems.length === 0) return null;
  return availableItems[Math.floor(Math.random() * availableItems.length)];
}

/**
 * Get items by category
 */
export function getItemsByCategory(category: ValorantCategory): ValorantItem[] {
  return VALORANT_ITEMS.filter(item => item.category === category);
}
