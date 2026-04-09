import { useGLTF, useTexture } from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";
import { applyAnchor } from "./config/applyAnchor";
import { disposeObject } from "./config/disposeObject";
import { prepareMesh } from "./config/prepareMesh";
import { getTextureUrl } from "./textures";

// ─── MAPS ─────────────────────────────────────────────────────────────────────
const BODY_MAP = {
  female: '/avatars/female.glb', female1: '/avatars/female1.glb',
  female2: '/avatars/female2.glb', female3: '/avatars/female3.glb',
  male: '/avatars/male.glb', male1: '/avatars/male1.glb',
  male2: '/avatars/male2.glb', male3: '/avatars/male3.glb',
} as const;
export type BodyType = keyof typeof BODY_MAP;

const ACCESSORY_FILES = {
  jacket:   {
    women: { 1:'/accessories/jackets/FJ1.glb', 2:'/accessories/jackets/FJ2.glb', 3:'/accessories/jackets/FJ3.glb', 4:'/accessories/jackets/J4.glb', 5:'/accessories/jackets/J5.glb', 6:'/accessories/jackets/J6.glb', 7:'/accessories/jackets/J7.glb', 8:'/accessories/jackets/J8.glb' },
    men:   { 1:'/accessories/jackets/MJ1.glb', 2:'/accessories/jackets/MJ2.glb', 3:'/accessories/jackets/J4.glb', 4:'/accessories/jackets/J5.glb', 5:'/accessories/jackets/J6.glb', 6:'/accessories/jackets/J7.glb', 7:'/accessories/jackets/J8.glb' }
  },
  pants:    {
    women: { 1:'/accessories/bottoms/FB1.glb', 2:'/accessories/bottoms/FB2.glb', 3:'/accessories/bottoms/P3.glb', 4:'/accessories/bottoms/P4.glb', 5:'/accessories/bottoms/P5.glb', 6:'/accessories/bottoms/P6.glb', 7:'/accessories/bottoms/P7.glb' },
    men:   { 1:'/accessories/bottoms/MB1.glb', 2:'/accessories/bottoms/MB2.glb', 3:'/accessories/bottoms/P3.glb', 4:'/accessories/bottoms/P4.glb', 5:'/accessories/bottoms/P5.glb', 6:'/accessories/bottoms/P6.glb', 7:'/accessories/bottoms/P7.glb' }
  },
  hair:     { unisex: { 1:'/accessories/hair/hair.glb', 2:'/accessories/hair/hair2.glb', 3:'/accessories/hair/hair3.glb', 4:'/accessories/hair/hair4.glb', 5:'/accessories/hair/hair5.glb', 6:'/accessories/hair/hair6.glb' } },
  mask:     { unisex: { 1:'/accessories/masks/mask.glb', 2:'/plague_mask.glb' } },
  fullSuit: {
    women: { 1:'/accessories/suits/Female full suit/red_suit_women1c.glb', 2:'/accessories/suits/Female full suit/ninja_women.glb', 3:'/accessories/suits/Female full suit/cyberpunk_women.glb', 4:'/accessories/suits/Female full suit/female 4 full suit.glb', 5:'/accessories/suits/Female full suit/female 5 full suit.glb', 6:'/accessories/suits/Female full suit/female 6 full suit.glb', 7:'/accessories/suits/Female full suit/female 7 full suit.glb', 8:'/accessories/suits/Female full suit/female 8 full suit.glb' },
    men:   { 3:'/accessories/suits/Full3_men.glb' }
  },
  shoes:    { women: { 1:'/accessories/shoes/Shoes1_Women.glb', 2:'/accessories/shoes/Shoes2_Women.glb' }, men: { 1:'/accessories/shoes/Shoes1_Men.glb', 2:'/accessories/shoes/Shoes2_Men.glb' } },
} as const;

const getGender = (b: BodyType): 'women' | 'men' => b.startsWith('female') ? 'women' : 'men';

// ─── PROPS ────────────────────────────────────────────────────────────────────
export interface AvatarCustomizerProps {
  bodyType: BodyType;
  topTexture: string; pantsTexture: string; shoesTexture: string;
  eyesTexture: string; hairTexture: string;
  visibleParts?: { hair?: boolean; top?: boolean; pants?: boolean; shoes?: boolean };
  accessories?: { jacket?: number|null; pants?: number|null; hair?: number|null; mask?: number|null; fullSuit?: number|null; shoes?: number|null };
  accessoryColors?: { jacket?: string|null; pants?: string|null; hair?: string|null; mask?: string|null; fullSuit?: string|null; shoes?: string|null };
  skinColor?: string | null;
}

