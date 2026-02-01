import { useGLTF } from '@react-three/drei';
import { useEffect } from 'react';
import * as THREE from 'three';

export function DebugAvatar() {
  const { scene } = useGLTF('/untitled.glb');

  useEffect(() => {
    if (!scene) {
      console.log('❌ Scene not loaded yet...');
      return;
    }

    console.log('✅ GLB LOADED SUCCESSFULLY!');
    console.log('Scene:', scene);
    
    // Log ALL objects in the scene
    console.log('\n=== ALL OBJECTS IN SCENE ===');
    scene.traverse((node) => {
      console.log(`${node.type}: "${node.name}" | Visible: ${node.visible}`);
      
      if (node instanceof THREE.Mesh) {
        console.log(`  └─ MESH: "${node.name}"`);
        console.log(`     Material: ${node.material?.type || 'none'}`);
        console.log(`     Geometry: ${node.geometry?.type || 'none'}`);
        console.log(`     Vertices: ${node.geometry?.attributes?.position?.count || 0}`);
      }
    });
    console.log('=== END SCENE DEBUG ===\n');

    // Calculate bounding box
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    
    console.log('📏 AVATAR DIMENSIONS:');
    console.log(`Size: ${size.x.toFixed(2)} x ${size.y.toFixed(2)} x ${size.z.toFixed(2)}`);
    console.log(`Center: ${center.x.toFixed(2)}, ${center.y.toFixed(2)}, ${center.z.toFixed(2)}`);
    
  }, [scene]);

  if (!scene) {
    return null;
  }

  return (
    <primitive 
      object={scene} 
      position={[0, -0.8, 0]} 
      scale={[1, 1, 1]}
    />
  );
}

useGLTF.preload('/untitled.glb');