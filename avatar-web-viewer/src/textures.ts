// Texture system with support for data URLs and future image files
// Structure: textures/[category]/[texture_name].png (for future migration)

export const TEXTURES = {
  // Top textures
  top_default: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#4169e1"/>
    </svg>
  `),
  top_black: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#000000"/>
    </svg>
  `),
  top_white: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#ffffff"/>
    </svg>
  `),
  top_red: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#dc2626"/>
    </svg>
  `),
  top_green: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#16a34a"/>
    </svg>
  `),
  
  // Pants textures
  pants_default: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#2e2e2e"/>
    </svg>
  `),
  pants_blue: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#000080"/>
    </svg>
  `),
  pants_black: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#000000"/>
    </svg>
  `),
  pants_brown: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#8b4513"/>
    </svg>
  `),
  pants_gray: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#374151"/>
    </svg>
  `),
  
  // Shoes textures
  shoes_default: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#654321"/>
    </svg>
  `),
  shoes_black: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#000000"/>
    </svg>
  `),
  shoes_white: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#ffffff"/>
    </svg>
  `),
  shoes_brown: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#92400e"/>
    </svg>
  `),
  
  // Eyes textures (NEW)
  eyes_default: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#1e3a8a"/>
    </svg>
  `),
  eyes_brown: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#78350f"/>
    </svg>
  `),
  eyes_green: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#15803d"/>
    </svg>
  `),
  eyes_gray: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#6b7280"/>
    </svg>
  `),
  eyes_hazel: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#92400e"/>
    </svg>
  `),
  
  // Hair textures (NEW)
  hair_default: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#1f2937"/>
    </svg>
  `),
  hair_black: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#000000"/>
    </svg>
  `),
  hair_brown: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#78350f"/>
    </svg>
  `),
  hair_blonde: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#fbbf24"/>
    </svg>
  `),
  hair_red: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#dc2626"/>
    </svg>
  `),
  hair_white: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#f3f4f6"/>
    </svg>
  `),
};

// Texture categories for organized structure (ready for PNG migration)
export const TEXTURE_CATEGORIES = {
  top: ['top_default', 'top_black', 'top_white', 'top_red', 'top_green'],
  pants: ['pants_default', 'pants_blue', 'pants_black', 'pants_brown', 'pants_gray'],
  shoes: ['shoes_default', 'shoes_black', 'shoes_white', 'shoes_brown'],
  eyes: ['eyes_default', 'eyes_brown', 'eyes_green', 'eyes_gray', 'eyes_hazel'],
  hair: ['hair_default', 'hair_black', 'hair_brown', 'hair_blonde', 'hair_red', 'hair_white'],
};

// Helper function to get texture path (for future PNG support)
export const getTexturePath = (category: string, textureName: string): string => {
  // Currently returns data URL, but can be switched to:
  // return `/textures/${category}/${textureName}.png`;
  return TEXTURES[textureName as keyof typeof TEXTURES];
};