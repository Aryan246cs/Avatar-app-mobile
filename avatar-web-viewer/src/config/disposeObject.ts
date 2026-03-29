/**
 * disposeObject.ts
 * Safely removes and disposes a Three.js object from the scene.
 */

import * as THREE from 'three';

export function disposeObject(obj: THREE.Object3D | null): void {
  if (!obj) return;
  obj.parent?.remove(obj);
  obj.traverse((node) => {
    if (node instanceof THREE.Mesh) {
      node.geometry?.dispose();
      const mats = Array.isArray(node.material) ? node.material : [node.material];
      mats.forEach((m) => m?.dispose());
    }
  });
}
