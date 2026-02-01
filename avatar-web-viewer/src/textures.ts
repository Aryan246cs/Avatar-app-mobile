// Default texture data URLs (simple colored squares)
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
  pants_brown: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#8b4513"/>
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
};