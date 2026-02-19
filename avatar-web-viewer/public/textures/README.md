# Texture Folder Structure

This folder is structured for future PNG/JPG texture files.

## Current Status
- Using data URLs (SVG colors) in `src/textures.ts`
- Folder structure ready for image files

## Migration to PNG Textures

When ready to use actual texture images:

### 1. Add texture files to these folders:
```
textures/
├── eyes/
│   ├── eyes_default.png
│   ├── eyes_brown.png
│   ├── eyes_green.png
│   ├── eyes_gray.png
│   └── eyes_hazel.png
├── hair/
│   ├── hair_default.png
│   ├── hair_black.png
│   ├── hair_brown.png
│   ├── hair_blonde.png
│   ├── hair_red.png
│   └── hair_white.png
├── top/
│   ├── top_default.png
│   ├── top_black.png
│   ├── top_white.png
│   ├── top_red.png
│   └── top_green.png
├── pants/
│   ├── pants_default.png
│   ├── pants_blue.png
│   ├── pants_black.png
│   ├── pants_brown.png
│   └── pants_gray.png
└── shoes/
    ├── shoes_default.png
    ├── shoes_black.png
    ├── shoes_white.png
    └── shoes_brown.png
```

### 2. Update `src/textures.ts`:
```typescript
export const TEXTURES = {
  // Eyes
  eyes_default: '/textures/eyes/eyes_default.png',
  eyes_brown: '/textures/eyes/eyes_brown.png',
  // ... etc
};
```

### 3. That's it!
The `getTexturePath()` helper function is already set up for this migration.

## Texture Requirements
- Format: PNG (with transparency) or JPG
- Size: 512x512 or 1024x1024 recommended
- Color space: sRGB
- Compression: Optimize for web

## Performance Tips
- Use texture atlases for multiple small textures
- Enable mipmaps for better quality at distance
- Consider using compressed texture formats (KTX2, Basis)
