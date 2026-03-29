// Texture definitions — solid-color SVG data URLs.
// To swap to real PNG files, replace the data URL with a path like:
//   '/textures/top/top_default.png'

const svg = (fill: string) =>
  'data:image/svg+xml;base64,' +
  btoa(`<svg width="256" height="256" xmlns="http://www.w3.org/2000/svg"><rect width="256" height="256" fill="${fill}"/></svg>`);

const eye = (iris: string) =>
  'data:image/svg+xml;base64,' +
  btoa(`<svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
    <rect width="256" height="256" fill="#ffffff"/>
    <circle cx="128" cy="128" r="80" fill="${iris}"/>
    <circle cx="128" cy="128" r="40" fill="#000000"/>
    <circle cx="140" cy="115" r="15" fill="#ffffff" opacity="0.6"/>
  </svg>`);

export const TEXTURES = {
  // ── Tops ──────────────────────────────────────────────────────────────────
  top_default: svg('#2563eb'),
  top_black:   svg('#1f2937'),
  top_white:   svg('#f9fafb'),
  top_red:     svg('#dc2626'),
  top_green:   svg('#16a34a'),

  // ── Pants ─────────────────────────────────────────────────────────────────
  pants_default: svg('#374151'),
  pants_blue:    svg('#1e40af'),
  pants_black:   svg('#111827'),
  pants_brown:   svg('#92400e'),
  pants_gray:    svg('#374151'),

  // ── Shoes ─────────────────────────────────────────────────────────────────
  shoes_default: svg('#92400e'),
  shoes_black:   svg('#111827'),
  shoes_white:   svg('#f3f4f6'),
  shoes_brown:   svg('#78350f'),

  // ── Eyes ──────────────────────────────────────────────────────────────────
  eyes_default: eye('#1e3a8a'),
  eyes_brown:   eye('#78350f'),
  eyes_green:   eye('#15803d'),
  eyes_gray:    eye('#6b7280'),
  eyes_hazel:   eye('#92400e'),

  // ── Hair ──────────────────────────────────────────────────────────────────
  hair_default: svg('#1f2937'),
  hair_black:   svg('#000000'),
  hair_brown:   svg('#78350f'),
  hair_blonde:  svg('#fbbf24'),
  hair_red:     svg('#dc2626'),
  hair_white:   svg('#f3f4f6'),
};

export type TextureKey = keyof typeof TEXTURES;
