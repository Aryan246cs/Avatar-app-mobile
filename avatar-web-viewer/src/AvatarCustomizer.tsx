import { useGLTF, useTexture } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { TEXTURES } from './textures';

// Gender-aware accessory file mapping
const ACCESSORY_FILES = {
  jacket: {
    women: {
      1: '/Jackets/FJ1.glb',
      2: '/Jackets/FJ2.glb',
      3: '/Jackets/FJ3.glb',
    },
    men: {
      1: '/Jackets/MJ1.glb',
      2: '/Jackets/MJ2.glb',
    }
  },
  pants: {
    women: {
      1: '/Bottoms/FB1.glb',
      2: '/Bottoms/FB2.glb',
    },
    men: {
      1: '/Bottoms/MB1.glb',
      2: '/Bottoms/MB2.glb',
    }
  },
  hair: {
    unisex: {
      1: '/hair.glb',
    }
  },
  mask: {
    unisex: {
      1: '/mask.glb',
    }
  },
  fullSuit: {
    women: {
      1: '/accessories/Accessories/Full Suit/red suit women1c.glb',
      3: '/accessories/Accessories/Full Suit/Full3_men.glb', // Using men's suit as option 2
    },
    men: {
      3: '/accessories/Accessories/Full Suit/Full3_men.glb',
    }
  },
  shoes: {
    women: {
      1: '/accessories/Accessories/Shoes/Shoes1_Women.glb',
      2: '/accessories/Accessories/Shoes/Shoes2_Women.glb',
    },
    men: {
      1: '/accessories/Accessories/Shoes/Shoes1_Men.glb',
      2: '/accessories/Accessories/Shoes/Shoes2_Men.glb',
    }
  }
} as const;

// Helper to detect gender from body type
const getGender = (bodyType: BodyType): 'women' | 'men' => {
  return bodyType.startsWith('female') ? 'women' : 'men';
};

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
  accessories?: {
    jacket?: number | null;
    pants?: number | null;
    hair?: number | null;
    mask?: number | null;
    fullSuit?: number | null;
    shoes?: number | null;
  };
}

