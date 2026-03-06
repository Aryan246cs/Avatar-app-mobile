const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader.cjs');
const THREE = require('three');
const fs = require('fs');

const loader = new GLTFLoader();

// Analyze Full1_Women.glb
loader.load('./public/accessories/Accessories/Full Suit/Full1_Women.glb', (gltf) => {
  console.log('\n=== FULL1_WOMEN.GLB ANALYSIS ===\n');
  
  const scene = gltf.scene;
  
  console.log('Scene structure:');
  scene.traverse((node) => {
    const indent = '  '.repeat(getDepth(node, scene));
    console.log(`${indent}${node.type}: "${node.name}"`);
    
    if (node instanceof THREE.Mesh) {
      const bbox = new THREE.Box3().setFromObject(node);
      const size = new THREE.Vector3();
      bbox.getSize(size);
      const center = new THREE.Vector3();
      bbox.getCenter(center);
      
      console.log(`${indent}  Position: [${node.position.x.toFixed(3)}, ${node.position.y.toFixed(3)}, ${node.position.z.toFixed(3)}]`);
      console.log(`${indent}  BBox Center: [${center.x.toFixed(3)}, ${center.y.toFixed(3)}, ${center.z.toFixed(3)}]`);
      console.log(`${indent}  BBox Size: [${size.x.toFixed(3)}, ${size.y.toFixed(3)}, ${size.z.toFixed(3)}]`);
      console.log(`${indent}  Vertices: ${node.geometry.attributes.position.count}`);
      
      if (node.material) {
        console.log(`${indent}  Material: ${node.material.type}`);
        if (node.material.map) {
          console.log(`${indent}  Has texture map`);
        }
      }
    }
  });
  
  console.log('\n=== END ANALYSIS ===\n');
}, undefined, (error) => {
  console.error('Error loading GLB:', error);
});

function getDepth(node, root) {
  let depth = 0;
  let current = node;
  while (current.parent && current !== root) {
    depth++;
    current = current.parent;
  }
  return depth;
}
