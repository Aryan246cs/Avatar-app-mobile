# Avatar Customization System

## Overview

The avatar system uses Three.js for 3D rendering with a sophisticated texture and accessory system. Avatars are fully customizable with different body types, colors, and accessories.

## File Structure

### Avatar Models (`avatar-web-viewer/public/`)

**Base Bodies:**
- `female.glb`, `female1.glb`, `female2.glb`, `female3.glb` - Female body variants
- `male.glb`, `male1.glb`, `male2.glb`, `male3.glb` - Male body variants

**Accessories:**
- `jacket.glb` - Jacket accessory (unisex)
- `Pants.glb` - Pants accessory (unisex)
- `accessories/Accessories/Full Suit/Full3_men.glb` - Full suit (works for all)
- `accessories/Accessories/Shoes/` - Various shoe options

## Body Type Mapping

| UI Label | File | Gender | Build |
|----------|------|--------|-------|
| Female Slim | female.glb | Female | Slim |
| Female Average | female1.glb | Female | Average |
| Female Athletic | female2.glb | Female | Athletic |
| Female Heavy | female3.glb | Female | Heavy |
| Male Slim | male.glb | Male | Slim |
| Male Average | male1.glb | Male | Average |
| Male Athletic | male2.glb | Male | Athletic |
| Male Heavy | male3.glb | Male | Heavy |

## Mesh Structure

Each avatar GLB file contains:
- **Armature** - Skeleton for animation/deformation
- **Body** - Main body mesh
- **Head** - Head mesh
- **Eyes** - Eyes mesh (customizable color)
- **Hair** - Hair mesh (customizable color)
- **Top** - Shirt/top mesh (customizable color)
- **Pants** - Pants mesh (customizable color)
- **Shoes** - Shoes mesh (customizable color)
- **Teeth** - Teeth mesh

## Customization System

### Texture-Based Customization

Colors are applied via dynamically generated SVG textures:

```typescript
const TEXTURES = {
  eyes_default: 'data:image/svg+xml;base64,...',
  hair_black: 'data:image/svg+xml;base64,...',
  top_blue: 'data:image/svg+xml;base64,...',
  // ... etc
}
```

### Accessory System

**Simple Accessories (Jacket, Pants):**
- Loaded as separate GLB files
- Attached to avatar's Armature at [0, 0, 0]
- Toggle ON/OFF

**Complex Accessories (Full Suit, Shoes):**
- Complete avatar files (body + clothing)
- Avatar's body parts hidden
- Suit/shoes meshes bound to avatar's skeleton
- Ensures perfect fit and deformation

## Message Protocol

Communication between React Native and WebView:

```typescript
// Set body type
{ type: 'SET_BODY', value: 'female1' }

// Set colors
{ type: 'SET_EYES', value: 'eyes_brown' }
{ type: 'SET_HAIR', value: 'hair_blonde' }
{ type: 'SET_TOP', value: 'top_red' }
{ type: 'SET_PANTS', value: 'pants_blue' }
{ type: 'SET_SHOES', value: 'shoes_black' }

// Toggle simple accessories
{ type: 'TOGGLE_ACCESSORY', accessory: 'jacket', enabled: true }
{ type: 'TOGGLE_ACCESSORY', accessory: 'pants', enabled: true }

// Select complex accessories
{ type: 'SET_FULL_SUIT', selection: 3 }  // or null for OFF
{ type: 'SET_SHOES_ACCESSORY', selection: 1 }  // or null for OFF

// Toggle visibility
{ type: 'TOGGLE_VISIBILITY', part: 'hair', visible: false }
```

## Implementation Details

### Loading Accessories

1. **Detect Structure**: Check if accessory has its own Armature
2. **Find Avatar Skeleton**: Locate the avatar's skeleton for binding
3. **Hide Conflicting Parts**: Hide avatar parts that conflict with accessory
4. **Bind Meshes**: Bind accessory meshes to avatar skeleton
5. **Configure Materials**: Set proper rendering properties

### Skeleton Binding

```typescript
// Find avatar skeleton
let avatarSkeleton: THREE.Skeleton | undefined;
groupRef.current.traverse((node) => {
  if (node instanceof THREE.SkinnedMesh && node.skeleton) {
    avatarSkeleton = node.skeleton;
  }
});

// Bind accessory mesh to avatar skeleton
if (node instanceof THREE.SkinnedMesh) {
  node.bind(avatarSkeleton);
}
```

### Material Configuration

```typescript
materials.forEach((mat: any) => {
  mat.transparent = false;
  mat.opacity = 1;
  mat.side = THREE.DoubleSide;
  mat.depthWrite = true;
  mat.depthTest = true;
  mat.needsUpdate = true;
});
```

## Camera Setup

```typescript
camera.position.set(0, 0.2, 4.5);
camera.fov = 45;
controls.target.set(0, 0.2, 0);
```

## Performance Optimization

- **Preloading**: All GLB files preloaded on app start
- **Memory Management**: Proper disposal of geometries and materials
- **Frustum Culling**: Disabled for accessories to prevent disappearing
- **Texture Caching**: SVG textures generated once and reused

## Troubleshooting

### Accessory Not Visible
- Check if armature was found
- Verify skeleton binding succeeded
- Ensure material visibility is true
- Check frustumCulled is false

### Accessory Not Fitting
- Verify position is [0, 0, 0] on Armature
- Check if skeleton binding is working
- Ensure scale is [1, 1, 1]
- Verify avatar body parts are hidden

### Performance Issues
- Reduce polygon count in models
- Optimize texture sizes
- Limit number of active accessories
- Use simpler materials

## Future Enhancements

- [ ] Animation system
- [ ] More accessory options
- [ ] Custom texture uploads
- [ ] Avatar export/sharing
- [ ] Pose customization
- [ ] Background environments
