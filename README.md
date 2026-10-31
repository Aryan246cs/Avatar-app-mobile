# AVATARA — 3D Avatar Customization App

> A full-stack mobile application for creating, customizing, and sharing personalized 3D avatars, powered by React Native, Three.js, and AI image generation.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [3D Avatar System](#3d-avatar-system)
- [Accessory Catalog](#accessory-catalog)
- [Color & Customization System](#color--customization-system)
- [UI Theme](#ui-theme)
- [Known Limitations](#known-limitations)
- [Future Roadmap](#future-roadmap)

---

## Overview

AVATARA is a cross-platform mobile app that lets users build and personalize 3D avatars from a rich catalog of body types, clothing, accessories, and color options. The 3D viewer runs as a Vite + Three.js web app embedded inside a React Native WebView, enabling high-fidelity real-time rendering on mobile without native OpenGL bindings. Users can also generate AI-powered 2D avatar portraits using Qwen-Image through Hugging Face Inference Providers, save their creations to a personal gallery, and manage their profile — all backed by a Node.js/Express REST API with MongoDB persistence.

---

## Features

### 3D Avatar Editor
- 8 body types across male and female variants (slim, average, athletic, heavy)
- Real-time accessory swapping: jackets, bottoms, full suits, shoes, hair, and masks
- Per-accessory color tinting with RGB sliders and hex input
- 6 skin tone presets
- Eye color customization with preset swatches
- Camera orbit controls

### AI Image Generation
- Text-to-image generation via Qwen-Image (Hugging Face Inference Providers)
- Style options: Anime, Cartoon, NFT, Cyberpunk, Fantasy
- Mood and background controls
- Trait-based prompt building
- Save generated images to personal gallery

### Gallery
- Unified gallery for both AI-generated 2D images and saved 3D avatar configs
- Cloud persistence via MongoDB
- Share images via native share sheet
- Delete individual items

### User Accounts
- Email + password registration and login
- JWT-based authentication with AsyncStorage persistence
- Auto-login on app launch
- User profile with editable username and bio
- Avatar count tracking

### Navigation
- File-based routing via Expo Router
- 5-tab floating bottom navigation: Home, Avatar Editor, AI Generate, Gallery, Profile

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile Frontend | React Native (Expo), TypeScript |
| Routing | Expo Router (file-based) |
| 3D Rendering | Three.js + React Three Fiber, embedded via WebView |
| 3D Build Tool | Vite |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Authentication | JWT + bcrypt (cost factor 12) |
| AI Generation | Hugging Face Inference Providers (Qwen-Image) |
| State Management | React useState / useEffect |
| Token Storage | AsyncStorage |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     React Native (Expo)                         │
│                                                                 │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐  ┌───────────┐  │
│  │  Login   │  │ Avatar Editor│  │AI Generate│  │  Gallery  │  │
│  └──────────┘  └──────┬───────┘  └────┬─────┘  └─────┬─────┘  │
│                       │               │               │        │
│              postMessage()      fetch()          fetch()       │
│                       │               │               │        │
│          ┌────────────▼──────┐        │               │        │
│          │  WebView          │        │               │        │
│          │  (Vite + Three.js)│        │               │        │
│          │  localhost:5174   │        │               │        │
│          └───────────────────┘        │               │        │
└──────────────────────────────────────┼───────────────┼────────┘
                                        │               │
                              ┌─────────▼───────────────▼──────┐
                              │   Express REST API              │
                              │   localhost:5000                │
                              │                                 │
                              │  /api/auth      /api/avatar     │
                              │  /api/gallery   /api/profile    │
                              │  /api/generate-avatar           │
                              └──────────┬──────────────────────┘
                                         │
                          ┌──────────────┼──────────────────┐
                          │              │                  │
                   ┌──────▼──────┐  ┌───▼────┐  ┌─────────▼──────┐
                   │  MongoDB    │  │ bcrypt │  │  HuggingFace   │
                   │  (Mongoose) │  │  JWT   │  │  Inference API │
                   └─────────────┘  └────────┘  └────────────────┘
```

### Communication Flow: React Native ↔ 3D Viewer

```
React Native                    WebView (Three.js)
     │                                │
     │  postMessage({ type, value })  │
     │ ─────────────────────────────► │
     │                                │  update scene
     │                                │  (swap mesh / apply color)
```

---

## Project Structure

```
Avatar-app-mobile/
│
├── app/                            # Expo Router screens
│   ├── index.tsx                   # Entry point — auto-login check
│   ├── login.tsx                   # Login / Register screen
│   ├── _layout.tsx                 # Root layout (Stack navigator)
│   └── (main)/
│       ├── _layout.tsx             # Tab navigation (5 tabs)
│       ├── home.tsx                # Home / landing screen
│       ├── avatar-editor.tsx       # 3D avatar customization
│       ├── ai-generate.tsx         # AI image generation
│       ├── export-avatar.tsx       # Gallery (2D + 3D saved items)
│       └── profile.tsx             # User profile
│
├── backend/
│   ├── server.js                   # Express app entry point
│   ├── .env                        # Environment variables
│   ├── models/
│   │   ├── User.js                 # Auth model
│   │   ├── AvatarConfig.js         # Saved 3D avatar configuration
│   │   ├── Gallery.js              # AI-generated image records
│   │   └── Profile.js              # User profile (username, bio)
│   └── routes/
│       ├── auth.js                 # POST /register, POST /login
│       ├── avatar.js               # GET + POST avatar config
│       ├── gallery.js              # Gallery CRUD
│       ├── profile.js              # Profile read/update
│       └── generate-avatar.js      # HuggingFace AI generation
│
├── avatar-web-viewer/              # Vite + Three.js 3D viewer
│   ├── src/
│   │   ├── App.tsx                 # WebView message handler
│   │   ├── Scene.tsx               # Three.js scene setup
│   │   ├── AvatarCustomizer.tsx    # Main 3D customization component
│   │   ├── textures.ts             # Color texture generation
│   │   └── config/
│   │       ├── anchors.ts          # Accessory bone/position anchors
│   │       ├── items.ts            # Item catalog definitions
│   │       └── applyAnchor.ts      # Anchor application logic
│   └── public/
│       ├── avatars/                # 8 body GLB files
│       └── accessories/
│           ├── jackets/            # FJ1-3, MJ1-2, J4-J8
│           ├── bottoms/            # FB1-2, MB1-2, P3-P7
│           ├── suits/              # Female full suits (8), male suit
│           ├── shoes/              # Shoes1/2 Men/Women
│           ├── hair/               # hair.glb, hair2-6.glb
│           └── masks/              # mask.glb
│
├── utils/
│   ├── auth.ts                     # JWT token storage helpers
│   └── api.ts                      # API utility functions
│
├── assets/images/                  # App icons, splash, hero images
├── app.json                        # Expo configuration
├── start-app.js                    # Concurrent server launcher
└── package.json
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) running locally on port 27017
- [Expo Go](https://expo.dev/client) installed on your mobile device
- A [HuggingFace](https://huggingface.co/) account and API key

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd Avatar-app-mobile

# 2. Install root dependencies
npm install

# 3. Install backend dependencies
cd backend && npm install && cd ..

# 4. Install 3D viewer dependencies
cd avatar-web-viewer && npm install && cd ..

# 5. Configure environment variables
# Edit backend/.env (see Environment Variables section)
```

### Running the App

```bash
npm run dev
# or
node start-app.js
```

| Server | URL | Description |
|---|---|---|
| Backend API | `http://localhost:5000` | Express + MongoDB REST API |
| 3D Viewer | `http://localhost:5174` | Vite + Three.js avatar renderer |
| Expo Dev Server | QR code in terminal | React Native app |

Scan the QR code with **Expo Go** on your phone. Phone and PC must be on the same Wi-Fi network.

### Creating an Account

1. Open the app → Login screen appears
2. Tap **Sign Up** tab
3. Enter email + password (min 6 characters)
4. Tap **Create Account** → logged in automatically

---

## Environment Variables

`backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/avatar-app
JWT_SECRET=your-secret-key-change-this-in-production
HUGGINGFACE_API_KEY=hf_your_key_here
```

| Variable | Description |
|---|---|
| `PORT` | Express server port |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `HUGGINGFACE_API_KEY` | From [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) — needs "Make calls to Inference Providers" permission. Image generation may use provider credits or incur usage charges. |

---

## API Reference

All endpoints except auth require `Authorization: Bearer <token>` header.

### Authentication

| Method | Endpoint | Body | Response |
|---|---|---|---|
| `POST` | `/api/auth/register` | `{ email, password }` | `{ success, token }` |
| `POST` | `/api/auth/login` | `{ email, password }` | `{ success, token }` |

### 3D Avatar Config

| Method | Endpoint | Body | Response |
|---|---|---|---|
| `GET` | `/api/avatar/me` | — | Saved avatar config object |
| `POST` | `/api/avatar/save` | Avatar config JSON | `{ success, config }` |

### Gallery

| Method | Endpoint | Body | Response |
|---|---|---|---|
| `GET` | `/api/gallery/me` | — | Array of latest 20 items |
| `GET` | `/api/gallery/:id` | — | Single item with image data |
| `POST` | `/api/gallery/save` | `{ name, style, character, imageData }` | `{ success, item }` |
| `DELETE` | `/api/gallery/:id` | — | `{ success }` |

### User Profile

| Method | Endpoint | Body | Response |
|---|---|---|---|
| `GET` | `/api/profile/me` | — | `{ email, username, bio, avatarCount, joinedAt }` |
| `PUT` | `/api/profile/update` | `{ username?, bio? }` | Updated profile |

### AI Generation

| Method | Endpoint | Body | Response |
|---|---|---|---|
| `POST` | `/api/generate-avatar` | `{ style, character, traits, mood, background, seed }` | `{ success, image (base64) }` |

---

## 3D Avatar System

### Body Types

| Gender | Models |
|---|---|
| Female | `female.glb` (slim), `female1.glb` (average), `female2.glb` (athletic), `female3.glb` (heavy) |
| Male | `male.glb` (slim), `male1.glb` (average), `male2.glb` (athletic), `male3.glb` (heavy) |

### Accessory Attachment Strategies

**RPM (Ready Player Me) accessories** — FJ1-3, MJ1-2, FB1-2, MB1-2, Shoes, hair.glb, mask.glb
- Bind to the avatar's `Armature` skeleton
- Deform correctly with body shape
- Color tinting via material traversal

**Sketchfab accessories** — J4-J8, P3-P7, hair2-6.glb
- Static meshes positioned using bounding box calculations
- Auto-scaled to fit the target body type
- Hair models use hardcoded per-model position offsets

**Full Suits** — suits/Female full suit/ (8 variants)
- Suits 1–3 layer over the custom avatar (RPM-based)
- Suits 4–8 are complete RPM avatars that fully replace the custom body

### WebView Message Protocol

```typescript
// React Native sends:
webViewRef.current?.postMessage(JSON.stringify({ type: 'SET_BODY', value: 'female2' }));
```

| Message Type | Value | Description |
|---|---|---|
| `SET_BODY` | body type string | Switch body model |
| `SET_JACKET` | number or null | Equip/remove jacket |
| `SET_PANTS_ACCESSORY` | number or null | Equip/remove bottoms |
| `SET_SHOES_ACCESSORY` | number or null | Equip/remove shoes |
| `SET_HAIR_ACCESSORY` | number or null | Equip/remove hair |
| `SET_MASK_ACCESSORY` | number or null | Equip/remove mask |
| `SET_FULL_SUIT` | number or null | Equip/remove full suit |
| `SET_SKIN_COLOR` | hex string | Apply skin tone |
| `SET_EYES` | texture key | Apply eye color |
| `SET_JACKET_COLOR` | hex string | Tint jacket |
| `SET_HAIR_COLOR` | hex string | Tint hair |
| `SET_SUIT_COLOR` | hex string | Tint suit |

---

## Accessory Catalog

### Jackets

| ID | Type | Attachment |
|---|---|---|
| FJ1, FJ2, FJ3 | Female jackets | RPM skeleton |
| MJ1, MJ2 | Male jackets | RPM skeleton |
| J4, J5, J6, J7, J8 | Unisex (Sketchfab) | Static mesh |

### Bottoms

| ID | Type | Attachment |
|---|---|---|
| FB1, FB2 | Female bottoms | RPM skeleton |
| MB1, MB2 | Male bottoms | RPM skeleton |
| P3, P4, P5, P6, P7 | Unisex (Sketchfab) | Static mesh |

### Full Suits (Female)

| # | Description | Type |
|---|---|---|
| 1 | Red suit | RPM layered |
| 2 | Ninja | RPM layered |
| 3 | Cyberpunk | RPM layered |
| 4–8 | Various styles | Full RPM avatar replacement |

### Hair

| ID | Attachment |
|---|---|
| hair.glb | RPM skeleton |
| hair2–hair6 | Sketchfab (auto-scaled + offset-positioned) |

---

## Color & Customization System

### Skin Tones
6 preset skin tone swatches: Light, Fair, Medium, Tan, Brown, Dark

### Color Picker
- **Preset swatches** — curated palette per category
- **Custom RGB sliders** — independent R, G, B channel controls (0–255)
- **Hex input** — direct hex color entry
- Colors applied as `MeshStandardMaterial` tints in Three.js

---

## UI Theme

| Role | Color | Hex |
|---|---|---|
| Cream / Background | Warm cream | `#EBCCAD` |
| Primary / CTA | Orange | `#EC802B` |
| Accent | Yellow | `#EDC55B` |
| Secondary | Teal | `#66BCB4` |
| Dark Text | Dark brown | `#2C1A0E` |

---

## Known Limitations

| # | Area | Issue |
|---|---|---|
| 1 | 3D Jackets | Sketchfab jackets (J4–J8) are static meshes — don't deform with body |
| 2 | 3D Bottoms | Sketchfab pants (P3–P7) are static — positioning varies by body type |
| 3 | Full Suits | Suits 4–8 fully replace the custom avatar body |
| 4 | Hair | Hair 2–6 use hardcoded position offsets, not skeleton binding |
| 5 | Backend | MongoDB on localhost only — not accessible from other devices |
| 6 | AI | Image generation availability, latency, and cost depend on the selected Hugging Face inference provider |
| 7 | Downloads | expo-media-library doesn't work in Expo Go — needs dev build |
| 8 | Sync | No real-time sync — data fetched on screen load only |
| 9 | Editor | Saved avatar config doesn't auto-load when editor opens |
| 10 | Gallery | Duplicate entries possible if saved both locally and to cloud |
| 11 | Auth | No password reset functionality |
| 12 | Auth | No email verification on registration |
| 13 | Security | JWT secret is a placeholder — must be changed before deployment |

---

## Future Roadmap

### Short Term
- [ ] Auto-load saved avatar config when editor opens
- [ ] Fix gallery deduplication
- [ ] Password reset via email
- [ ] Email verification on registration

### Medium Term
- [ ] Custom dev build for proper media library downloads
- [ ] Skeleton-based attachment for all Sketchfab accessories
- [ ] Avatar animations (idle, wave, walk)
- [ ] Avatar sharing via public link

### Long Term
- [ ] MongoDB Atlas for cloud deployment
- [ ] Real-time sync between devices
- [ ] AR preview via camera
- [ ] Export avatar as GLB/FBX
- [ ] In-app purchase for premium accessories
- [ ] NFT minting integration

---

## License

This project is for educational and demonstration purposes.

---

*Built with React Native, Three.js, Node.js, and MongoDB.*
