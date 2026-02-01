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
  const topTex = useTexture(TEXTURES[topTexture as keyof typeof TEXTURES]);
  const pantsTex = useTexture(TEXTURES[pantsTexture as keyof typeof TEXTURES]);
  const shoesTex = useTexture(TEXTURES[shoesTexture as keyof typeof TEXTURES]);

  // Auto-rotate the avatar
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  useEffect(() => {
    if (!scene) return;

    console.log('🎨 APPLYING TEXTURES...');
    console.log('Top:', topTexture, 'Pants:', pantsTexture, 'Shoes:', shoesTexture);

    // Clone the scene to avoid modifying the original
    const clonedScene = scene.clone();
    
    // Traverse and update textures using EXACT mesh names
    clonedScene.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        // Ensure material exists and clone it to avoid shared materials
        if (node.material) {
          const material = node.material.clone();
          node.material = material;
          
          // Apply textures based on EXACT mesh names from your GLB
          switch (node.name) {
            case 'Top':
              if ('map' in material) {
                (material as THREE.MeshStandardMaterial).map = topTex;
                material.needsUpdate = true;
                console.log('✅ Applied TOP texture to:', node.name);
              }
              break;
            case 'Pants':
              if ('map' in material) {
                (material as THREE.MeshStandardMaterial).map = pantsTex;
                material.needsUpdate = true;
                console.log('✅ Applied PANTS texture to:', node.name);
              }
              break;
            case 'Shoes':
              if ('map' in material) {
                (material as THREE.MeshStandardMaterial).map = shoesTex;
                material.needsUpdate = true;
                console.log('✅ Applied SHOES texture to:', node.name);
              }
              break;
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
    <group ref={groupRef} position={[0, -0.8, 0]} scale={[1, 1, 1]} />
  );
}

// Preload the GLB file
useGLTF.preload('/untitled.glb');