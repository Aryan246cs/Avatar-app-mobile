/**
 * ITEM CATALOG CONFIG
 * 
 * Maps every GLB asset to its anchor type and optional per-item offset.
 * 
 * HOW TO ADD A NEW ITEM:
 * 1. Drop the .glb into the correct public/ folder
 * 2. Add an entry here with the correct type and file path
 * 3. Optionally add an offset if it needs fine-tuning
 * 
 * offset: [x, y, z] — added ON TOP of the anchor position
 *   offset[0] = left(-) / right(+)
 *   offset[1] = down(-) / up(+)
 *   offset[2] = back(-) / forward(+)
 */

import type { AnchorKey } from './anchors';

export interface ItemConfig {
  id: string;
  name: string;
  type: AnchorKey;
  file: string;
  gender?: 'women' | 'men' | 'unisex';
  offset?: [number, number, number];
  scaleOverride?: [number, number, number];
}

// ─── JACKETS ────────────────────────────────────────────────────────────────
export const JACKET_ITEMS: ItemConfig[] = [
  { id: 'FJ1', name: 'Female Jacket 1', type: 'body', file: '/Jackets/FJ1.glb', gender: 'women' },
  { id: 'FJ2', name: 'Female Jacket 2', type: 'body', file: '/Jackets/FJ2.glb', gender: 'women' },
  { id: 'FJ3', name: 'Female Jacket 3', type: 'body', file: '/Jackets/FJ3.glb', gender: 'women' },
  { id: 'MJ1', name: 'Male Jacket 1',   type: 'body', file: '/Jackets/MJ1.glb', gender: 'men' },
  { id: 'MJ2', name: 'Male Jacket 2',   type: 'body', file: '/Jackets/MJ2.glb', gender: 'men' },
];

// ─── BOTTOMS ─────────────────────────────────────────────────────────────────
export const BOTTOM_ITEMS: ItemConfig[] = [
  { id: 'FB1', name: 'Female Bottom 1', type: 'legs', file: '/Bottoms/FB1.glb', gender: 'women' },
  { id: 'FB2', name: 'Female Bottom 2', type: 'legs', file: '/Bottoms/FB2.glb', gender: 'women' },
  { id: 'MB1', name: 'Male Bottom 1',   type: 'legs', file: '/Bottoms/MB1.glb', gender: 'men' },
  { id: 'MB2', name: 'Male Bottom 2',   type: 'legs', file: '/Bottoms/MB2.glb', gender: 'men' },
];

// ─── SHOES ───────────────────────────────────────────────────────────────────
export const SHOES_ITEMS: ItemConfig[] = [
  { id: 'Shoes1_Women', name: 'Shoes 1 (Women)', type: 'feet', file: '/accessories/Accessories/Shoes/Shoes1_Women.glb', gender: 'women' },
  { id: 'Shoes2_Women', name: 'Shoes 2 (Women)', type: 'feet', file: '/accessories/Accessories/Shoes/Shoes2_Women.glb', gender: 'women' },
  { id: 'Shoes1_Men',   name: 'Shoes 1 (Men)',   type: 'feet', file: '/accessories/Accessories/Shoes/Shoes1_Men.glb',   gender: 'men' },
  { id: 'Shoes2_Men',   name: 'Shoes 2 (Men)',   type: 'feet', file: '/accessories/Accessories/Shoes/Shoes2_Men.glb',   gender: 'men' },
  { id: 'Shoes3_Men',   name: 'Shoes 3 (Men)',   type: 'feet', file: '/accessories/Accessories/Shoes/Shoes3_Men.glb',   gender: 'men' },
];

// ─── FULL SUITS ───────────────────────────────────────────────────────────────
export const FULL_SUIT_ITEMS: ItemConfig[] = [
  { id: 'RedSuit_Women', name: 'Red Suit (Women)', type: 'body', file: '/accessories/Accessories/Full Suit/red suit women1c.glb', gender: 'women' },
  { id: 'Full3_Men',     name: 'Full Suit (Men)',  type: 'body', file: '/accessories/Accessories/Full Suit/Full3_men.glb',         gender: 'men' },
];

// ─── ACCESSORIES (face / head / unisex) ──────────────────────────────────────
export const ACCESSORY_ITEMS: ItemConfig[] = [
  {
    id: 'mask',
    name: 'Mask',
    type: 'face',
    file: '/mask.glb',
    gender: 'unisex',
    // Tweak offset here if mask sits too high/low/forward
    offset: [0, 0, 0],
  },
  {
    id: 'hair',
    name: 'Hair',
    type: 'head',
    file: '/accessories/hair/hair.glb',
    gender: 'unisex',
    offset: [0, 0, 0],
  },
  {
    id: 'hair2',
    name: 'Hair 2',
    type: 'head',
    file: '/accessories/hair/hair2.glb',
    gender: 'unisex',
    offset: [0, 0, 0],
    scaleOverride: [0.3, 0.3, 0.3], // Scale down - adjust if still too big/small
  },
];

// ─── COMBINED CATALOG ─────────────────────────────────────────────────────────
export const ALL_ITEMS: ItemConfig[] = [
  ...JACKET_ITEMS,
  ...BOTTOM_ITEMS,
  ...SHOES_ITEMS,
  ...FULL_SUIT_ITEMS,
  ...ACCESSORY_ITEMS,
];

/** Quick lookup by item id */
export const getItemById = (id: string): ItemConfig | undefined =>
  ALL_ITEMS.find(item => item.id === id);
