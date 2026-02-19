import { useGLTF, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { TEXTURES } from './textures';

// Body type mapping
const BODY_MAP = {
  female: '/female.glb',
  female1: '/female1.glb',
  female2: '/female2.glb',
  female3: '/female3.glb',
  male: '/male.glb',
  male1: '/male1.glb',
  male2: '/male2.glb',
  male3: '/male3.glb',
} as const;

type BodyType = keyof typeof BODY_MAP;

interface AvatarCustomizerProps {
  bodyType: BodyType;
  topTexture: string;
  pantsTexture: string;
  shoesTexture: string;
  eyesTexture: string;
  hairTexture: string;
  visibleParts?: {
    hair?: boolean;
    top?: boolean;
    pants?: boolean;
    shoes?: boolean;
  };
}

export function AvatarCustomizer({ 
  bodyType,
  topTexture, 
  pantsTexture, 
  shoesTexture,
  eyesTexture,
  hairTexture,
  visibleParts = { hair: true, top: true, pants: true, shoes: true }
}: AvatarCustomizerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [currentBodyPath, setCurrentBodyPath] = useState(BODY_MAP[bodyType]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load the GLB based on body type
  const { scene } = useGLTF(currentBodyPath);
  
  // Load all textures
  const topTex = useTexture(TEXTURES[topTexture as keyof typeof TEXTURES]);
  const pantsTex = useTexture(TEXTURES[pantsTexture as keyof typeof TEXTURES]);
  const shoesTex = useTexture(TEXTURES[shoesTexture as keyof typeof TEXTURES]);
  const eyesTex = useTexture(TEXTURES[eyesTexture as keyof typeof TEXTURES]);
  const hairTex = useTexture(TEXTURES[hairTexture as keyof typeof TEXTURES]);

  // Auto-rotate the avatar
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  // Handle body type changes - safely dispose old model and load new one
  useEffect(() => {
    const newBodyPath = BODY_MAP[bodyType];
    
    if (newBodyPath !== currentBodyPath && !isLoading) {
      console.log('🔄 Switching body type from', currentBodyPath, 'to', newBodyPath);
      setIsLoading(true);
      
      // Clear current scene safely
      if (groupRef.current) {
        groupRef.current.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.geometry?.dispose();
            if (Array.isArray(node.material)) {
              node.material.forEach(mat => mat.dispose());
            } else {
              node.material?.dispose();
            }
          }
        });
        groupRef.current.clear();
      }
      
      // Update to new body path
      setCurrentBodyPath(newBodyPath);
      setIsLoading(false);
    }
  }, [bodyType, currentBodyPath, isLoading]);

  useEffect(() => {
    if (!scene) return;

    console.log('🎨 APPLYING TEXTURES TO AVATAR.GLB...');
    console.log('Top:', topTexture, 'Pants:', pantsTexture, 'Shoes:', shoesTexture);
    console.log('Eyes:', eyesTexture, 'Hair:', hairTexture);
    console.log('📦 Scene structure:', scene);

    // Clone the scene to avoid modifying the original
    const clonedScene = scene.clone();
    
    // Log all mesh names found in the scene
    const meshNames: string[] = [];
    clonedScene.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        meshNames.push(node.name);
      }
    });
    console.log('🔍 Found meshes:', meshNames);
    
    // Traverse and update textures + visibility
    clonedScene.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        // Ensure material exists and clone it
        if (node.material) {
          const material = node.material.clone();
          node.material = material;
          
          // Apply textures based on mesh names from avatar.glb
          switch (node.name) {
            case 'Top':
              if ('map' in material) {
                (material as THREE.MeshStandardMaterial).map = topTex;
                material.needsUpdate = true;
                node.visible = visibleParts.top !== false;
                console.log('✅ Applied TOP texture to:', node.name);
              }
              break;
              
            case 'Pants':
              if ('map' in material) {
                (material as THREE.MeshStandardMaterial).map = pantsTex;
                material.needsUpdate = true;
                node.visible = visibleParts.pants !== false;
                console.log('✅ Applied PANTS texture to:', node.name);
              }
              break;
              
            case 'Shoes':
              if ('map' in material) {
                (material as THREE.MeshStandardMaterial).map = shoesTex;
                material.needsUpdate = true;
                node.visible = visibleParts.shoes !== false;
                console.log('✅ Applied SHOES texture to:', node.name);
              }
              break;
              
            case 'Eyes':
              if ('map' in material) {
                (material as THREE.MeshStandardMaterial).map = eyesTex;
                material.needsUpdate = true;
                console.log('✅ Applied EYES texture to:', node.name);
              }
              break;
              
            case 'Hair':
              if ('map' in material) {
                (material as THREE.MeshStandardMaterial).map = hairTex;
                material.needsUpdate = true;
                node.visible = visibleParts.hair !== false;
                console.log('✅ Applied HAIR texture to:', node.name);
              }
              break;
              
            // Body, Head, Teeth remain unchanged (use default materials)
            case 'Body':
            case 'Head':
            case 'Teeth':
              console.log('ℹ️ Keeping default material for:', node.name);
              break;
              
            default:
              console.log('⚠️ Unknown mesh:', node.name);
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
  }, [scene, topTex, pantsTex, shoesTex, eyesTex, hairTex, visibleParts]);

  return (
    <group ref={groupRef} position={[0, -1.2, 0]} scale={[1.3, 1.3, 1.3]} />
  );
}

// Preload all body GLB files
Object.values(BODY_MAP).forEach(path => {
  useGLTF.preload(path);
});

export type { BodyType };