// ─── HELPER ───────────────────────────────────────────────────────────────────
function tintObject(obj: THREE.Object3D, hex: string | null | undefined) {
  if (!hex) return;
  const c = new THREE.Color(hex);
  obj.traverse((n) => {
    if (n instanceof THREE.Mesh) {
      const mats = Array.isArray(n.material) ? n.material : [n.material];
      mats.forEach((m: any) => { if ('color' in m) { m.color.set(c); m.needsUpdate = true; } });
    }
  });
}

// ─── ACCESSORY LOADER (lazy — only fetches GLB when mounted) ──────────────────
function AccessoryLoader({ path, bodyRef, accRef, anchorType, bodyType, color, onAttach, onDetach }: {
  path: string;
  bodyRef: React.MutableRefObject<THREE.Group | null>;
  accRef: React.MutableRefObject<THREE.Group | null>;
  anchorType: 'body'|'legs'|'feet'|'face'|'head'|'unisex';
  bodyType: BodyType; color?: string|null;
  onAttach?: (clone: THREE.Group) => void;
  onDetach?: () => void;
}) {
  const { scene } = useGLTF(path) as any;
  useEffect(() => {
    if (!scene || !bodyRef.current) return;
    let arm: THREE.Object3D | undefined;
    bodyRef.current.traverse((n) => { if (n.name === 'Armature') arm = n; });
    if (!arm) return;
    const clone = scene.clone();
    applyAnchor(clone, anchorType, undefined, undefined, bodyType);
    prepareMesh(clone);
    onAttach?.(clone);
    tintObject(clone, color);
    disposeObject(accRef.current);
    arm.add(clone);
    accRef.current = clone;
    return () => { disposeObject(accRef.current); accRef.current = null; onDetach?.(); };
  }, [scene, path, bodyType, color]);
  return null;
}

// ─── SKETCHFAB PANTS LOADER (for P3-P7 static meshes) ───────────────────────
const PANTS_CONFIGS: Record<string, { scaleMultiplier?: number; yOffset?: number; zOffset?: number }> = {
  'P3.glb': { scaleMultiplier: 1.2, yOffset: -0.45 },
  'P4.glb': { scaleMultiplier: 1.2, yOffset: -0.4},
  'P5.glb': {},
  'P6.glb': { scaleMultiplier: 1.4, yOffset: -0.3 },
  'P7.glb': {yOffset: -0.45},
};

function SketchfabPantsLoader({ path, bodyRef, accRef, bodyType, color }: {
  path: string;
  bodyRef: React.MutableRefObject<THREE.Group | null>;
  accRef: React.MutableRefObject<THREE.Group | null>;
  bodyType: BodyType; color?: string|null;
}) {
  const { scene } = useGLTF(path) as any;
  useEffect(() => {
    if (!scene || !bodyRef.current) return;
    let arm: THREE.Object3D | undefined;
    bodyRef.current.traverse((n) => { if (n.name === 'Armature') arm = n; });
    if (!arm) return;

    const fileName = path.split('/').pop() ?? '';
    const cfg = PANTS_CONFIGS[fileName] ?? {};
    const clone = scene.clone();

    // Scale based on FB1 reference width (0.56)
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3(); box.getSize(size);
    const scale = size.x > 0 ? (0.35 / size.x) * (cfg.scaleMultiplier ?? 1.0) : 1;
    clone.scale.set(scale, scale, scale);

    // Position at legs
    let legsY = -0.5;
    bodyRef.current.traverse((n) => {
      if (n.name === 'LeftUpLeg' || n.name === 'Hips') {
        const wp = new THREE.Vector3(); n.getWorldPosition(wp);
        const lp = arm!.worldToLocal(wp.clone());
        legsY = lp.y;
      }
    });
    const boxS = new THREE.Box3().setFromObject(clone);
    const centerS = new THREE.Vector3(); boxS.getCenter(centerS);
    clone.position.set(0, legsY - centerS.y + (cfg.yOffset ?? 0), cfg.zOffset ?? 0);

    clone.traverse((n: THREE.Object3D) => {
      n.visible = true;
      if (n instanceof THREE.Mesh && n.material) {
        const mats = Array.isArray(n.material) ? n.material : [n.material];
        mats.forEach((m: any) => { m.transparent=false; m.opacity=1; m.alphaTest=0; m.depthWrite=true; m.side=THREE.DoubleSide; m.needsUpdate=true; });
        n.frustumCulled = false;
      }
    });

    bodyRef.current.traverse((n) => { if (n.name === 'Pants') n.visible = false; });
    tintObject(clone, color);
    disposeObject(accRef.current);
    arm.add(clone);
    accRef.current = clone;

    return () => {
      disposeObject(accRef.current); accRef.current = null;
      bodyRef.current?.traverse((n) => { if (n.name === 'Pants') n.visible = true; });
    };
  }, [scene, path, bodyType, color]);
  return null;
}

