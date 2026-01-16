# Icon Reference

All icons in the Avatar App use the `IconSymbol` component which maps SF Symbols (iOS) to Material Icons (Android/Web).

## Icon Mappings

| SF Symbol Name | Material Icon | Used In |
|----------------|---------------|---------|
| `house.fill` | `home` | Tab Navigation - Home |
| `person.fill` | `person` | Tab Navigation - Editor, Avatar Preview |
| `square.grid.2x2.fill` | `apps` | Tab Navigation - Items, Home Card |
| `sparkles` | `auto-awesome` | Tab Navigation - AI, AI Generate Screen |
| `chevron.right` | `chevron-right` | Home Screen Cards |
| `paintpalette.fill` | `palette` | Avatar Editor - Skin |
| `scissors` | `content-cut` | Avatar Editor - Hair, Item Selection |
| `eye.fill` | `remove-red-eye` | Avatar Editor - Eyes |
| `tshirt.fill` | `checkroom` | Avatar Editor - Clothes, Item Selection |
| `eyeglasses` | `remove-red-eye` | Avatar Editor - Accessories, Item Selection |
| `crown.fill` | `star` | Item Selection - Hat |
| `circle.fill` | `circle` | Item Selection - Earrings |
| `checkmark` | `check` | Item Selection - Selected State |
| `hourglass` | `hourglass-empty` | AI Generate - Loading State |
| `info.circle.fill` | `info` | AI Generate - Info Card |

## How Icons Work

The `IconSymbol` component (`components/ui/icon-symbol.tsx`) automatically:
- Uses native SF Symbols on iOS
- Uses Material Icons on Android and Web
- Ensures consistent appearance across platforms

## Adding New Icons

To add a new icon:

1. Find the SF Symbol name from [SF Symbols app](https://developer.apple.com/sf-symbols/)
2. Find the matching Material Icon from [Icons Directory](https://icons.expo.fyi)
3. Add the mapping to `components/ui/icon-symbol.tsx`:

```typescript
const MAPPING = {
  // ... existing mappings
  'your.sf.symbol': 'material-icon-name',
} as IconMapping;
```

## Common Material Icons

If you need more icons, here are some useful Material Icons:
- `favorite` - Heart
- `settings` - Settings gear
- `search` - Search/magnifying glass
- `add` - Plus sign
- `delete` - Trash can
- `edit` - Pencil
- `camera` - Camera
- `photo` - Image/photo
- `download` - Download arrow
- `upload` - Upload arrow
- `share` - Share icon
- `menu` - Hamburger menu
- `close` - X/close icon
- `arrow-back` - Back arrow
- `arrow-forward` - Forward arrow

Browse all icons at: https://icons.expo.fyi
