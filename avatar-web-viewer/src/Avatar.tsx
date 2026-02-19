import { useGLTF, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { TEXTURES } from './textures';

interface AvatarProps {
  topTexture: string;
  pantsTexture: string;
  shoesTexture: string;
}

export function Avatar({ topTexture, pantsTexture, shoesTexture }: AvatarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/untitled.glb');
  
  // Load textures using data URLs
  const topTex = useTexture(TEXTURES[topTexture as keyof typeof TEXTURES] || TEXTURES.top_default);
  const pantsTex = useTexture(TEXTURES[pantsTexture as keyof typeof TEXTURES] || TEXTURES.pants_default);
  const shoesTex = useTexture(TEXTURES[shoesTexture as keyof typeof TEXTURES] || TEXTURES.shoes_default);

  // Auto-rotate the avatar
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  useEffect(() => {
    if (!scene) return;

    // Clone the scene to avoid modifying the original
    const clonedScene = scene.clone();
    
    // Traverse and update textures using pattern matching for Wolf3D names
    clonedScene.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        // Ensure material exists and clone it to avoid shared materials
        if (node.material) {
          const material = node.material.clone();
          node.material = material;
          
          // Apply textures based on mesh name patterns (Wolf3D format)
          if (node.name.includes('Outfit_Top') || node.name === 'Top') {
            if ('map' in material) {
              (material as THREE.MeshStandardMaterial).map = topTex;
              material.needsUpdate = true;
            }
          } else if (node.name.includes('Outfit_Bottom') || node.name === 'Pants') {
            if ('map' in material) {
              (material as THREE.MeshStandardMaterial).map = pantsTex;
              material.needsUpdate = true;
            }
          } else if (node.name.includes('Outfit_Footwear') || node.name === 'Shoes') {
            if ('map' in material) {
              (material as THREE.MeshStandardMaterial).map = shoesTex;
              material.needsUpdate = true;
            }
          }
        }
      }
    });

    // Clear previous children and add the updated scene
    if (groupRef.current) {
      groupRef.current.clear();
      groupRef.current.add(clonedScene);
    }
  }, [scene, topTex, pantsTex, shoesTex]);

  return (
    <group ref={groupRef} position={[0, -1.2, 0]} scale={[1.2, 1.2, 1.2]} />
  );
}

// Preload the GLB file
useGLTF.preload('/untitled.glb');