import { useGLTF, useTexture } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { applyAnchor } from "./config/applyAnchor";
import { disposeObject } from "./config/disposeObject";
import { prepareMesh } from "./config/prepareMesh";
import { getTextureUrl } from "./textures";


// ─── BODY MAP ────────────────────────────────────────────────────────────────
const BODY_MAP = {
  female:  '/avatars/female.glb',
  female1: '/avatars/female1.glb',
  female2: '/avatars/female2.glb',
  female3: '/avatars/female3.glb',
  male:    '/avatars/male.glb',
  male1:   '/avatars/male1.glb',
  male2:   '/avatars/male2.glb',
  male3:   '/avatars/male3.glb',
} as const;

export type BodyType = keyof typeof BODY_MAP;

// ─── ACCESSORY FILE MAP ───────────────────────────────────────────────────────
const ACCESSORY_FILES = {
  jacket: {
    women: {
      1: '/accessories/jackets/FJ1.glb',
      2: '/accessories/jackets/FJ2.glb',
      3: '/accessories/jackets/FJ3.glb',
      4: '/accessories/jackets/J4.glb',
      5: '/accessories/jackets/J5.glb',
      6: '/accessories/jackets/J6.glb',
      7: '/accessories/jackets/J7.glb',
      8: '/accessories/jackets/J8.glb',
    },
    men: {
      1: '/accessories/jackets/MJ1.glb',
      2: '/accessories/jackets/MJ2.glb',
      3: '/accessories/jackets/J4.glb',
      4: '/accessories/jackets/J5.glb',
      5: '/accessories/jackets/J6.glb',
      6: '/accessories/jackets/J7.glb',
      7: '/accessories/jackets/J8.glb',
    }
  },
  pants: {
    women: {
      1: '/accessories/bottoms/FB1.glb',
      2: '/accessories/bottoms/FB2.glb',
      3: '/accessories/bottoms/P3.glb',
      4: '/accessories/bottoms/P4.glb',
      5: '/accessories/bottoms/P5.glb',
      6: '/accessories/bottoms/P6.glb',
      7: '/accessories/bottoms/P7.glb',
    },
    men: {
      1: '/accessories/bottoms/MB1.glb',
      2: '/accessories/bottoms/MB2.glb',
      3: '/accessories/bottoms/P3.glb',
      4: '/accessories/bottoms/P4.glb',
      5: '/accessories/bottoms/P5.glb',
      6: '/accessories/bottoms/P6.glb',
      7: '/accessories/bottoms/P7.glb',
    }
  },
  hair:  { unisex: { 1: '/accessories/hair/hair.glb', 2: '/accessories/hair/hair2.glb', 3: '/accessories/hair/hair3.glb', 4: '/accessories/hair/hair4.glb', 5: '/accessories/hair/hair5.glb', 6: '/accessories/hair/hair6.glb' } },
  mask:  { unisex: { 1: '/accessories/masks/mask.glb' } },
  fullSuit: {
    women: {
      1: '/accessories/suits/Female full suit/red_suit_women1c.glb',
      2: '/accessories/suits/Female full suit/ninja_women.glb',
      3: '/accessories/suits/Female full suit/cyberpunk_women.glb',
      4: '/accessories/suits/Female full suit/female 4 full suit.glb',
      5: '/accessories/suits/Female full suit/female 5 full suit.glb',
      6: '/accessories/suits/Female full suit/female 6 full suit.glb',
      7: '/accessories/suits/Female full suit/female 7 full suit.glb',
      8: '/accessories/suits/Female full suit/female 8 full suit.glb',
    },
    men: { 3: '/accessories/suits/Full3_men.glb' },
  },
  shoes: {
    women: { 1: '/accessories/shoes/Shoes1_Women.glb', 2: '/accessories/shoes/Shoes2_Women.glb' },
    men:   { 1: '/accessories/shoes/Shoes1_Men.glb',   2: '/accessories/shoes/Shoes2_Men.glb' },
  },
} as const;

const getGender = (bodyType: BodyType): 'women' | 'men' =>
  bodyType.startsWith('female') ? 'women' : 'men';

