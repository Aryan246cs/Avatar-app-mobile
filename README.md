# Avatar App 🎭

A mobile-first avatar creation app built with React Native and Expo.

## Features

- **User Authentication** - Simple login/signup flow
- **Avatar Editor** - Customize your digital identity
- **Item Selection** - Browse and apply clothes, hair, and accessories
- **AI Generation** - Generate custom items with AI (coming soon)
- **Dark Mode** - Full light and dark theme support

## Tech Stack

- React Native
- Expo Router (file-based routing)
- TypeScript
- Expo SDK 54

## Project Structure

```
app/
├── _layout.tsx           # Root layout with theme provider
├── index.tsx             # Redirects to login
├── login.tsx             # Login/signup screen
└── (main)/               # Authenticated routes (tabs)
    ├── _layout.tsx       # Tab navigation layout
    ├── home.tsx          # Dashboard/home screen
    ├── avatar-editor.tsx # Avatar customization
    ├── item-selection.tsx # Browse items
    └── ai-generate.tsx   # AI generation placeholder
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npx expo start
   ```

3. Open the app:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app

## Current State

This is a **frontend MVP** with:
- ✅ Clean routing structure
- ✅ Modern, minimal UI
- ✅ Dark mode support
- ✅ Mock data and placeholders
- ⏳ No backend integration yet
- ⏳ No AI integration yet
- ⏳ No 3D avatar rendering yet

## Next Steps

1. Integrate backend API for authentication
2. Connect to avatar data storage
3. Add 3D avatar rendering library
4. Integrate AI generation service
5. Add real item catalog
6. Implement avatar export functionality

## Development Notes

- All data is currently mocked/hardcoded
- Login accepts any email/password combination
- Avatar preview is a placeholder
- AI generation is a UI mockup only
