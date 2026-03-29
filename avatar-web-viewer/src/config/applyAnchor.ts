/**
 * applyAnchor.ts
 *
 * Applies body-type-aware anchor position + optional per-item offset
 * to a loaded GLB object.
 *
 * POSITIONING PRIORITY (highest → lowest):
 *   1. scaleOverride  — per-item scale from items.ts
 *   2. offset         — per-item fine-tune [x,y,z] from items.ts
 *   3. anchor         — category position from anchors.ts (per body type)
 *
 * TO TWEAK ALIGNMENT:
 *   • All items of a category on all males  → edit ANCHORS_MALE  in anchors.ts
 *   • All items of a category on all females → edit ANCHORS_FEMALE in anchors.ts
 *   • One specific item only                → edit its `offset` in items.ts
 *   • Debug bounding boxes                  → set DEBUG_ANCHORS = true below
 */

import * as THREE from 'three';
import { getAnchor, type AnchorKey } from './anchors';

// Set to true to render a yellow BoxHelper around every placed accessory
export const DEBUG_ANCHORS = false;

export function applyAnchor(
  obj: THREE.Object3D,
  type: AnchorKey,
  offset?: [number, number, number],
  scaleOverride?: [number, number, number],
  bodyType: string = 'female',   // ← comes from AvatarCustomizer's bodyType prop
): void {
  // Resolve the correct anchor for this body type + category
  const anchor = getAnchor(bodyType, type);

  // Position = anchor base + per-item offset
  obj.position.set(
    anchor.position[0] + (offset?.[0] ?? 0),
    anchor.position[1] + (offset?.[1] ?? 0),
    anchor.position[2] + (offset?.[2] ?? 0),
  );

  // Scale
  if (scaleOverride) {
    obj.scale.set(...scaleOverride);
  } else {
    obj.scale.set(...anchor.scale);
  }

  // Optional rotation defined in anchors.ts
  if (anchor.rotation) {
    obj.rotation.set(...anchor.rotation);
  }

  // Debug: yellow bounding box around the item
  if (DEBUG_ANCHORS) {
    const box = new THREE.BoxHelper(obj, 0xffff00);
    obj.parent?.add(box);
  }
}
