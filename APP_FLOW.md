# Avatar App - User Flow

## Navigation Structure

```
┌─────────────────────────────────────────┐
│         App Launch (index.tsx)          │
│              ↓ Redirect                 │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Login Screen (login.tsx)        │
│   • Email input                         │
│   • Password input                      │
│   • Log In button                       │
│   • Sign Up button                      │
└─────────────────────────────────────────┘
                    ↓ After login
┌─────────────────────────────────────────┐
│      Main App - Tab Navigation          │
│         (main)/_layout.tsx              │
└─────────────────────────────────────────┘
         ↓           ↓           ↓           ↓
    ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
    │  Home  │  │ Editor │  │ Items  │  │   AI   │
    └────────┘  └────────┘  └────────┘  └────────┘
```

## Screen Details

### 1. Login Screen
**Purpose**: Entry point for authentication
**Features**:
- Email and password inputs
- Login and signup buttons (both work the same for now)
- Keyboard-aware layout
- Dark mode support

**User Actions**:
- Enter credentials → Tap "Log In" → Navigate to Home

---

### 2. Home Screen
**Purpose**: Dashboard and navigation hub
**Features**:
- Welcome message
- 3 navigation cards:
  - Create Avatar → Goes to Editor
  - Browse Items → Goes to Item Selection
  - AI Generate → Goes to AI Generate
- Stats display (avatars created, items owned)

**User Actions**:
- Tap any card → Navigate to that feature

---

### 3. Avatar Editor
**Purpose**: Customize avatar appearance
**Features**:
- Avatar preview (placeholder circle with icon)
- Part selector (Skin, Hair, Eyes, Clothes, Accessories)
- Customization options area (placeholder)
- Reset and Save buttons

**User Actions**:
- Select a part → See customization options
- Tap Save → Save avatar (mock action)
- Tap Reset → Reset changes (mock action)

---

### 4. Item Selection
**Purpose**: Browse and select items for avatar
**Features**:
- Category filter chips (All, Hair, Clothes, Accessories)
- Grid layout (2 columns)
- 9 mock items with icons and colors
- Selection state with checkmarks
- Apply button (appears when item selected)

**User Actions**:
- Tap category → Filter items
- Tap item → Select it (shows checkmark)
- Tap "Apply to Avatar" → Apply item (mock action)

---

### 5. AI Generate
**Purpose**: Generate custom items using AI
**Features**:
- Large text input for prompts
- 4 example prompts as quick actions
- Info card explaining feature status
- Generate button
- Loading state (2-second mock)

**User Actions**:
- Type prompt or tap example → Fill input
- Tap "Generate Item" → Show loading → Mock result

---

## Tab Navigation

Users can switch between screens anytime using the bottom tab bar:

```
┌─────────┬─────────┬─────────┬─────────┐
│  Home   │ Editor  │  Items  │   AI    │
│  🏠     │  👤     │  ⊞      │  ✨     │
└─────────┴─────────┴─────────┴─────────┘
```

## Data Flow (Current State)

All data is **mocked** and **local**:
- Login: Accepts any credentials
- Avatar: No persistence
- Items: Hardcoded array of 9 items
- AI: 2-second timeout simulation

## Future Integration Points

When adding backend:
1. **Login** → API call to authenticate
2. **Home** → Fetch user stats
3. **Editor** → Load/save avatar data
4. **Items** → Fetch item catalog
5. **AI** → Call AI generation service