export function AvatarCustomizer({ 
  bodyType,
  topTexture, 
  pantsTexture, 
  shoesTexture,
  eyesTexture,
  hairTexture,
  visibleParts = { hair: true, top: true, pants: true, shoes: true },
  accessories = { jacket: null, pants: null, hair: null, mask: null, fullSuit: null, shoes: null }
}: AvatarCustomizerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const jacketRef = useRef<THREE.Group>(null);
  const pantsAccessoryRef = useRef<THREE.Group>(null);
  const hairAccessoryRef = useRef<THREE.Group>(null);
  const maskAccessoryRef = useRef<THREE.Group>(null);
  const fullSuitRef = useRef<THREE.Group>(null);
  const shoesAccessoryRef = useRef<THREE.Group>(null);
  const [currentBodyPath, setCurrentBodyPath] = useState(BODY_MAP[bodyType]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load the GLB based on body type
  const { scene } = useGLTF(currentBodyPath);
  
  // Get gender for current body type
  const gender = getGender(bodyType);
  
  // Get the correct accessory paths based on gender and selection
  const jacketPath = accessories.jacket 
    ? ACCESSORY_FILES.jacket[gender][accessories.jacket as keyof typeof ACCESSORY_FILES.jacket[typeof gender]]
    : null;
  const pantsPath = accessories.pants 
    ? ACCESSORY_FILES.pants[gender][accessories.pants as keyof typeof ACCESSORY_FILES.pants[typeof gender]]
    : null;
  const hairPath = accessories.hair 
    ? ACCESSORY_FILES.hair.unisex[accessories.hair as keyof typeof ACCESSORY_FILES.hair.unisex]
    : null;
  const maskPath = accessories.mask 
    ? ACCESSORY_FILES.mask.unisex[accessories.mask as keyof typeof ACCESSORY_FILES.mask.unisex]
    : null;
  const fullSuitPath = accessories.fullSuit 
    ? ACCESSORY_FILES.fullSuit[gender][accessories.fullSuit as keyof typeof ACCESSORY_FILES.fullSuit[typeof gender]]
    : null;
  const shoesPath = accessories.shoes
    ? ACCESSORY_FILES.shoes[gender][accessories.shoes as keyof typeof ACCESSORY_FILES.shoes[typeof gender]]
    : null;
  
  // Load jacket, pants, hair, mask, full suit and shoes scenes conditionally
  let jacketScene: THREE.Group | null = null;
  let pantsAccessoryScene: THREE.Group | null = null;
  let hairAccessoryScene: THREE.Group | null = null;
  let maskAccessoryScene: THREE.Group | null = null;
  let fullSuitScene: THREE.Group | null = null;
  let shoesAccessoryScene: THREE.Group | null = null;
  
  try {
    if (jacketPath) {
      const loaded = useGLTF(jacketPath);
      jacketScene = loaded.scene;
    }
  } catch (e) {
    console.warn('Failed to load jacket:', e);
  }
  
  try {
    if (pantsPath) {
      const loaded = useGLTF(pantsPath);
      pantsAccessoryScene = loaded.scene;
    }
  } catch (e) {
    console.warn('Failed to load pants:', e);
  }
  
  try {
    if (hairPath) {
      const loaded = useGLTF(hairPath);
      hairAccessoryScene = loaded.scene;
    }
  } catch (e) {
    console.warn('Failed to load hair:', e);
  }
  
  try {
    if (maskPath) {
      const loaded = useGLTF(maskPath);
      maskAccessoryScene = loaded.scene;
    }
  } catch (e) {
    console.warn('Failed to load mask:', e);
  }
  
  try {
    if (fullSuitPath) {
      const loaded = useGLTF(fullSuitPath);
      fullSuitScene = loaded.scene;
    }
  } catch (e) {
    console.warn('Failed to load full suit:', e);
  }
  
  try {
    if (shoesPath) {
      const loaded = useGLTF(shoesPath);
      shoesAccessoryScene = loaded.scene;
    }
  } catch (e) {
    console.warn('Failed to load shoes:', e);
  }
  
  // Load all textures
  const topTex = useTexture(TEXTURES[topTexture as keyof typeof TEXTURES]);
  const pantsTex = useTexture(TEXTURES[pantsTexture as keyof typeof TEXTURES]);
  const shoesTex = useTexture(TEXTURES[shoesTexture as keyof typeof TEXTURES]);
  const eyesTex = useTexture(TEXTURES[eyesTexture as keyof typeof TEXTURES]);
  const hairTex = useTexture(TEXTURES[hairTexture as keyof typeof TEXTURES]);

  // Auto-rotate disabled - avatar stays static
  // useFrame((state, delta) => {
  //   if (groupRef.current) {
  //     groupRef.current.rotation.y += delta * 0.3;
  //   }
  // });

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
        console.log('🔍 Found mesh:', node.name, 'visible:', node.visible, 'material:', node.material);
      }
    });
    console.log('🔍 Found meshes:', meshNames);
    console.log('👁️ Looking for Eyes mesh...');
    
    // Traverse and update textures + visibility
    clonedScene.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        // Ensure material exists and clone it
        if (node.material) {
          const material = node.material.clone();
          node.material = material;
          
          // Check if this might be the eyes mesh (case-insensitive)
          const nodeName = node.name.toLowerCase();
          if (nodeName.includes('eye')) {
            console.log('👁️ FOUND POTENTIAL EYES MESH:', node.name);
          }
          
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
              console.log('👁️ Processing Eyes mesh, material type:', material.type);
              // Handle different material types
              if (material instanceof THREE.MeshStandardMaterial || 
                  material instanceof THREE.MeshBasicMaterial ||
                  material instanceof THREE.MeshPhongMaterial) {
                material.map = eyesTex;
                // Don't set color - let the texture define the color
                material.transparent = false;
                material.opacity = 1;
                material.depthWrite = true;
                material.depthTest = true;
                material.needsUpdate = true;
                node.visible = true;
                node.frustumCulled = false;
                node.renderOrder = 1; // Render after other meshes
                console.log('✅ Applied EYES texture to:', node.name, 'with material:', material.type);
              } else {
                console.warn('⚠️ Eyes mesh has unsupported material type:', material.type);
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
              // Check for eyes with different naming (Eye, eye, EYES, etc.)
              const lowerName = node.name.toLowerCase();
              if (lowerName.includes('eye') && !lowerName.includes('eyebrow')) {
                console.log('👁️ Found eyes with alternate name:', node.name);
                if ('map' in material) {
                  const stdMat = material as THREE.MeshStandardMaterial;
                  stdMat.map = eyesTex;
                  stdMat.transparent = false;
                  stdMat.opacity = 1;
                  stdMat.depthWrite = true;
                  stdMat.depthTest = true;
                  stdMat.needsUpdate = true;
                  node.visible = true;
                  node.frustumCulled = false;
                  console.log('✅ Applied EYES texture to alternate name:', node.name);
                }
              } else {
                console.log('⚠️ Unknown mesh:', node.name);
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
  }, [scene, topTex, pantsTex, shoesTex, eyesTex, hairTex, visibleParts, bodyType]);

  // Handle Jacket accessory - gender-aware selection
  useEffect(() => {
    if (!jacketPath || !jacketScene || !groupRef.current) {
      // Remove jacket if turned off
      if (jacketRef.current) {
        jacketRef.current.parent?.remove(jacketRef.current);
        jacketRef.current.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.geometry?.dispose();
            if (Array.isArray(node.material)) {
              node.material.forEach(mat => mat.dispose());
            } else {
              node.material?.dispose();
            }
          }
        });
        jacketRef.current = null as any;
      }
      return;
    }

    console.log('🧥 Loading jacket:', jacketPath);
    
    const timer = setTimeout(() => {
      if (!groupRef.current) return;
      
      let armature: THREE.Object3D | undefined;
      groupRef.current.traverse((node) => {
        if (node.name === 'Armature') {
          armature = node;
        }
      });
      
      if (!armature) {
        console.warn('⚠️ Armature not found for jacket');
        return;
      }
      
      const clonedJacket = jacketScene.clone();
      clonedJacket.position.set(0, 0, 0);
      clonedJacket.scale.set(1.0, 1.0, 1.0);
      clonedJacket.rotation.set(0, 0, 0);
      
      clonedJacket.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          node.visible = true;
          node.frustumCulled = false;
          if (node.material) {
            const mat = node.material as THREE.MeshStandardMaterial;
            mat.transparent = false;
            mat.opacity = 1;
            mat.side = THREE.DoubleSide;
            mat.needsUpdate = true;
          }
        }
      });
      
      clonedJacket.visible = true;
      
      if (jacketRef.current) {
        jacketRef.current.parent?.remove(jacketRef.current);
        jacketRef.current.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.geometry?.dispose();
            if (Array.isArray(node.material)) {
              node.material.forEach(mat => mat.dispose());
            } else {
              node.material?.dispose();
            }
          }
        });
      }
      
      armature.add(clonedJacket);
      jacketRef.current = clonedJacket;
      console.log('✅ Jacket attached');
    }, 100);
    
    return () => {
      clearTimeout(timer);
      if (jacketRef.current) {
        jacketRef.current.parent?.remove(jacketRef.current);
        jacketRef.current.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.geometry?.dispose();
            if (Array.isArray(node.material)) {
              node.material.forEach(mat => mat.dispose());
            } else {
              node.material?.dispose();
            }
          }
        });
      }
    };
  }, [jacketScene, jacketPath, accessories.jacket, bodyType, scene]);

  // Handle Pants accessory - gender-aware selection
  useEffect(() => {
    if (!pantsPath || !pantsAccessoryScene || !groupRef.current) {
      // Remove pants if turned off and RESTORE avatar default pants
      if (pantsAccessoryRef.current) {
        pantsAccessoryRef.current.parent?.remove(pantsAccessoryRef.current);
        pantsAccessoryRef.current.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.geometry?.dispose();
            if (Array.isArray(node.material)) {
              node.material.forEach(mat => mat.dispose());
            } else {
              node.material?.dispose();
            }
          }
        });
        pantsAccessoryRef.current = null as any;
        
        // RESTORE avatar's default pants
        console.log('👖 Pants OFF - Restoring avatar default pants');
        groupRef.current.traverse((node) => {
          if (node.name === 'Pants') {
            node.visible = true;
            console.log('👖 Restored visibility for default pants');
          }
        });
      }
      return;
    }

    console.log('👖 Loading pants:', pantsPath);
    
    const timer = setTimeout(() => {
      if (!groupRef.current) return;
      
      let armature: THREE.Object3D | undefined;
      groupRef.current.traverse((node) => {
        if (node.name === 'Armature') {
          armature = node;
        }
      });
      
      if (!armature) {
        console.warn('⚠️ Armature not found for pants');
        return;
      }
      
      const clonedPants = pantsAccessoryScene.clone();
      clonedPants.position.set(0, 0, 0);
      clonedPants.scale.set(1.0, 1.0, 1.0);
      clonedPants.rotation.set(0, 0, 0);
      
      // Hide avatar's default pants
      groupRef.current.traverse((node) => {
        if (node.name === 'Pants') {
          node.visible = false;
          console.log('👖 Hiding avatar default pants');
        }
      });
      
      // Make all pants meshes visible with proper rendering
      clonedPants.traverse((node) => {
        node.visible = true;
        
        if (node instanceof THREE.Mesh) {
          node.frustumCulled = false;
          node.castShadow = true;
          node.receiveShadow = true;
          
          if (node.material) {
            const materials = Array.isArray(node.material) ? node.material : [node.material];
            materials.forEach((mat: any) => {
              mat.transparent = false;
              mat.opacity = 1;
              mat.side = THREE.DoubleSide;
              mat.depthWrite = true;
              mat.depthTest = true;
              mat.needsUpdate = true;
              if (mat.map) mat.map.needsUpdate = true;
            });
          }
        }
      });
      
      if (pantsAccessoryRef.current) {
        pantsAccessoryRef.current.parent?.remove(pantsAccessoryRef.current);
        pantsAccessoryRef.current.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.geometry?.dispose();
            if (Array.isArray(node.material)) {
              node.material.forEach(mat => mat.dispose());
            } else {
              node.material?.dispose();
            }
          }
        });
      }
      
      armature.add(clonedPants);
      pantsAccessoryRef.current = clonedPants;
      console.log('✅ Pants accessory attached');
    }, 100);
    
    return () => {
      clearTimeout(timer);
      if (pantsAccessoryRef.current) {
        pantsAccessoryRef.current.parent?.remove(pantsAccessoryRef.current);
        pantsAccessoryRef.current.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.geometry?.dispose();
            if (Array.isArray(node.material)) {
              node.material.forEach(mat => mat.dispose());
            } else {
              node.material?.dispose();
            }
          }
        });
      }
    };
  }, [pantsAccessoryScene, pantsPath, accessories.pants, bodyType, scene]);

  // Handle Hair accessory
  useEffect(() => {
    if (!hairPath || !hairAccessoryScene || !groupRef.current) {
      // Remove hair if turned off and RESTORE avatar default hair
      if (hairAccessoryRef.current) {
        hairAccessoryRef.current.parent?.remove(hairAccessoryRef.current);
        hairAccessoryRef.current.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.geometry?.dispose();
            if (Array.isArray(node.material)) {
              node.material.forEach(mat => mat.dispose());
            } else {
              node.material?.dispose();
            }
          }
        });
        hairAccessoryRef.current = null as any;
        
        // RESTORE avatar's default hair
        console.log('💇 Hair OFF - Restoring avatar default hair');
        groupRef.current.traverse((node) => {
          if (node.name === 'Hair') {
            node.visible = true;
            console.log('💇 Restored visibility for default hair');
          }
        });
      }
      return;
    }

    console.log('💇 Loading hair:', hairPath);
    
    const timer = setTimeout(() => {
      if (!groupRef.current) return;
      
      let armature: THREE.Object3D | undefined;
      groupRef.current.traverse((node) => {
        if (node.name === 'Armature') {
          armature = node;
        }
      });
      
      if (!armature) {
        console.warn('⚠️ Armature not found for hair');
        return;
      }
      
      const clonedHair = hairAccessoryScene.clone();
      clonedHair.position.set(0, 0, 0);
      clonedHair.scale.set(1.0, 1.0, 1.0);
      clonedHair.rotation.set(0, 0, 0);
      
      // Hide avatar's default hair
      groupRef.current.traverse((node) => {
        if (node.name === 'Hair') {
          node.visible = false;
          console.log('💇 Hiding avatar default hair');
        }
      });
      
      // Make all hair meshes visible with proper rendering
      clonedHair.traverse((node) => {
        node.visible = true;
        
        if (node instanceof THREE.Mesh) {
          node.frustumCulled = false;
          node.castShadow = true;
          node.receiveShadow = true;
          
          if (node.material) {
            const materials = Array.isArray(node.material) ? node.material : [node.material];
            materials.forEach((mat: any) => {
              mat.transparent = false;
              mat.opacity = 1;
              mat.side = THREE.DoubleSide;
              mat.depthWrite = true;
              mat.depthTest = true;
              mat.needsUpdate = true;
              if (mat.map) mat.map.needsUpdate = true;
            });
          }
        }
      });
      
      if (hairAccessoryRef.current) {
        hairAccessoryRef.current.parent?.remove(hairAccessoryRef.current);
        hairAccessoryRef.current.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.geometry?.dispose();
            if (Array.isArray(node.material)) {
              node.material.forEach(mat => mat.dispose());
            } else {
              node.material?.dispose();
            }
          }
        });
      }
      
      armature.add(clonedHair);
      hairAccessoryRef.current = clonedHair;
      console.log('✅ Hair accessory attached');
    }, 100);
    
    return () => {
      clearTimeout(timer);
      if (hairAccessoryRef.current) {
        hairAccessoryRef.current.parent?.remove(hairAccessoryRef.current);
        hairAccessoryRef.current.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.geometry?.dispose();
            if (Array.isArray(node.material)) {
              node.material.forEach(mat => mat.dispose());
            } else {
              node.material?.dispose();
            }
          }
        });
      }
    };
  }, [hairAccessoryScene, hairPath, accessories.hair, bodyType, scene]);

  // Handle Mask accessory
  useEffect(() => {
    if (!maskPath || !maskAccessoryScene || !groupRef.current) {
      if (maskAccessoryRef.current) {
        maskAccessoryRef.current.parent?.remove(maskAccessoryRef.current);
        maskAccessoryRef.current.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.geometry?.dispose();
            if (Array.isArray(node.material)) {
              node.material.forEach(mat => mat.dispose());
            } else {
              node.material?.dispose();
            }
          }
        });
        maskAccessoryRef.current = null as any;
      }
      return;
    }

    console.log('😷 Loading mask:', maskPath);
    
    const timer = setTimeout(() => {
      if (!groupRef.current) return;
      
      let armature: THREE.Object3D | undefined;
      groupRef.current.traverse((node) => {
        if (node.name === 'Armature') {
          armature = node;
        }
      });
      
      if (!armature) {
        console.warn('⚠️ Armature not found for mask');
        return;
      }
      
      const clonedMask = maskAccessoryScene.clone();
      clonedMask.position.set(0, 0, 0);
      clonedMask.scale.set(1.0, 1.0, 1.0);
      clonedMask.rotation.set(0, 0, 0);
      
      clonedMask.traverse((node) => {
        node.visible = true;
        
        if (node instanceof THREE.Mesh) {
          node.frustumCulled = false;
          node.castShadow = true;
          node.receiveShadow = true;
          
          if (node.material) {
            const materials = Array.isArray(node.material) ? node.material : [node.material];
            materials.forEach((mat: any) => {
              mat.transparent = false;
              mat.opacity = 1;
              mat.side = THREE.DoubleSide;
              mat.depthWrite = true;
              mat.depthTest = true;
              mat.needsUpdate = true;
              if (mat.map) mat.map.needsUpdate = true;
            });
          }
        }
      });
      
      if (maskAccessoryRef.current) {
        maskAccessoryRef.current.parent?.remove(maskAccessoryRef.current);
        maskAccessoryRef.current.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.geometry?.dispose();
            if (Array.isArray(node.material)) {
              node.material.forEach(mat => mat.dispose());
            } else {
              node.material?.dispose();
            }
          }
        });
      }
      
      armature.add(clonedMask);
      maskAccessoryRef.current = clonedMask;
      console.log('✅ Mask accessory attached');
    }, 100);
    
    return () => {
      clearTimeout(timer);
      if (maskAccessoryRef.current) {
        maskAccessoryRef.current.parent?.remove(maskAccessoryRef.current);
        maskAccessoryRef.current.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.geometry?.dispose();
            if (Array.isArray(node.material)) {
              node.material.forEach(mat => mat.dispose());
            } else {
              node.material?.dispose();
            }
          }
        });
      }
    };
  }, [maskAccessoryScene, maskPath, accessories.mask, bodyType, scene]);

  // Handle Full Suit accessory - gender-aware selection
  useEffect(() => {
    if (!fullSuitPath || !fullSuitScene || !groupRef.current) {
      // Remove suit if turned off and RESTORE avatar body parts
      if (fullSuitRef.current) {
        fullSuitRef.current.parent?.remove(fullSuitRef.current);
        fullSuitRef.current.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.geometry?.dispose();
            if (Array.isArray(node.material)) {
              node.material.forEach(mat => mat.dispose());
            } else {
              node.material?.dispose();
            }
          }
        });
        fullSuitRef.current = null as any;
        
        // RESTORE all hidden avatar body parts
        console.log('👔 Suit OFF - Restoring avatar body parts');
        groupRef.current.traverse((node) => {
          if (['Top', 'Pants'].includes(node.name)) {
            node.visible = true;
            console.log('👔 Restored visibility for:', node.name);
          }
        });
      }
      return;
    }

    console.log('👔 Loading full suit:', fullSuitPath);
    
    const timer = setTimeout(() => {
      if (!groupRef.current) return;
      
      let armature: THREE.Object3D | undefined;
      groupRef.current.traverse((node) => {
        if (node.name === 'Armature') {
          armature = node;
        }
      });
      
      if (!armature) {
        console.warn('⚠️ Armature not found for full suit');
        return;
      }
      
      const clonedSuit = fullSuitScene.clone();
      clonedSuit.position.set(0, 0, 0);
      clonedSuit.scale.set(1.0, 1.0, 1.0);
      clonedSuit.rotation.set(0, 0, 0);
      
      // Log all meshes in the suit
      const suitMeshes: string[] = [];
      let suitArmature: THREE.Object3D | undefined;
      clonedSuit.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          suitMeshes.push(node.name);
        }
        if (node.name === 'Armature' || node.type === 'Bone' || node.type === 'Skeleton') {
          console.log('👔 Suit has:', node.type, node.name);
          if (node.name === 'Armature') {
            suitArmature = node;
          }
        }
      });
      console.log('👔 Suit meshes:', suitMeshes);
      console.log('👔 Suit has its own armature?', !!suitArmature);
      
      // IMPORTANT: Suit files are complete avatars (body + suit combined)
      // Strategy: Hide the avatar's body parts and show the complete suit avatar
      if (suitArmature && armature) {
        console.log('👔 Suit is a complete avatar - hiding avatar body, showing suit');
        
        // Find the avatar's skeleton
        let avatarSkeleton: THREE.Skeleton | undefined;
        groupRef.current.traverse((node) => {
          if (node instanceof THREE.SkinnedMesh && node.skeleton) {
            avatarSkeleton = node.skeleton;
          }
        });
        
        if (avatarSkeleton) {
          console.log('👔 Found avatar skeleton, binding suit meshes');
          
          // HIDE only the torso and legs (keep head, eyes, teeth, hair, hands, arms visible)
          const partsToHide = ['Top', 'Pants'];
          groupRef.current.traverse((node) => {
            if (partsToHide.includes(node.name)) {
              node.visible = false;
              console.log('👔 Hiding avatar part:', node.name);
            }
          });
          
          let boundCount = 0;
          let regularCount = 0;
          
          // SHOW ALL suit meshes and bind to avatar skeleton
          clonedSuit.traverse((node) => {
            if (node instanceof THREE.SkinnedMesh) {
              console.log('👔 Binding skinned mesh:', node.name);
              boundCount++;
              // Bind to avatar's skeleton
              node.bind(avatarSkeleton!);
              node.visible = true;
              node.frustumCulled = false;
              node.castShadow = true;
              node.receiveShadow = true;
              
              if (node.material) {
                const materials = Array.isArray(node.material) ? node.material : [node.material];
                materials.forEach((mat: any) => {
                  mat.transparent = false;
                  mat.opacity = 1;
                  mat.side = THREE.DoubleSide;
                  mat.depthWrite = true;
                  mat.depthTest = true;
                  mat.needsUpdate = true;
                  if (mat.map) mat.map.needsUpdate = true;
                });
              }
            } else if (node instanceof THREE.Mesh) {
              console.log('👔 Regular mesh:', node.name);
              regularCount++;
              node.visible = true;
              node.frustumCulled = false;
              node.castShadow = true;
              node.receiveShadow = true;
              
              if (node.material) {
                const materials = Array.isArray(node.material) ? node.material : [node.material];
                materials.forEach((mat: any) => {
                  mat.transparent = false;
                  mat.opacity = 1;
                  mat.side = THREE.DoubleSide;
                  mat.depthWrite = true;
                  mat.depthTest = true;
                  mat.needsUpdate = true;
                  if (mat.map) mat.map.needsUpdate = true;
                });
              }
            }
          });
          console.log(`👔 Suit loaded: ${boundCount} skinned meshes, ${regularCount} regular meshes`);
          
          if (fullSuitRef.current) {
            fullSuitRef.current.parent?.remove(fullSuitRef.current);
          }
          
          armature.add(clonedSuit);
          fullSuitRef.current = clonedSuit;
          console.log('✅ Full suit bound to avatar skeleton');
        } else {
          console.warn('⚠️ Could not find avatar skeleton');
        }
      } else if (armature) {
        // Original approach - add entire scene
        clonedSuit.traverse((node) => {
          // Make all objects visible, not just meshes
          node.visible = true;
          
          if (node instanceof THREE.Mesh) {
            node.frustumCulled = false;
            node.castShadow = true;
            node.receiveShadow = true;
            
            if (node.material) {
              // Handle both single material and material arrays
              const materials = Array.isArray(node.material) ? node.material : [node.material];
              
              materials.forEach((mat: any) => {
                mat.transparent = false;
                mat.opacity = 1;
                mat.side = THREE.DoubleSide;
                mat.depthWrite = true;
                mat.depthTest = true;
                mat.needsUpdate = true;
                
                // Ensure proper rendering
                if (mat.map) {
                  mat.map.needsUpdate = true;
                }
              });
            }
          }
        });
        
        if (fullSuitRef.current) {
          fullSuitRef.current.parent?.remove(fullSuitRef.current);
          fullSuitRef.current.traverse((node) => {
            if (node instanceof THREE.Mesh) {
              node.geometry?.dispose();
              if (Array.isArray(node.material)) {
                node.material.forEach(mat => mat.dispose());
              } else {
                node.material?.dispose();
              }
            }
          });
        }
        
        armature.add(clonedSuit);
        fullSuitRef.current = clonedSuit;
        console.log('✅ Full suit attached');
      }
    }, 100);
    
    return () => {
      clearTimeout(timer);
      if (fullSuitRef.current) {
        fullSuitRef.current.parent?.remove(fullSuitRef.current);
        fullSuitRef.current.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.geometry?.dispose();
            if (Array.isArray(node.material)) {
              node.material.forEach(mat => mat.dispose());
            } else {
              node.material?.dispose();
            }
          }
        });
      }
    };
  }, [fullSuitScene, fullSuitPath, accessories.fullSuit, bodyType, scene]);

  // Handle Shoes accessory - gender-aware selection
  useEffect(() => {
    if (!shoesPath || !shoesAccessoryScene || !groupRef.current) {
      // Remove shoes if turned off and RESTORE avatar default shoes
      if (shoesAccessoryRef.current) {
        shoesAccessoryRef.current.parent?.remove(shoesAccessoryRef.current);
        shoesAccessoryRef.current.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.geometry?.dispose();
            if (Array.isArray(node.material)) {
              node.material.forEach(mat => mat.dispose());
            } else {
              node.material?.dispose();
            }
          }
        });
        shoesAccessoryRef.current = null as any;
        
        // RESTORE avatar's default shoes
        console.log('👞 Shoes OFF - Restoring avatar default shoes');
        groupRef.current.traverse((node) => {
          if (node.name === 'Shoes') {
            node.visible = true;
            console.log('👞 Restored visibility for default shoes');
          }
        });
      }
      return;
    }

    console.log('👞 Loading shoes:', shoesPath);
    
    const timer = setTimeout(() => {
      if (!groupRef.current) return;
      
      let armature: THREE.Object3D | undefined;
      groupRef.current.traverse((node) => {
        if (node.name === 'Armature') {
          armature = node;
        }
      });
      
      if (!armature) {
        console.warn('⚠️ Armature not found for shoes');
        return;
      }
      
      const clonedShoes = shoesAccessoryScene.clone();
      clonedShoes.position.set(0, 0, 0);
      clonedShoes.scale.set(1.0, 1.0, 1.0);
      clonedShoes.rotation.set(0, 0, 0);
      
      // Log all meshes in the shoes
      const shoesMeshes: string[] = [];
      let shoesArmature: THREE.Object3D | undefined;
      clonedShoes.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          shoesMeshes.push(node.name);
        }
        if (node.name === 'Armature' || node.type === 'Bone' || node.type === 'Skeleton') {
          console.log('👞 Shoes has:', node.type, node.name);
          if (node.name === 'Armature') {
            shoesArmature = node;
          }
        }
      });
      console.log('👞 Shoes meshes:', shoesMeshes);
      console.log('👞 Shoes has its own armature?', !!shoesArmature);
      
      // If shoes have their own armature, we need to merge differently
      if (shoesArmature && armature) {
        console.log('👞 Shoes have armature - need to bind to avatar skeleton');
        
        // Find the avatar's skeleton
        let avatarSkeleton: THREE.Skeleton | undefined;
        groupRef.current.traverse((node) => {
          if (node instanceof THREE.SkinnedMesh && node.skeleton) {
            avatarSkeleton = node.skeleton;
          }
        });
        
        if (avatarSkeleton) {
          console.log('👞 Found avatar skeleton, binding shoes meshes');
          
          // HIDE the avatar's shoes
          groupRef.current.traverse((node) => {
            if (node.name === 'Shoes') {
              node.visible = false;
              console.log('👞 Hiding avatar shoes');
            }
          });
          
          let boundCount = 0;
          let regularCount = 0;
          
          // SHOW ALL shoes meshes and bind to avatar skeleton
          clonedShoes.traverse((node) => {
            if (node instanceof THREE.SkinnedMesh) {
              console.log('👞 Binding skinned mesh:', node.name);
              boundCount++;
              // Bind to avatar's skeleton
              node.bind(avatarSkeleton!);
              node.visible = true;
              node.frustumCulled = false;
              node.castShadow = true;
              node.receiveShadow = true;
              
              if (node.material) {
                const materials = Array.isArray(node.material) ? node.material : [node.material];
                materials.forEach((mat: any) => {
                  mat.transparent = false;
                  mat.opacity = 1;
                  mat.side = THREE.DoubleSide;
                  mat.depthWrite = true;
                  mat.depthTest = true;
                  mat.needsUpdate = true;
                  if (mat.map) mat.map.needsUpdate = true;
                });
              }
            } else if (node instanceof THREE.Mesh) {
              console.log('👞 Regular mesh:', node.name);
              regularCount++;
              node.visible = true;
              node.frustumCulled = false;
              node.castShadow = true;
              node.receiveShadow = true;
              
              if (node.material) {
                const materials = Array.isArray(node.material) ? node.material : [node.material];
                materials.forEach((mat: any) => {
                  mat.transparent = false;
                  mat.opacity = 1;
                  mat.side = THREE.DoubleSide;
                  mat.depthWrite = true;
                  mat.depthTest = true;
                  mat.needsUpdate = true;
                  if (mat.map) mat.map.needsUpdate = true;
                });
              }
            }
          });
          console.log(`👞 Shoes loaded: ${boundCount} skinned meshes, ${regularCount} regular meshes`);
          
          if (shoesAccessoryRef.current) {
            shoesAccessoryRef.current.parent?.remove(shoesAccessoryRef.current);
          }
          
          armature.add(clonedShoes);
          shoesAccessoryRef.current = clonedShoes;
          console.log('✅ Shoes bound to avatar skeleton');
        } else {
          console.warn('⚠️ Could not find avatar skeleton');
        }
      } else if (armature) {
        // Original approach - add entire scene
        
        // HIDE the avatar's default shoes
        groupRef.current.traverse((node) => {
          if (node.name === 'Shoes') {
            node.visible = false;
            console.log('👞 Hiding avatar default shoes (alternative path)');
          }
        });
        
        clonedShoes.traverse((node) => {
          // Make all objects visible, not just meshes
          node.visible = true;
          
          if (node instanceof THREE.Mesh) {
            node.frustumCulled = false;
            node.castShadow = true;
            node.receiveShadow = true;
            
            if (node.material) {
              // Handle both single material and material arrays
              const materials = Array.isArray(node.material) ? node.material : [node.material];
              
              materials.forEach((mat: any) => {
                mat.transparent = false;
                mat.opacity = 1;
                mat.side = THREE.DoubleSide;
                mat.depthWrite = true;
                mat.depthTest = true;
                mat.needsUpdate = true;
                
                // Ensure proper rendering
                if (mat.map) {
                  mat.map.needsUpdate = true;
                }
              });
            }
          }
        });
        
        if (shoesAccessoryRef.current) {
          shoesAccessoryRef.current.parent?.remove(shoesAccessoryRef.current);
          shoesAccessoryRef.current.traverse((node) => {
            if (node instanceof THREE.Mesh) {
              node.geometry?.dispose();
              if (Array.isArray(node.material)) {
                node.material.forEach(mat => mat.dispose());
              } else {
                node.material?.dispose();
              }
            }
          });
        }
        
        armature.add(clonedShoes);
        shoesAccessoryRef.current = clonedShoes;
        console.log('✅ Shoes attached');
      }
    }, 100);
    
    return () => {
      clearTimeout(timer);
      if (shoesAccessoryRef.current) {
        shoesAccessoryRef.current.parent?.remove(shoesAccessoryRef.current);
        shoesAccessoryRef.current.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.geometry?.dispose();
            if (Array.isArray(node.material)) {
              node.material.forEach(mat => mat.dispose());
            } else {
              node.material?.dispose();
            }
          }
        });
      }
    };
  }, [shoesAccessoryScene, shoesPath, accessories.shoes, bodyType, scene]);

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={[1, 1, 1]} />
  );
}