// ─── SKETCHFAB JACKET LOADER (for J4-J8 static meshes) ──────────────────────
const JACKET_CONFIGS: Record<string, { sizeX: number; centerY: number; scaleMultiplier?: number; zOffset?: number; yOffset?: number; hideHands?: boolean }> = {
  'J4.glb': { sizeX: 5.556, centerY: 5.657, scaleMultiplier: 1.1, zOffset: 0.08, yOffset: -0.1, hideHands: true },
  'J5.glb': { sizeX: 5.340, centerY: 5.742, scaleMultiplier: 1.056, zOffset: 0.08, yOffset: -0.1, hideHands: true },
  'J6.glb': { sizeX: 3.847, centerY: -0.168, yOffset: -0.5, hideHands: true },
  'J7.glb': { sizeX: 1.280, centerY: 0.008, yOffset: -1.0, scaleMultiplier: 0.8 },
  'J8.glb': { sizeX: 700.984, centerY: 1268.198, scaleMultiplier: 100.0, yOffset: 170 },
};
const REF_SIZE_X = 0.957;
const REF_CENTER_Y = 1.262;

function SketchfabJacketLoader({ path, bodyRef, accRef, bodyType, color }: {
  path: string;
  bodyRef: React.MutableRefObject<THREE.Group | null>;
  accRef: React.MutableRefObject<THREE.Group | null>;
  bodyType: BodyType; color?: string|null;
}) {
  const { scene } = useGLTF(path) as any;
  useEffect(() => {
    if (!scene || !bodyRef.current) return;
    let arm: THREE.Object3D | undefined;
    bodyRef.current.traverse((n) => { if (n.name === 'Armature') arm = n; });
    if (!arm) return;

    const fileName = path.split('/').pop() ?? '';
    const cfg = JACKET_CONFIGS[fileName];
    const clone = scene.clone();

    if (cfg) {
      const scale = (REF_SIZE_X / cfg.sizeX) * (cfg.scaleMultiplier ?? 1.0);
      clone.scale.set(scale, scale, scale);
      let spine2WorldY = REF_CENTER_Y;
      bodyRef.current.traverse((n) => {
        if (n.name === 'Spine2' || n.name === 'Spine1') {
          const wp = new THREE.Vector3(); n.getWorldPosition(wp);
          const lp = arm!.worldToLocal(wp.clone());
          spine2WorldY = lp.y;
        }
      });
      clone.position.set(0, spine2WorldY - cfg.centerY * scale + (cfg.yOffset ?? 0), cfg.zOffset ?? 0);
    }

    clone.traverse((n: THREE.Object3D) => {
      n.visible = true;
      if (n instanceof THREE.Mesh && n.material) {
        const mats = Array.isArray(n.material) ? n.material : [n.material];
        mats.forEach((m: any) => { m.transparent=false; m.opacity=1; m.alphaTest=0; m.depthWrite=true; m.side=THREE.DoubleSide; m.needsUpdate=true; });
        n.frustumCulled = false;
      }
    });

    // Hide Top shirt + body (arms/hands) if configured
    bodyRef.current.traverse((n) => {
      if (n.name === 'Top') n.visible = false;
      if (cfg?.hideHands && n.name === 'Body') n.visible = false;
    });

    tintObject(clone, color);
    disposeObject(accRef.current);
    arm.add(clone);
    accRef.current = clone;

    return () => {
      disposeObject(accRef.current); accRef.current = null;
      bodyRef.current?.traverse((n) => {
        if (n.name === 'Top' || n.name === 'Body') n.visible = true;
      });
    };
  }, [scene, path, bodyType, color]);
  return null;
}

