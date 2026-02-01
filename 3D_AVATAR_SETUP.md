# 3D Avatar Integration Setup Guide

## Architecture Overview

```
┌─────────────────────────────────────────┐
│           Expo App (React Native)       │
│  ┌─────────────────────────────────────┐ │
│  │     avatar-editor.tsx               │ │
│  │  ┌─────────────────────────────────┐│ │
│  │  │        WebView                  ││ │
│  │  │  ┌─────────────────────────────┐││ │
│  │  │  │   React + Three.js App      │││ │
│  │  │  │   - Loads Untitled.glb      │││ │
│  │  │  │   - Renders 3D avatar       │││ │
│  │  │  │   - Swaps textures          │││ │
│  │  │  └─────────────────────────────┘││ │
│  │  └─────────────────────────────────┘│ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
        ↕ postMessage communication
```

## File Structure

```
avatar-app-mobile/
├── app/(main)/avatar-editor.tsx          # Updated with WebView integration
├── avatar-web-viewer/                    # New Three.js web app
│   ├── public/
│   │   └── Untitled.glb                 # Your Blender export (already placed)
│   ├── src/
│   │   ├── App.tsx                      # Main app with message handling
│   │   ├── Scene.tsx                    # Three.js scene setup
│   │   ├── Avatar.tsx                   # GLB loader and texture swapping
│   │   ├── textures.ts                  # Texture definitions
│   │   └── main.tsx                     # Entry point
│   └── package.json
```

## What Was Implemented

### 1. Web Viewer (avatar-web-viewer/)
- **React + Three.js app** using Vite
- **GLB Loading**: Uses `useGLTF('/Untitled.glb')` to load your Blender export
- **Texture Swapping**: Traverses scene and targets meshes by name:
  - `Top` mesh → Top clothing textures
  - `Pants` mesh → Pants textures  
  - `Shoes` mesh → Shoes textures
- **Message Handling**: Listens for postMessage from Expo WebView
- **Auto-rotation**: Avatar rotates automatically for better preview
- **Lighting**: Professional studio lighting setup

### 2. Expo Integration
- **WebView**: Embedded web viewer in `avatar-editor.tsx`
- **Message Sending**: Expo sends texture change commands to WebView
- **UI Controls**: Part selection (Top/Pants/Shoes) and texture options
- **Real-time Updates**: Changes reflect immediately in 3D preview

### 3. Communication Protocol
Messages sent from Expo to WebView:
```json
{ "type": "SET_TOP", "value": "top_black" }
{ "type": "SET_PANTS", "value": "pants_blue" }
{ "type": "SET_SHOES", "value": "shoes_white" }
```

## How to Use

### 1. Start the Web Viewer
```bash
cd avatar-web-viewer
npm run dev
```
The viewer runs on `http://localhost:5174`

### 2. Start the Expo App
```bash
npx expo start
```

### 3. Test the Integration
1. Open the Expo app on your device/simulator
2. Navigate to the Avatar Editor tab
3. The WebView should load the 3D avatar
4. Select different parts (Top/Pants/Shoes)
5. Choose different textures - they should update in real-time

## Mesh Requirements

Your `Untitled.glb` file should have meshes named exactly:
- **"Top"** - For shirts, jackets, etc.
- **"Pants"** - For pants, shorts, etc.
- **"Shoes"** - For footwear

The system will automatically find these meshes and apply textures to them.

## Adding New Textures

### Option 1: Data URLs (Current Implementation)
Edit `avatar-web-viewer/src/textures.ts` to add new texture data URLs.

### Option 2: Image Files (Recommended for Production)
1. Place texture images in `avatar-web-viewer/public/textures/`
2. Update texture paths in the code
3. Example: `/textures/top_red.jpg`

## Customization Options

### Change Avatar Position/Scale
In `Avatar.tsx`:
```tsx
<group ref={groupRef} position={[0, -1, 0]} scale={[1, 1, 1]} />
```

### Modify Lighting
In `Scene.tsx`:
```tsx
<ambientLight intensity={0.4} />
<directionalLight position={[5, 5, 5]} intensity={1} />
```

### Add More Mesh Types
1. Add new mesh names to the traverse function in `Avatar.tsx`
2. Add corresponding message types in `App.tsx`
3. Update Expo UI in `avatar-editor.tsx`

## Troubleshooting

### WebView Shows Blank/Loading
- Ensure web viewer is running on `http://localhost:5174`
- Check Metro bundler logs for WebView errors
- Verify network connectivity between Expo and localhost

### Textures Not Changing
- Check browser console in web viewer for errors
- Verify mesh names in Blender match exactly: "Top", "Pants", "Shoes"
- Ensure materials have texture slots available

### GLB Not Loading
- Verify `Untitled.glb` is in `avatar-web-viewer/public/`
- Check browser network tab for 404 errors
- Ensure GLB file is valid (test in Blender or online viewer)

## Production Deployment

For production, you'll need to:
1. Build the web viewer: `npm run build`
2. Host it on a web server (Vercel, Netlify, etc.)
3. Update WebView URL to the hosted version
4. Ensure CORS is configured for cross-origin requests

## Next Steps

1. **Test with your GLB**: Verify mesh names match the expected "Top", "Pants", "Shoes"
2. **Add real textures**: Replace data URLs with actual texture images
3. **Expand mesh support**: Add more clothing types (Hat, Gloves, etc.)
4. **Add animations**: Implement pose changes or idle animations
5. **Optimize performance**: Add texture compression and LOD systems