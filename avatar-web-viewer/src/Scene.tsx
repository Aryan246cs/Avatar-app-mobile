import { ContactShadows, Environment, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Avatar } from './Avatar';

interface SceneProps {
  topTexture: string;
  pantsTexture: string;
  shoesTexture: string;
}

export function Scene({ topTexture, pantsTexture, shoesTexture }: SceneProps) {
  return (
    <div style={{ width: '100%', height: '100vh', background: '#f0f0f0' }}>
      <Canvas
        camera={{ position: [0, 1.6, 3], fov: 50 }}
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
        
        {/* Avatar with texture swapping */}
        <Avatar 
          topTexture={topTexture}
          pantsTexture={pantsTexture}
          shoesTexture={shoesTexture}
        />
        
        {/* DEBUG: Use simple avatar to see mesh names (commented out) */}
        {/* <DebugAvatar /> */}
        
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
          minDistance={2}
          maxDistance={10}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI - Math.PI / 6}
        />
      </Canvas>
    </div>
  );
}