// ─── HAIR LOADER ──────────────────────────────────────────────────────────────
function HairLoader({ path, idx, bodyRef, accRef, bodyType, color }: {
  path: string; idx: number;
  bodyRef: React.MutableRefObject<THREE.Group | null>;
  accRef: React.MutableRefObject<THREE.Group | null>;
  bodyType: BodyType; color?: string|null;
}) {
  const { scene } = useGLTF(path) as any;
  const ref1      = useGLTF('/accessories/hair/hair.glb') as any;
  useEffect(() => {
    if (!scene || !bodyRef.current) return;
    let arm: THREE.Object3D | undefined;
    bodyRef.current.traverse((n) => { if (n.name === 'Armature') arm = n; });
    if (!arm) return;
    const clone = scene.clone();
    applyAnchor(clone, 'head', undefined, undefined, bodyType);
    prepareMesh(clone);
    if (idx >= 2 && ref1.scene) {
      const off: Record<number,[number,number,number]> = { 2:[0,.10,.05], 3:[0,-.09,-.12], 4:[0,-.125,.05], 5:[0,.28,.02], 6:[0,-.13,.07] };
      const mul: Record<number,number> = { 2:.77, 3:1.25, 4:1.2, 5:.5, 6:1.15 };
      const rot: Record<number,[number,number,number]> = { 2:[0,0,0], 3:[.3,0,0], 4:[0,0,0], 5:[0,0,0], 6:[0,0,0] };
      const b1=new THREE.Box3().setFromObject(ref1.scene), b2=new THREE.Box3().setFromObject(clone);
      const s1=new THREE.Vector3(), s2=new THREE.Vector3(), c1=new THREE.Vector3();
      b1.getSize(s1); b2.getSize(s2); b1.getCenter(c1);
      if (s2.y>0 && s1.y>0) {
        const sf=(s1.y/s2.y)*(mul[idx]??1); clone.scale.set(sf,sf,sf);
        const b2s=new THREE.Box3().setFromObject(clone), c2s=new THREE.Vector3(); b2s.getCenter(c2s);
        const o=off[idx]??[0,0,0];
        clone.position.x+=c1.x-c2s.x+o[0]; clone.position.y+=b1.min.y-b2s.min.y+o[1]; clone.position.z+=c1.z-c2s.z+o[2];
        const r=rot[idx]??[0,0,0]; clone.rotation.set(r[0],r[1],r[2]);
      }
    }
    clone.traverse((n: THREE.Object3D) => {
      n.visible=true;
      if (n instanceof THREE.Mesh && n.material) {
        const mats=Array.isArray(n.material)?n.material:[n.material];
        mats.forEach((m:any)=>{ m.transparent=false; m.opacity=1; m.side=THREE.DoubleSide; m.depthWrite=true; m.depthTest=true; if([4,5,6].includes(idx)&&'color'in m) m.color.set(new THREE.Color(color??'#111111')); m.needsUpdate=true; });
      }
    });
    if (color && ![4,5,6].includes(idx)) tintObject(clone, color);
    bodyRef.current?.traverse((n)=>{ if(n.name==='Hair') n.visible=false; });
    disposeObject(accRef.current);
    arm.add(clone);
    accRef.current = clone;
    return () => { disposeObject(accRef.current); accRef.current=null; bodyRef.current?.traverse((n)=>{ if(n.name==='Hair') n.visible=true; }); };
  }, [scene, path, idx, bodyType, color]);
  return null;
}

