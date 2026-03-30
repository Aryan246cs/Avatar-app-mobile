import { useGLTF, useTexture } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { applyAnchor } from "./config/applyAnchor";
import { disposeObject } from "./config/disposeObject";
import { prepareMesh } from "./config/prepareMesh";
import { getTextureUrl } from "./textures";


// ─── BODY MAP ────────────────────────────────────────────────────────────────
const BODY_MAP = {
  female:  '/female.glb',
  female1: '/female1.glb',
  female2: '/female2.glb',
  female3: '/female3.glb',
  male:    '/male.glb',
  male1:   '/male1.glb',
  male2:   '/male2.glb',
  male3:   '/male3.glb',
} as const;

export type BodyType = keyof typeof BODY_MAP;

// ─── ACCESSORY FILE MAP ───────────────────────────────────────────────────────
const ACCESSORY_FILES = {
  jacket: {
    women: { 1: '/Jackets/FJ1.glb', 2: '/Jackets/FJ2.glb', 3: '/Jackets/FJ3.glb' },
    men:   { 1: '/Jackets/MJ1.glb', 2: '/Jackets/MJ2.glb' },
  },
  pants: {
    women: { 1: '/Bottoms/FB1.glb', 2: '/Bottoms/FB2.glb' },
    men:   { 1: '/Bottoms/MB1.glb', 2: '/Bottoms/MB2.glb' },
  },
  hair:  { unisex: { 1: '/hair.glb' } },
  mask:  { unisex: { 1: '/mask.glb', 2: '/plague_mask.glb' } },
  fullSuit: {
    women: { 1: '/accessories/Accessories/Full Suit/red suit women1c.glb' },
    men:   { 3: '/accessories/Accessories/Full Suit/Full3_men.glb' },
  },
  shoes: {
    women: { 1: '/accessories/Accessories/Shoes/Shoes1_Women.glb', 2: '/accessories/Accessories/Shoes/Shoes2_Women.glb' },
    men:   { 1: '/accessories/Accessories/Shoes/Shoes1_Men.glb',   2: '/accessories/Accessories/Shoes/Shoes2_Men.glb', 3: '/accessories/Accessories/Shoes/Shoes3_Men.glb' },
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
  const jacketGLTF   = useGLTF(jacketPath   ?? '/female.glb') as any;
  const pantsGLTF    = useGLTF(pantsPath    ?? '/female.glb') as any;
  const hairGLTF     = useGLTF(hairPath     ?? '/female.glb') as any;
  const maskGLTF     = useGLTF(maskPath     ?? '/female.glb') as any;
  const fullSuitGLTF = useGLTF(fullSuitPath ?? '/female.glb') as any;
  const shoesGLTF    = useGLTF(shoesPath    ?? '/female.glb') as any;

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
    if (!jacketPath || !jacketScene) { detach(jacketRef); return; }
    const t = setTimeout(() => attach(jacketScene, jacketRef, 'body'), 100);
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
      attach(pantsAccScene, pantsAccRef, 'legs', undefined, () => {
        groupRef.current?.traverse((n) => { if (n.name === 'Pants') n.visible = false; });
      });
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
      attach(hairAccScene, hairAccRef, 'head', undefined, () => {
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
      detach(fullSuitRef, () => {
        groupRef.current?.traverse((n) => {
          if (['Top', 'Pants'].includes(n.name)) n.visible = true;
        });
      });
      return;
    }
    const t = setTimeout(() => {
      let avatarSkeleton: THREE.Skeleton | undefined;
      groupRef.current?.traverse((n) => {
        if (n instanceof THREE.SkinnedMesh && n.skeleton) avatarSkeleton = n.skeleton;
      });
      attach(fullSuitScene, fullSuitRef, 'body', undefined, (clone) => {
        groupRef.current?.traverse((n) => {
          if (['Top', 'Pants'].includes(n.name)) n.visible = false;
        });
        if (avatarSkeleton) {
          clone.traverse((n) => {
            if (n instanceof THREE.SkinnedMesh) n.bind(avatarSkeleton!);
          });
        }
      });
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
