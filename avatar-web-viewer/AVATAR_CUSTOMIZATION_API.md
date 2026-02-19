# Avatar Customization API

Complete guide for integrating avatar customization with React Native WebView.

## Message Protocol

Send messages from React Native to WebView using `postMessage`:

```typescript
webViewRef.current?.postMessage(JSON.stringify({
  type: 'MESSAGE_TYPE',
  value: 'texture_name'
}));
```

## Available Messages

### 1. Change Top Clothing
```typescript
{
  type: 'SET_TOP',
  value: 'top_black' | 'top_white' | 'top_red' | 'top_green' | 'top_default'
}
```

### 2. Change Pants
```typescript
{
  type: 'SET_PANTS',
  value: 'pants_blue' | 'pants_black' | 'pants_brown' | 'pants_gray' | 'pants_default'
}
```

### 3. Change Shoes
```typescript
{
  type: 'SET_SHOES',
  value: 'shoes_black' | 'shoes_white' | 'shoes_brown' | 'shoes_default'
}
```

### 4. Change Eyes (NEW)
```typescript
{
  type: 'SET_EYES',
  value: 'eyes_brown' | 'eyes_green' | 'eyes_gray' | 'eyes_hazel' | 'eyes_default'
}
```

### 5. Change Hair (NEW)
```typescript
{
  type: 'SET_HAIR',
  value: 'hair_black' | 'hair_brown' | 'hair_blonde' | 'hair_red' | 'hair_white' | 'hair_default'
}
```

### 6. Toggle Visibility (NEW)
```typescript
{
  type: 'TOGGLE_VISIBILITY',
  part: 'hair' | 'top' | 'pants' | 'shoes',
  visible: true | false
}
```

## React Native Integration Example

```typescript
import { useRef } from 'react';
import { WebView } from 'react-native-webview';

export function AvatarEditor() {
  const webViewRef = useRef<WebView>(null);

  const changeEyes = (color: string) => {
    webViewRef.current?.postMessage(JSON.stringify({
      type: 'SET_EYES',
      value: `eyes_${color}`
    }));
  };

  const changeHair = (color: string) => {
    webViewRef.current?.postMessage(JSON.stringify({
      type: 'SET_HAIR',
      value: `hair_${color}`
    }));
  };

  const toggleHair = (visible: boolean) => {
    webViewRef.current?.postMessage(JSON.stringify({
      type: 'TOGGLE_VISIBILITY',
      part: 'hair',
      visible: visible
    }));
  };

  return (
    <WebView
      ref={webViewRef}
      source={{ uri: 'http://localhost:5173' }}
      // ... other props
    />
  );
}
```

## Available Textures

### Eyes
- `eyes_default` - Blue eyes
- `eyes_brown` - Brown eyes
- `eyes_green` - Green eyes
- `eyes_gray` - Gray eyes
- `eyes_hazel` - Hazel eyes

### Hair
- `hair_default` - Dark gray
- `hair_black` - Black
- `hair_brown` - Brown
- `hair_blonde` - Blonde
- `hair_red` - Red
- `hair_white` - White/Gray

### Top (Existing)
- `top_default` - Blue
- `top_black` - Black
- `top_white` - White
- `top_red` - Red
- `top_green` - Green

### Pants (Existing)
- `pants_default` - Dark gray
- `pants_blue` - Blue jeans
- `pants_black` - Black
- `pants_brown` - Brown
- `pants_gray` - Gray

### Shoes (Existing)
- `shoes_default` - Brown
- `shoes_black` - Black
- `shoes_white` - White
- `shoes_brown` - Brown

## Mesh Names in avatar.glb

The system expects these exact mesh names:
- `Body` - Main body (not customizable)
- `Head` - Head mesh (not customizable)
- `Eyes` - Eye mesh (customizable)
- `Hair` - Hair mesh (customizable + toggleable)
- `Top` - Shirt/jacket (customizable + toggleable)
- `Pants` - Pants/shorts (customizable + toggleable)
- `Shoes` - Footwear (customizable + toggleable)
- `Teeth` - Teeth (not customizable)

## Adding New Textures

### 1. Add to textures.ts
```typescript
export const TEXTURES = {
  // ... existing textures
  eyes_purple: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#9333ea"/>
    </svg>
  `),
};
```

### 2. Add to category
```typescript
export const TEXTURE_CATEGORIES = {
  eyes: ['eyes_default', 'eyes_brown', 'eyes_green', 'eyes_gray', 'eyes_hazel', 'eyes_purple'],
  // ...
};
```

### 3. Use in React Native
```typescript
changeEyes('purple'); // Will use eyes_purple
```

## Performance Considerations

- Textures are loaded on demand
- Scene cloning prevents memory leaks
- Auto-rotation can be disabled if needed
- Visibility toggling is instant (no re-rendering)

## Troubleshooting

### Textures not changing
- Check mesh names in Blender match exactly
- Verify material has texture slot
- Check console for error messages

### WebView not loading
- Ensure 3D viewer is running on port 5173
- Check network connectivity
- Verify CORS settings

### Performance issues
- Reduce texture resolution
- Disable auto-rotation
- Use texture atlases
- Enable texture compression
