import { ContactShadows, Environment, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { AvatarCustomizer, type BodyType } from './AvatarCustomizer';

interface SceneProps {
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

export function Scene({ 
  bodyType,
  topTexture, 
  pantsTexture, 
  shoesTexture,
  eyesTexture,
  hairTexture,
  visibleParts 
}: SceneProps) {
  return (
    <div style={{ width: '100%', height: '100vh', background: '#f0f0f0' }}>
      <Canvas
        camera={{ position: [0, 0.2, 4.5], fov: 45 }}
        shadows
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        {/* Environment for reflections */}
        <Environment preset="studio" />
        
        {/* Avatar with full customization (female.glb by default) */}
        <AvatarCustomizer 
          bodyType={bodyType}
          topTexture={topTexture}
          pantsTexture={pantsTexture}
          shoesTexture={shoesTexture}
          eyesTexture={eyesTexture}
          hairTexture={hairTexture}
          visibleParts={visibleParts}
        />
        
        {/* Ground shadow */}
        <ContactShadows
          position={[0, -1.5, 0]}
          opacity={0.4}
          scale={10}
          blur={2}
          far={4}
        />
        
        {/* Camera controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={7}
          minPolarAngle={0}
          maxPolarAngle={Math.PI}
          target={[0, 0.2, 0]}
        />
      </Canvas>
    </div>
  );
}