// ─── MASK LOADER ──────────────────────────────────────────────────────────────
function MaskLoader({ path, idx, gender, bodyRef, accRef, color }: {
  path: string; idx: number; gender: 'women'|'men';
  bodyRef: React.MutableRefObject<THREE.Group | null>;
  accRef: React.MutableRefObject<THREE.Group | null>;
  color?: string|null;
}) {
  const { scene } = useGLTF(path) as any;
  useEffect(() => {
    if (!scene || !bodyRef.current) return;
    let arm: THREE.Object3D | undefined;
    bodyRef.current.traverse((n) => { if (n.name === 'Armature') arm = n; });
    if (!arm) return;
    const cfgs = { women:{1:{o:[0,.014,0],s:1.0},2:{o:[0,1.44,.12],s:.4}}, men:{1:{o:[0,.09,0],s:1.0},2:{o:[0,1.53,.11],s:.4}} } as any;
    const cfg = cfgs[gender][idx] ?? cfgs[gender][1];
    const clone = scene.clone();
    prepareMesh(clone);
    tintObject(clone, color);
    const pivot = new THREE.Group();
    pivot.position.set(cfg.o[0], cfg.o[1], cfg.o[2]);
    pivot.scale.setScalar(cfg.s);
    pivot.add(clone);
    disposeObject(accRef.current);
    arm.add(pivot);
    accRef.current = pivot;
    return () => { disposeObject(accRef.current); accRef.current=null; };
  }, [scene, path, idx, gender, color]);
  return null;
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function AvatarCustomizer({
  bodyType, topTexture, pantsTexture, shoesTexture, eyesTexture, hairTexture,
  visibleParts    = { hair:true, top:true, pants:true, shoes:true },
  accessories     = { jacket:null, pants:null, hair:null, mask:null, fullSuit:null, shoes:null },
  accessoryColors = { jacket:null, pants:null, hair:null, mask:null, fullSuit:null, shoes:null },
  skinColor,
}: AvatarCustomizerProps) {
  const bodyRef     = useRef<THREE.Group>(null);
  const jacketRef   = useRef<THREE.Group|null>(null);
  const pantsAccRef = useRef<THREE.Group|null>(null);
  const hairAccRef  = useRef<THREE.Group|null>(null);
  const maskAccRef  = useRef<THREE.Group|null>(null);
  const suitRef     = useRef<THREE.Group|null>(null);
  const shoesAccRef = useRef<THREE.Group|null>(null);

  const gender = getGender(bodyType);

  // ── Body textures ──────────────────────────────────────────────────────────
  const { scene } = useGLTF(BODY_MAP[bodyType]) as any;
  const topTex    = useTexture(getTextureUrl(topTexture));
  const pantsTex  = useTexture(getTextureUrl(pantsTexture));
  const shoesTex  = useTexture(getTextureUrl(shoesTexture));
  const eyesTex   = useTexture(getTextureUrl(eyesTexture));
  const hairTex   = useTexture(getTextureUrl(hairTexture));

  useEffect(() => {
    if (!scene || !bodyRef.current) return;
    const cloned = scene.clone();
    cloned.traverse((node: THREE.Object3D) => {
      if (!(node instanceof THREE.Mesh) || !node.material) return;
      const mat = (node.material as THREE.MeshStandardMaterial).clone();
      node.material = mat;
      const n = node.name; const nl = n.toLowerCase();
      if (n==='Top'||n.includes('Outfit_Top'))           { mat.map=topTex;   mat.needsUpdate=true; node.visible=visibleParts.top!==false; }
      else if (n==='Pants'||n.includes('Outfit_Bottom')) { mat.map=pantsTex; mat.needsUpdate=true; node.visible=visibleParts.pants!==false; }
      else if (n==='Shoes'||n.includes('Outfit_Footwear')){ mat.map=shoesTex; mat.needsUpdate=true; node.visible=visibleParts.shoes!==false; }
      else if (n==='Hair')                               { mat.map=hairTex;  mat.needsUpdate=true; node.visible=visibleParts.hair!==false; }
      else if (n==='Eyes'||(nl.includes('eye')&&!nl.includes('eyebrow'))) {
        mat.map=eyesTex; mat.transparent=false; mat.depthWrite=true; mat.needsUpdate=true;
        node.visible=true; node.frustumCulled=false; node.renderOrder=1;
      }
      // Apply skin color to all skin meshes (everything except clothes, hair, eyes, teeth)
      const clothingMeshes = ['Top','Pants','Shoes','Hair','Eyes','Teeth'];
      if (skinColor && !clothingMeshes.includes(n) && !n.includes('Outfit') && !n.includes('Footwear')) {
        mat.color.set(new THREE.Color(skinColor));
        mat.needsUpdate=true;
      }
    });
    bodyRef.current.clear();
    bodyRef.current.add(cloned);
  }, [scene, topTex, pantsTex, shoesTex, eyesTex, hairTex, visibleParts, bodyType, skinColor]);

  // ── Resolve accessory paths (null = not selected = don't mount loader) ─────
  const jacketPath = accessories.jacket   ? (ACCESSORY_FILES.jacket[gender]   as any)[accessories.jacket]   ?? null : null;
  const pantsPath  = accessories.pants    ? (ACCESSORY_FILES.pants[gender]    as any)[accessories.pants]    ?? null : null;
  const hairPath   = accessories.hair     ? (ACCESSORY_FILES.hair.unisex      as any)[accessories.hair]     ?? null : null;
  const maskPath   = accessories.mask     ? (ACCESSORY_FILES.mask.unisex      as any)[accessories.mask]     ?? null : null;
  const suitPath   = accessories.fullSuit ? (ACCESSORY_FILES.fullSuit[gender] as any)[accessories.fullSuit] ?? null : null;
  const shoesPath  = accessories.shoes    ? (ACCESSORY_FILES.shoes[gender]    as any)[accessories.shoes]    ?? null : null;

  return (
    <group ref={bodyRef} position={[0,0,0]} scale={[1,1,1]}>

      {jacketPath && (
        <Suspense fallback={null}>
          {Object.keys(JACKET_CONFIGS).some(k => jacketPath.endsWith(k)) ? (
            <SketchfabJacketLoader path={jacketPath} bodyRef={bodyRef} accRef={jacketRef}
              bodyType={bodyType} color={accessoryColors.jacket} />
          ) : (
            <AccessoryLoader path={jacketPath} bodyRef={bodyRef} accRef={jacketRef}
              anchorType="body" bodyType={bodyType} color={accessoryColors.jacket} />
          )}
        </Suspense>
      )}

      {pantsPath && (
        <Suspense fallback={null}>
          {Object.keys(PANTS_CONFIGS).some(k => pantsPath.endsWith(k)) ? (
            <SketchfabPantsLoader path={pantsPath} bodyRef={bodyRef} accRef={pantsAccRef}
              bodyType={bodyType} color={accessoryColors.pants} />
          ) : (
            <AccessoryLoader path={pantsPath} bodyRef={bodyRef} accRef={pantsAccRef}
              anchorType="legs" bodyType={bodyType} color={accessoryColors.pants}
              onAttach={()=>{ bodyRef.current?.traverse((n)=>{ if(n.name==='Pants') n.visible=false; }); }}
              onDetach={()=>{ bodyRef.current?.traverse((n)=>{ if(n.name==='Pants') n.visible=true; }); }}
            />
          )}
        </Suspense>
      )}

      {hairPath && (
        <Suspense fallback={null}>
          <HairLoader path={hairPath} idx={accessories.hair??1}
            bodyRef={bodyRef} accRef={hairAccRef} bodyType={bodyType} color={accessoryColors.hair} />
        </Suspense>
      )}

      {maskPath && (
        <Suspense fallback={null}>
          <MaskLoader path={maskPath} idx={accessories.mask??1}
            gender={gender} bodyRef={bodyRef} accRef={maskAccRef} color={accessoryColors.mask} />
        </Suspense>
      )}

      {suitPath && (
        <Suspense fallback={null}>
          <AccessoryLoader path={suitPath} bodyRef={bodyRef} accRef={suitRef}
            anchorType="body" bodyType={bodyType} color={accessoryColors.fullSuit}
            onAttach={(clone)=>{
              bodyRef.current?.traverse((n)=>{ if(['Top','Pants'].includes(n.name)) n.visible=false; if(n.name==='Hair'&&accessories.fullSuit===2) n.visible=false; });
              let sk: THREE.Skeleton|undefined;
              bodyRef.current?.traverse((n)=>{ if(n instanceof THREE.SkinnedMesh&&n.skeleton) sk=n.skeleton; });
              if(sk) clone.traverse((n)=>{ if(n instanceof THREE.SkinnedMesh) n.bind(sk!); });
            }}
            onDetach={()=>{ bodyRef.current?.traverse((n)=>{ if(['Top','Pants','Hair'].includes(n.name)) n.visible=true; }); }}
          />
        </Suspense>
      )}

      {shoesPath && (
        <Suspense fallback={null}>
          <AccessoryLoader path={shoesPath} bodyRef={bodyRef} accRef={shoesAccRef}
            anchorType="feet" bodyType={bodyType} color={accessoryColors.shoes}
            onAttach={(clone)=>{
              bodyRef.current?.traverse((n)=>{ if(n.name==='Shoes') n.visible=false; });
              let sk: THREE.Skeleton|undefined;
              bodyRef.current?.traverse((n)=>{ if(n instanceof THREE.SkinnedMesh&&n.skeleton) sk=n.skeleton; });
              if(sk) clone.traverse((n)=>{ if(n instanceof THREE.SkinnedMesh) n.bind(sk!); });
            }}
            onDetach={()=>{ bodyRef.current?.traverse((n)=>{ if(n.name==='Shoes') n.visible=true; }); }}
          />
        </Suspense>
      )}

    </group>
  );
}

// Only preload the default body — everything else loads on demand
useGLTF.preload('/avatars/female.glb');
