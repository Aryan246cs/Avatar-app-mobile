import { ContactShadows, Environment, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { AvatarCustomizer, type BodyType } from './AvatarCustomizer';

interface SceneProps {
  bodyType: BodyType;
  topTexture: string;
  pantsTexture: string;
  shoesTexture: string;
  eyesTexture: string;
  hairTexture: string;
  visibleParts?: { hair?: boolean; top?: boolean; pants?: boolean; shoes?: boolean };
  accessories?: {
    jacket?: number | null; pants?: number | null; hair?: number | null;
    mask?: number | null; fullSuit?: number | null; shoes?: number | null;
  };
  accessoryColors?: {
    jacket?: string | null; pants?: string | null; hair?: string | null;
    mask?: string | null; fullSuit?: string | null; shoes?: string | null;
  };
}

export function Scene({
  bodyType, topTexture, pantsTexture, shoesTexture,
  eyesTexture, hairTexture, visibleParts, accessories, accessoryColors,
}: SceneProps) {
  return (
    <div style={{ width: '100%', height: '100vh', background: '#f8f9fa' }}>
      <Canvas camera={{ position: [0, 1.0, 4.5], fov: 30 }} shadows>
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <Environment preset="studio" />

        {/* Suspense is required by useGLTF — shows nothing while GLBs load */}
        <Suspense fallback={null}>
          <AvatarCustomizer
            bodyType={bodyType}
            topTexture={topTexture}
            pantsTexture={pantsTexture}
            shoesTexture={shoesTexture}
            eyesTexture={eyesTexture}
            hairTexture={hairTexture}
            visibleParts={visibleParts}
            accessories={accessories}
            accessoryColors={accessoryColors}
          />
        </Suspense>

        <ContactShadows position={[0, -1.5, 0]} opacity={0.3} scale={10} blur={2} far={4} />
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={7}
          minPolarAngle={0}
          maxPolarAngle={Math.PI}
          target={[0, 1.0, 0]}
        />
      </Canvas>
    </div>
  );
}
