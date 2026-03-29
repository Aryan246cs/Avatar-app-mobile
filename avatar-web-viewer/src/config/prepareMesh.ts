/**
 * prepareMesh.ts
 * Walks a cloned GLB scene and sets all meshes to render correctly.
 * Call this once after cloning, before adding to the scene.
 */

import * as THREE from 'three';

export function prepareMesh(obj: THREE.Object3D): void {
  obj.traverse((node) => {
    node.visible = true;

    if (node instanceof THREE.Mesh) {
      node.frustumCulled = false;
      node.castShadow = true;
      node.receiveShadow = true;

      const mats = Array.isArray(node.material) ? node.material : [node.material];
      mats.forEach((mat: any) => {
        if (!mat) return;
        mat.transparent = false;
        mat.opacity = 1;
        mat.side = THREE.DoubleSide;
        mat.depthWrite = true;
        mat.depthTest = true;
        mat.needsUpdate = true;
        if (mat.map) mat.map.needsUpdate = true;
      });
    }
  });
}
