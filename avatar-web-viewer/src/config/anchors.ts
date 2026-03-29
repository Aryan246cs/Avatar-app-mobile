/**
 * ANCHOR POINTS CONFIG — body-type aware
 *
 * HOW TO TWEAK:
 *   position[0] (X) = left(-) / right(+)
 *   position[1] (Y) = down(-) / up(+)
 *   position[2] (Z) = back(-) / forward(+)
 *   scale           = overall size multiplier
 *
 * Male avatars are taller, so their Y values are slightly higher.
 * Female values are the baseline.
 *
 * TO ADD A NEW BODY VARIANT (e.g. male1, male2):
 *   Add a key below that matches the BodyType string exactly.
 *   If you don't add one, it falls back to the gender group
 *   (male1 → male, female2 → female) via getAnchor().
 */

export type AnchorKey = 'head' | 'face' | 'body' | 'legs' | 'feet' | 'unisex';

export interface Anchor {
  position: [number, number, number];
  scale: [number, number, number];
  rotation?: [number, number, number]; // euler radians, optional
}

export type AnchorSet = Record<AnchorKey, Anchor>;

// ─── PER-GENDER ANCHOR SETS ───────────────────────────────────────────────────

export const ANCHORS_FEMALE: AnchorSet = {
  // Caps, hats, hair accessories
  head:   { position: [0, 0, 0], scale: [1, 1, 1] },
  // Masks, glasses
  face:   { position: [0, 0, 0], scale: [1, 1, 1] },
  // Jackets, tops, full suits
  body:   { position: [0, 0, 0], scale: [1, 1, 1] },
  // Pants, skirts, shorts
  legs:   { position: [0, 0, 0], scale: [1, 1, 1] },
  // Shoes, boots
  feet:   { position: [0, 0, 0], scale: [1, 1, 1] },
  // Hair, unisex items
  unisex: { position: [0, 0, 0], scale: [1, 1, 1] },
};

export const ANCHORS_MALE: AnchorSet = {
  head:   { position: [0, 0.07, 0], scale: [1, 1, 1] },
  face:   { position: [0, 0.07, 0], scale: [1, 1, 1] },
  body:   { position: [0, 0, 0], scale: [1, 1, 1] },
  legs:   { position: [0, 0, 0], scale: [1, 1, 1] },
  feet:   { position: [0, 0, 0], scale: [1, 1, 1] },
  unisex: { position: [0, 0, 0], scale: [1, 1, 1] },
};

// ─── BODY-TYPE → ANCHOR SET MAP ───────────────────────────────────────────────
// Add entries for body variants (male1, female2, etc.) only if they need
// different values from the base gender. Otherwise getAnchor() falls back
// to the gender group automatically.
const ANCHOR_MAP: Partial<Record<string, AnchorSet>> = {
  female:  ANCHORS_FEMALE,
  female1: ANCHORS_FEMALE,
  female2: ANCHORS_FEMALE,
  female3: ANCHORS_FEMALE,
  male:    ANCHORS_MALE,
  male1:   ANCHORS_MALE,
  male2:   ANCHORS_MALE,
  male3:   ANCHORS_MALE,
};

// ─── HELPER ───────────────────────────────────────────────────────────────────
/**
 * getAnchor(bodyType, anchorKey)
 *
 * Returns the correct Anchor for the given body type and item category.
 * Falls back to ANCHORS_FEMALE if bodyType is unknown.
 *
 * Used inside applyAnchor.ts — do not call directly from components.
 */
export function getAnchor(bodyType: string, key: AnchorKey): Anchor {
  const set = ANCHOR_MAP[bodyType] ?? ANCHORS_FEMALE;
  return set[key];
}