// ─── PROPS ───────────────────────────────────────────────────────────────────
interface AvatarCustomizerProps {
  bodyType: BodyType;
  topTexture: string;
  pantsTexture: string;
  shoesTexture: string;
  eyesTexture: string;
  hairTexture: string;
  visibleParts?: { hair?: boolean; top?: boolean; pants?: boolean; shoes?: boolean };
  accessories?: {
    jacket?: number | null;
    pants?: number | null;
    hair?: number | null;
    mask?: number | null;
    fullSuit?: number | null;
    shoes?: number | null;
  };
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export function AvatarCustomizer({
  bodyType,
  topTexture,
  pantsTexture,
  shoesTexture,
  eyesTexture,
  hairTexture,
  visibleParts = { hair: true, top: true, pants: true, shoes: true },
  accessories = { jacket: null, pants: null, hair: null, mask: null, fullSuit: null, shoes: null },
}: AvatarCustomizerProps) {
  const groupRef          = useRef<THREE.Group>(null);
  const jacketRef         = useRef<THREE.Group | null>(null);
  const pantsAccRef       = useRef<THREE.Group | null>(null);
  const hairAccRef        = useRef<THREE.Group | null>(null);
  const maskAccRef        = useRef<THREE.Group | null>(null);
  const fullSuitRef       = useRef<THREE.Group | null>(null);
  const shoesAccRef       = useRef<THREE.Group | null>(null);

  const [currentBodyPath, setCurrentBodyPath] = useState(BODY_MAP[bodyType]);
  const [isLoading, setIsLoading] = useState(false);

  const gender = getGender(bodyType);

  // Resolve accessory paths
  const jacketPath   = accessories.jacket   ? (ACCESSORY_FILES.jacket[gender]   as any)[accessories.jacket]   ?? null : null;
  const pantsPath    = accessories.pants    ? (ACCESSORY_FILES.pants[gender]    as any)[accessories.pants]    ?? null : null;
  const hairPath     = accessories.hair     ? (ACCESSORY_FILES.hair.unisex      as any)[accessories.hair]     ?? null : null;
  const maskPath     = accessories.mask     ? (ACCESSORY_FILES.mask.unisex      as any)[accessories.mask]     ?? null : null;
  const fullSuitPath = accessories.fullSuit ? (ACCESSORY_FILES.fullSuit[gender] as any)[accessories.fullSuit] ?? null : null;
  const shoesPath    = accessories.shoes    ? (ACCESSORY_FILES.shoes[gender]    as any)[accessories.shoes]    ?? null : null;

  // Load base avatar
  const { scene } = useGLTF(currentBodyPath) as any;

  // Load accessory scenes — each hook is always called (Rules of Hooks)
  const jacketGLTF   = useGLTF(jacketPath   ?? '/avatars/female.glb') as any;
  const pantsGLTF    = useGLTF(pantsPath    ?? '/avatars/female.glb') as any;
  const hairGLTF     = useGLTF(hairPath     ?? '/avatars/female.glb') as any;
  // Always load hair1 as reference for auto-scaling hair2+
  const hair1RefGLTF = useGLTF('/accessories/hair/hair.glb') as any;
  const maskGLTF     = useGLTF(maskPath     ?? '/avatars/female.glb') as any;
  const fullSuitGLTF = useGLTF(fullSuitPath ?? '/avatars/female.glb') as any;
  const shoesGLTF    = useGLTF(shoesPath    ?? '/avatars/female.glb') as any;

  const jacketScene   = jacketPath   ? jacketGLTF.scene   : null;
  const pantsAccScene = pantsPath    ? pantsGLTF.scene    : null;
  const hairAccScene  = hairPath     ? hairGLTF.scene     : null;
  const maskAccScene  = maskPath     ? maskGLTF.scene     : null;
  const fullSuitScene = fullSuitPath ? fullSuitGLTF.scene : null;
  const shoesAccScene = shoesPath    ? shoesGLTF.scene    : null;

  // Load textures
  const topTex   = useTexture(getTextureUrl(topTexture));
  const pantsTex = useTexture(getTextureUrl(pantsTexture));
  const shoesTex = useTexture(getTextureUrl(shoesTexture));
  const eyesTex  = useTexture(getTextureUrl(eyesTexture));
  const hairTex  = useTexture(getTextureUrl(hairTexture));

  // ── Body type switch ─────────────────────────────────────────────────────
  useEffect(() => {
    const newPath = BODY_MAP[bodyType];
    if (newPath !== currentBodyPath && !isLoading) {
      setIsLoading(true);
      if (groupRef.current) {
        groupRef.current.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.geometry?.dispose();
            const mats = Array.isArray(node.material) ? node.material : [node.material];
            mats.forEach((m) => m?.dispose());
          }
        });
        groupRef.current.clear();
      }
      setCurrentBodyPath(newPath);
      setIsLoading(false);
    }
  }, [bodyType, currentBodyPath, isLoading]);

  // ── Apply textures to base avatar ────────────────────────────────────────
  useEffect(() => {
    if (!scene) return;
    const cloned = scene.clone();
    cloned.traverse((node: THREE.Object3D) => {
      if (!(node instanceof THREE.Mesh) || !node.material) return;
      const mat = (node.material as THREE.MeshStandardMaterial).clone();
      node.material = mat;
      const n  = node.name;
      const nl = n.toLowerCase();
      if (n === 'Top' || n.includes('Outfit_Top')) {
        mat.map = topTex; mat.needsUpdate = true;
        node.visible = visibleParts.top !== false;
      } else if (n === 'Pants' || n.includes('Outfit_Bottom')) {
        mat.map = pantsTex; mat.needsUpdate = true;
        node.visible = visibleParts.pants !== false;
      } else if (n === 'Shoes' || n.includes('Outfit_Footwear')) {
        mat.map = shoesTex; mat.needsUpdate = true;
        node.visible = visibleParts.shoes !== false;
      } else if (n === 'Hair') {
        mat.map = hairTex; mat.needsUpdate = true;
        node.visible = visibleParts.hair !== false;
      } else if (n === 'Eyes' || (nl.includes('eye') && !nl.includes('eyebrow'))) {
        mat.map = eyesTex;
        mat.transparent = false; mat.depthWrite = true; mat.needsUpdate = true;
        node.visible = true; node.frustumCulled = false; node.renderOrder = 1;
      }
    });
    if (groupRef.current) {
      groupRef.current.clear();
      groupRef.current.add(cloned);
    }
  }, [scene, topTex, pantsTex, shoesTex, eyesTex, hairTex, visibleParts, bodyType]);

  // ── Shared attach helper ─────────────────────────────────────────────────
  // Clones a GLB scene, applies anchor positioning, prepares meshes, attaches to Armature.
  // anchorType → ANCHORS_MALE / ANCHORS_FEMALE in config/anchors.ts (per bodyType)
  // offset     → per-item fine-tune from config/items.ts
  const attach = (
    src: THREE.Group,
    ref: React.MutableRefObject<THREE.Group | null>,
    anchorType: 'body' | 'legs' | 'feet' | 'face' | 'head' | 'unisex',
    offset?: [number, number, number],
    onClone?: (clone: THREE.Group) => void,
  ) => {
    if (!groupRef.current) return;
    let armature: THREE.Object3D | undefined;
    groupRef.current.traverse((n) => { if (n.name === 'Armature') armature = n; });
    if (!armature) return;

    const clone = src.clone();
    // Pass bodyType so applyAnchor picks the correct male/female anchor set
    applyAnchor(clone, anchorType, offset, undefined, bodyType);
    prepareMesh(clone);
    onClone?.(clone);
    disposeObject(ref.current);
    armature.add(clone);
    ref.current = clone;
  };

  const detach = (
    ref: React.MutableRefObject<THREE.Group | null>,
    onRemove?: () => void,
  ) => {
    disposeObject(ref.current);
    ref.current = null;
    onRemove?.();
  };

  // ── JACKET ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!jacketPath || !jacketScene) {
      detach(jacketRef);
      groupRef.current?.traverse((n: THREE.Object3D) => {
        if (n.name === 'Top') n.visible = true;
      });
      return;
    }
    const t = setTimeout(() => {
      // Old RPM jackets (FJ1-3, MJ1-2) have root node 'Wolf3D_Outfit_Top' - use attach()
      // New Sketchfab jackets (J4-J8) have root 'Sketchfab_model' - need manual positioning
      const isSketchfab = jacketScene.name === 'Sketchfab_model' || 
                          jacketScene.children?.[0]?.name === 'Sketchfab_model' ||
                          jacketScene.getObjectByName('Sketchfab_model') !== undefined;

      if (!isSketchfab) {
        // Old RPM jacket - restore body first, then attach
        groupRef.current?.traverse((n: THREE.Object3D) => {
          if (n.name === 'Top') n.visible = true;
        });
        attach(jacketScene, jacketRef, 'body');
        return;
      }

      // New Sketchfab jacket - hardcoded scale + position per jacket
      // Reference: FJ1 sizeX=0.957, centerY=1.262
      const REF_SIZE_X = 0.957;
      const REF_CENTER_Y = 1.262;

      const jacketConfigs: Record<string, { sizeX: number; centerY: number; scaleMultiplier?: number; zOffset?: number; yOffset?: number }> = {
        'J4.glb': { sizeX: 5.556, centerY: 5.657, scaleMultiplier: 1.1, zOffset: 0.08, yOffset: -0.1 },
        'J5.glb': { sizeX: 5.340, centerY: 5.742, scaleMultiplier: 1.056, zOffset: 0.08, yOffset: -0.1 },
        'J6.glb': { sizeX: 3.847, centerY: -0.168, yOffset: -0.5 },
        'J7.glb': { sizeX: 1.280, centerY: 0.008, yOffset: -1.0, scaleMultiplier: 0.8 },
        'J8.glb': { sizeX: 105.398, centerY: 86.188 },
      };

      const fileName = jacketPath.split('/').pop() ?? '';
      const cfg = jacketConfigs[fileName];

      if (!groupRef.current) return;
      let armature: THREE.Object3D | undefined;
      groupRef.current.traverse((n) => { if (n.name === 'Armature') armature = n; });
      if (!armature) return;

      const clone = jacketScene.clone();

      if (cfg) {
        // Scale to match FJ1's width
        const scale = (REF_SIZE_X / cfg.sizeX) * (cfg.scaleMultiplier ?? 1.0);
        clone.scale.set(scale, scale, scale);

        // Find Spine2 bone world position - this is the torso center
        let spine2WorldY = REF_CENTER_Y; // fallback
        groupRef.current.traverse((n) => {
          if (n.name === 'Spine2' || n.name === 'Spine1') {
            const worldPos = new THREE.Vector3();
            n.getWorldPosition(worldPos);
            // Convert to armature local space
            const localPos = armature!.worldToLocal(worldPos.clone());
            spine2WorldY = localPos.y;
          }
        });

        // Position jacket center at spine2
        clone.position.set(0, spine2WorldY - cfg.centerY * scale + (cfg.yOffset ?? 0), cfg.zOffset ?? 0);
      }

      // Force materials visible
      clone.traverse((n: THREE.Object3D) => {
        n.visible = true;
        if (n instanceof THREE.Mesh && n.material) {
          const mats = Array.isArray(n.material) ? n.material : [n.material];
          mats.forEach((m: any) => {
            m.transparent = false; m.opacity = 1;
            m.alphaTest = 0; m.depthWrite = true;
            m.side = THREE.DoubleSide; m.needsUpdate = true;
          });
          n.frustumCulled = false;
        }
      });

      disposeObject(jacketRef.current);
      armature.add(clone);
      jacketRef.current = clone;

      // For static jackets: hide Top shirt only
      if (cfg) {
        groupRef.current?.traverse((n: THREE.Object3D) => {
          if (n.name === 'Top') n.visible = false;
        });
      }
    }, 150); // slightly longer delay to ensure avatar is loaded
    return () => { clearTimeout(t); disposeObject(jacketRef.current); };
  }, [jacketScene, jacketPath, accessories.jacket, bodyType, scene]);

  // ── PANTS ACCESSORY ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!pantsPath || !pantsAccScene) {
      detach(pantsAccRef, () => {
        groupRef.current?.traverse((n) => { if (n.name === 'Pants') n.visible = true; });
      });
      return;
    }
    const t = setTimeout(() => {
      // Check if Sketchfab static mesh (P3-P7)
      const isSketchfab = pantsAccScene.getObjectByName('Sketchfab_model') !== undefined;

      if (!isSketchfab) {
        // Original RPM pants - works with attach
        attach(pantsAccScene, pantsAccRef, 'legs', undefined, () => {
          groupRef.current?.traverse((n) => { if (n.name === 'Pants') n.visible = false; });
        });
        return;
      }

      // Sketchfab static pants - manual positioning
      if (!groupRef.current) return;
      let armature: THREE.Object3D | undefined;
      groupRef.current.traverse((n) => { if (n.name === 'Armature') armature = n; });
      if (!armature) return;

      // Per-pants config [yOffset, scaleMultiplier, zOffset]
      const fileName = pantsPath.split('/').pop() ?? '';
      const pantsConfigs: Record<string, { yOffset?: number; scaleMultiplier?: number; zOffset?: number }> = {
        'P3.glb': { yOffset: -0.45, scaleMultiplier: 1.3 },
        'P4.glb': {},
        'P5.glb': {},
        'P6.glb': { yOffset: -0.3 },
        'P7.glb': {},
      };
      const cfg = pantsConfigs[fileName] ?? {};

      // Reference: FB1 legs anchor position
      const REF_LEGS_Y = -0.5;
      let legsY = REF_LEGS_Y;
      groupRef.current.traverse((n) => {
        if (n.name === 'LeftUpLeg' || n.name === 'Hips') {
          const wp = new THREE.Vector3();
          n.getWorldPosition(wp);
          const lp = armature!.worldToLocal(wp.clone());
          legsY = lp.y;
        }
      });

      const clone = pantsAccScene.clone();
      const box = new THREE.Box3().setFromObject(clone);
      const size = new THREE.Vector3();
      box.getSize(size);

      // Use a smaller reference to make pants fit properly
      const scale = size.x > 0 ? (0.35 / size.x) * (cfg.scaleMultiplier ?? 1.0) : 1;
      clone.scale.set(scale, scale, scale);

      const boxS = new THREE.Box3().setFromObject(clone);
      const centerS = new THREE.Vector3();
      boxS.getCenter(centerS);
      clone.position.set(0, legsY - centerS.y + (cfg.yOffset ?? 0), cfg.zOffset ?? 0);

      clone.traverse((n: THREE.Object3D) => {
        n.visible = true;
        if (n instanceof THREE.Mesh && n.material) {
          const mats = Array.isArray(n.material) ? n.material : [n.material];
          mats.forEach((m: any) => {
            m.transparent = false; m.opacity = 1; m.alphaTest = 0;
            m.depthWrite = true; m.side = THREE.DoubleSide; m.needsUpdate = true;
          });
          n.frustumCulled = false;
        }
      });

      // Only hide avatar Pants mesh, keep Body (legs) visible
      groupRef.current.traverse((n) => {
        if (n.name === 'Pants') n.visible = false;
        // Keep Body, Legs visible
      });

      disposeObject(pantsAccRef.current);
      armature.add(clone);
      pantsAccRef.current = clone;
    }, 100);
    return () => { clearTimeout(t); disposeObject(pantsAccRef.current); };
  }, [pantsAccScene, pantsPath, accessories.pants, bodyType, scene]);

  // ── HAIR ACCESSORY ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!hairPath || !hairAccScene) {
      detach(hairAccRef, () => {
        groupRef.current?.traverse((n) => { if (n.name === 'Hair') n.visible = true; });
      });
      return;
    }
    const t = setTimeout(() => {
      attach(hairAccScene, hairAccRef, 'head', undefined, (clone) => {
        // Auto-scale & position hair2+ to match hair1
        if ((accessories.hair ?? 0) >= 2 && hair1RefGLTF.scene) {
          const hairOffsets: Record<number, [number, number, number]> = {
            2: [0, 0, 0],
            3: [0, -0.09, -0.15],
            4: [0, -0.12, 0.05],
            5: [0, 0.28, 0.02],
            6: [0, -0.22, 0.07],
          };
          const hairScaleMultiplier: Record<number, number> = {
            2: 1.0, 3: 1.3, 4: 1.2, 5: 0.5, 6: 1.3,
          };
          const hairRotation: Record<number, [number, number, number]> = {
            2: [0, 0, 0], 3: [0.3, 0, 0], 4: [0, 0, 0], 5: [0, 0, 0], 6: [0, 0, 0],
          };
          const box1 = new THREE.Box3().setFromObject(hair1RefGLTF.scene);
          const box2 = new THREE.Box3().setFromObject(clone);
          const size1 = new THREE.Vector3(); const size2 = new THREE.Vector3();
          const center1 = new THREE.Vector3();
          box1.getSize(size1); box2.getSize(size2); box1.getCenter(center1);
          if (size2.y > 0 && size1.y > 0) {
            const multiplier = hairScaleMultiplier[accessories.hair!] ?? 1.0;
            const scaleFactor = (size1.y / size2.y) * multiplier;
            clone.scale.set(scaleFactor, scaleFactor, scaleFactor);
            const box2s = new THREE.Box3().setFromObject(clone);
            const center2s = new THREE.Vector3(); box2s.getCenter(center2s);
            const off = hairOffsets[accessories.hair!] ?? [0, 0, 0];
            clone.position.x += center1.x - center2s.x + off[0];
            clone.position.y += box1.min.y - box2s.min.y + off[1];
            clone.position.z += center1.z - center2s.z + off[2];
            const rot = hairRotation[accessories.hair!] ?? [0, 0, 0];
            clone.rotation.set(rot[0], rot[1], rot[2]);
          }
        }
        // Force visibility + black color for hair 4/5/6
        clone.traverse((n) => {
          n.visible = true;
          if (n instanceof THREE.Mesh && n.material) {
            const mats = Array.isArray(n.material) ? n.material : [n.material];
            mats.forEach((m: any) => {
              m.transparent = false; m.opacity = 1;
              m.side = THREE.DoubleSide; m.depthWrite = true; m.depthTest = true;
              if ([4, 5, 6].includes(accessories.hair ?? 0) && 'color' in m) {
                m.color.set(new THREE.Color('#111111'));
              }
              m.needsUpdate = true;
            });
          }
        });
        groupRef.current?.traverse((n) => { if (n.name === 'Hair') n.visible = false; });
      });
    }, 100);
    return () => { clearTimeout(t); disposeObject(hairAccRef.current); };
  }, [hairAccScene, hairPath, accessories.hair, bodyType, scene]);

  // ── MASK ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!maskPath || !maskAccScene) { detach(maskAccRef); return; }

    // Per-mask config split by gender — tweak female values independently
    const maskConfig: Record<'women' | 'men', Record<number, { offset: [number,number,number]; scale: number }>> = {
      women: {
        1: { offset: [0, 0.07, 0],    scale: 1.0 },
        2: { offset: [0, 1.44, 0.12], scale: 0.4 },  // plague_mask female — tweak here
      },
      men: {
        1: { offset: [0, 0.07, 0],    scale: 1.0 },
        2: { offset: [0, 1.53, 0.11], scale: 0.4 },  // plague_mask male — correct
      },
    };
    const cfg = maskConfig[gender][accessories.mask ?? 1] ?? maskConfig[gender][1];

    const t = setTimeout(() => {
      if (!groupRef.current) return;
      let armature: THREE.Object3D | undefined;
      groupRef.current.traverse((n) => { if (n.name === 'Armature') armature = n; });
      if (!armature) return;

      const clone = maskAccScene.clone();
      prepareMesh(clone);

      // Wrap in a pivot group — this is the ONLY reliable way to move/scale
      // a skinned mesh because bone matrices override node transforms directly.
      const pivot = new THREE.Group();
      pivot.position.set(cfg.offset[0], cfg.offset[1], cfg.offset[2]);
      pivot.scale.setScalar(cfg.scale);
      pivot.add(clone);

      disposeObject(maskAccRef.current);
      armature.add(pivot);
      maskAccRef.current = pivot;
      console.log('🎭 Mask attached. pivot pos:', pivot.position, 'scale:', pivot.scale.x, 'armature children:', armature.children.length);
    }, 100);
    return () => { clearTimeout(t); disposeObject(maskAccRef.current); };
  }, [maskAccScene, maskPath, accessories.mask, bodyType, scene]);

  // ── FULL SUIT ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!fullSuitPath || !fullSuitScene) {
      if (fullSuitRef.current) {
        fullSuitRef.current.parent?.remove(fullSuitRef.current);
        disposeObject(fullSuitRef.current);
        fullSuitRef.current = null;
      }
      // Restore all avatar parts
      groupRef.current?.traverse((n) => { n.visible = true; });
      return;
    }

    const t = setTimeout(() => {
      if (!groupRef.current) return;

      // Hide custom avatar body parts
      groupRef.current.traverse((n) => {
        if (['Top', 'Pants', 'Shoes', 'Body'].includes(n.name)) n.visible = false;
        if (n.name === 'Hair' && accessories.fullSuit === 2) n.visible = false;
      });

      const clone = fullSuitScene.clone();
      clone.position.set(0, 0, 0);
      clone.scale.set(1, 1, 1);
      clone.rotation.set(0, 0, 0);

      // Force all meshes visible with proper materials
      clone.traverse((n: THREE.Object3D) => {
        n.visible = true;
        if ((n instanceof THREE.Mesh || n instanceof THREE.SkinnedMesh) && n.material) {
          const mats = Array.isArray(n.material) ? n.material : [n.material];
          mats.forEach((m: any) => {
            m.transparent = false;
            m.opacity = 1;
            m.alphaTest = 0;
            m.depthWrite = true;
            m.depthTest = true;
            m.side = THREE.DoubleSide;
            m.visible = true;
            m.needsUpdate = true;
          });
          n.frustumCulled = false;
          n.renderOrder = 0;
        }
      });

      // Remove old suit
      if (fullSuitRef.current) {
        fullSuitRef.current.parent?.remove(fullSuitRef.current);
        disposeObject(fullSuitRef.current);
      }

      // Add directly to groupRef (same level as avatar mesh)
      groupRef.current.add(clone);
      fullSuitRef.current = clone;
      console.log('👗 Suit added to groupRef, nodes:', clone.children.length);
    }, 100);

    return () => { clearTimeout(t); disposeObject(fullSuitRef.current); };
  }, [fullSuitScene, fullSuitPath, accessories.fullSuit, bodyType, scene]);

  // ── SHOES ACCESSORY ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!shoesPath || !shoesAccScene) {
      detach(shoesAccRef, () => {
        groupRef.current?.traverse((n) => { if (n.name === 'Shoes') n.visible = true; });
      });
      return;
    }
    const t = setTimeout(() => {
      let avatarSkeleton: THREE.Skeleton | undefined;
      groupRef.current?.traverse((n) => {
        if (n instanceof THREE.SkinnedMesh && n.skeleton) avatarSkeleton = n.skeleton;
      });
      attach(shoesAccScene, shoesAccRef, 'feet', undefined, (clone) => {
        groupRef.current?.traverse((n) => { if (n.name === 'Shoes') n.visible = false; });
        if (avatarSkeleton) {
          clone.traverse((n) => {
            if (n instanceof THREE.SkinnedMesh) n.bind(avatarSkeleton!);
          });
        }
      });
    }, 100);
    return () => { clearTimeout(t); disposeObject(shoesAccRef.current); };
  }, [shoesAccScene, shoesPath, accessories.shoes, bodyType, scene]);

  return <group ref={groupRef} position={[0, 0, 0]} scale={[1, 1, 1]} />;
}

// ─── PRELOAD ALL ASSETS ───────────────────────────────────────────────────────
const preload = (path: string) => useGLTF.preload(path);
Object.values(BODY_MAP).forEach(preload);
Object.values(ACCESSORY_FILES.jacket.women).forEach(preload);
Object.values(ACCESSORY_FILES.jacket.men).forEach(preload);
Object.values(ACCESSORY_FILES.pants.women).forEach(preload);
Object.values(ACCESSORY_FILES.pants.men).forEach(preload);
Object.values(ACCESSORY_FILES.hair.unisex).forEach(preload);
Object.values(ACCESSORY_FILES.mask.unisex).forEach(preload);
Object.values(ACCESSORY_FILES.fullSuit.women).forEach(preload);
Object.values(ACCESSORY_FILES.fullSuit.men).forEach(preload);
Object.values(ACCESSORY_FILES.shoes.women).forEach(preload);
Object.values(ACCESSORY_FILES.shoes.men).forEach(preload);