// Preload all jacket accessories
Object.values(ACCESSORY_FILES.jacket.women).forEach(path => {
  useGLTF.preload(path);
});
Object.values(ACCESSORY_FILES.jacket.men).forEach(path => {
  useGLTF.preload(path);
});

// Preload all pants accessories
Object.values(ACCESSORY_FILES.pants.women).forEach(path => {
  useGLTF.preload(path);
});
Object.values(ACCESSORY_FILES.pants.men).forEach(path => {
  useGLTF.preload(path);
});

// Preload all hair accessories
Object.values(ACCESSORY_FILES.hair.unisex).forEach(path => {
  useGLTF.preload(path);
});

// Preload all mask accessories
Object.values(ACCESSORY_FILES.mask.unisex).forEach(path => {
  useGLTF.preload(path);
});

// Preload all full suit accessories
useGLTF.preload('/accessories/Accessories/Full Suit/red suit women1c.glb');
useGLTF.preload('/accessories/Accessories/Full Suit/Full3_men.glb');

// Preload all shoes accessories
Object.values(ACCESSORY_FILES.shoes.women).forEach(path => {
  useGLTF.preload(path);
});
Object.values(ACCESSORY_FILES.shoes.men).forEach(path => {
  useGLTF.preload(path);
});

export type { BodyType };
