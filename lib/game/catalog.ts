/**
 * The shop: every item that can fall, with its price and points.
 *
 * Prices, points and aisle sizes are the hackathon build's (it used a video game's weapons),
 * so the balance is unchanged: points are always half the price, cheap snacks and style
 * items are common, and one big-ticket item can eat most of a round's budget.
 */

import type { ItemCategory } from './types';

export interface CatalogItem {
  id: string;
  name: string;
  category: ItemCategory;
  cost: number;
  value: number; // Base point value
}

export const CATALOG: readonly CatalogItem[] = [
  // Snacks
  { id: 'apple', name: 'Apple', category: 'snack', cost: 300, value: 150 },
  { id: 'cookie', name: 'Cookie', category: 'snack', cost: 450, value: 225 },
  { id: 'coffee', name: 'Coffee', category: 'snack', cost: 500, value: 250 },
  { id: 'pizza', name: 'Pizza', category: 'snack', cost: 800, value: 400 },

  // Style
  { id: 'shirt', name: 'T-shirt', category: 'style', cost: 400, value: 200 },
  { id: 'glasses', name: 'Sunglasses', category: 'style', cost: 650, value: 325 },
  { id: 'backpack', name: 'Backpack', category: 'style', cost: 1000, value: 500 },

  // Home
  { id: 'plant', name: 'Plant', category: 'home', cost: 850, value: 425 },
  { id: 'lamp', name: 'Lamp', category: 'home', cost: 1100, value: 550 },
  { id: 'armchair', name: 'Armchair', category: 'home', cost: 1600, value: 800 },
  { id: 'bike', name: 'Bike', category: 'home', cost: 1600, value: 800 },
  { id: 'sofa', name: 'Sofa', category: 'home', cost: 1850, value: 925 },
  { id: 'washer', name: 'Washer', category: 'home', cost: 3200, value: 1600 },

  // Tech
  { id: 'headphones', name: 'Headphones', category: 'tech', cost: 950, value: 475 },
  { id: 'watch', name: 'Watch', category: 'tech', cost: 2050, value: 1025 },
  { id: 'camera', name: 'Camera', category: 'tech', cost: 2250, value: 1125 },
  { id: 'console', name: 'Game console', category: 'tech', cost: 2400, value: 1200 },
  { id: 'tablet', name: 'Tablet', category: 'tech', cost: 2900, value: 1450 },
  { id: 'laptop', name: 'Laptop', category: 'tech', cost: 2900, value: 1450 },
  { id: 'tv', name: 'TV', category: 'tech', cost: 4700, value: 2350 },
];

/** Aisle names shown to players. */
export const CATEGORY_NAMES: Record<ItemCategory, string> = {
  snack: 'Snacks',
  style: 'Style',
  home: 'Home',
  tech: 'Tech',
};

/** The priciest thing in the shop (bounds the highest possible score). */
export const MAX_ITEM_COST = Math.max(...CATALOG.map((item) => item.cost));
