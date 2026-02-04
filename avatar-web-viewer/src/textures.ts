// Default texture data URLs (more realistic, darker colors)
export const TEXTURES = {
  // Top textures - more realistic clothing colors
  top_default: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#2563eb"/>
    </svg>
  `),
  top_black: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#1f2937"/>
    </svg>
  `),
  top_white: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#f9fafb"/>
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
  
  // Pants textures - realistic denim and fabric colors
  pants_default: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#374151"/>
    </svg>
  `),
  pants_blue: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#1e40af"/>
    </svg>
  `),
  pants_brown: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#92400e"/>
    </svg>
  `),
  pants_black: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#111827"/>
    </svg>
  `),
  
  // Shoes textures - realistic shoe colors
  shoes_default: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#92400e"/>
    </svg>
  `),
  shoes_black: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#111827"/>
    </svg>
  `),
  shoes_white: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#f3f4f6"/>
    </svg>
  `),
  shoes_brown: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="#78350f"/>
    </svg>
  `),
};