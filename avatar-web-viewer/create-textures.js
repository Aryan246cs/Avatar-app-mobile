// Simple script to create colored texture placeholders
const fs = require('fs');
const path = require('path');

// Create a simple 64x64 colored canvas and save as data URL
function createColorTexture(color, name) {
  // Create a simple SVG that can be used as texture
  const svg = `<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" fill="${color}"/>
  </svg>`;
  
  const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  
  // For now, we'll create simple HTML files that can serve as textures
  const htmlContent = `<!DOCTYPE html>
<html><head><style>body{margin:0;background:${color};width:64px;height:64px;}</style></head><body></body></html>`;
  
  fs.writeFileSync(path.join(__dirname, 'public', 'textures', `${name}.html`), htmlContent);
  console.log(`Created ${name}.html with color ${color}`);
}

// Create default textures
createColorTexture('#4169e1', 'top_default');     // Blue
createColorTexture('#000000', 'top_black');       // Black
createColorTexture('#ffffff', 'top_white');       // White

createColorTexture('#2e2e2e', 'pants_default');   // Dark gray
createColorTexture('#000080', 'pants_blue');      // Navy
createColorTexture('#8b4513', 'pants_brown');     // Brown

createColorTexture('#654321', 'shoes_default');   // Brown
createColorTexture('#000000', 'shoes_black');     // Black
createColorTexture('#ffffff', 'shoes_white');     // White

console.log('Texture placeholders created!');