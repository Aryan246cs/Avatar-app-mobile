# Avatar Customization App

A full-stack mobile application for 3D avatar customization with real-time rendering, built with React Native, Three.js, and MongoDB.

## Features

- 🎨 **Real-time 3D Avatar Customization**
  - 8 body types (4 male, 4 female)
  - Customizable colors: Eyes, Hair, Top, Pants, Shoes
  - Accessories: Jacket, Pants, Full Suit, Shoes
  
- 🔐 **User Authentication**
  - JWT-based authentication
  - Secure password hashing with bcrypt
  - Persistent login with AsyncStorage

- 📱 **Cross-Platform**
  - React Native with Expo
  - Works on iOS and Android
  - WebView-based 3D rendering

## Project Structure

```
avatar-app-mobile/
├── app/                          # React Native app screens
│   ├── (main)/                   # Main app screens
│   │   ├── avatar-editor.tsx     # Avatar customization screen
│   │   ├── home.tsx              # Home screen
│   │   └── item-selection.tsx    # Item selection screen
│   ├── login.tsx                 # Login screen
│   └── index.tsx                 # App entry point
│
├── avatar-web-viewer/            # 3D avatar viewer (Vite + Three.js)
│   ├── src/
│   │   ├── AvatarCustomizer.tsx  # Main 3D avatar component
│   │   ├── Scene.tsx             # Three.js scene setup
│   │   ├── textures.ts           # Texture definitions
│   │   └── App.tsx               # Viewer app entry
│   └── public/
│       ├── female.glb            # Female body models (4 variants)
│       ├── male.glb              # Male body models (4 variants)
│       ├── jacket.glb            # Jacket accessory
│       ├── Pants.glb             # Pants accessory
│       └── accessories/          # Full suits and shoes
│
├── backend/                      # Node.js + Express + MongoDB
│   ├── models/
│   │   └── User.js               # User model
│   ├── routes/
│   │   └── auth.js               # Authentication routes
│   ├── server.js                 # Express server
│   └── .env                      # Environment variables
│
├── components/                   # Reusable React Native components
├── constants/                    # App constants and themes
├── hooks/                        # Custom React hooks
├── utils/                        # Utility functions
└── start-app.js                  # Development startup script

```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Expo CLI
- iOS Simulator or Android Emulator (or Expo Go app)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd avatar-app-mobile
   ```

2. **Install dependencies**
   ```bash
   # Root dependencies
   npm install

   # Backend dependencies
   cd backend
   npm install
   cd ..

   # Avatar viewer dependencies
   cd avatar-web-viewer
   npm install
   cd ..
   ```

3. **Configure environment variables**
   
   Create `backend/.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/avatar-app
   JWT_SECRET=your-secret-key-here
   PORT=5000
   ```

4. **Start all servers**
   ```bash
   npm run dev
   ```
   
   This starts:
   - Backend API (http://localhost:5000)
   - Avatar Web Viewer (http://localhost:5173)
   - Expo development server

5. **Run on device**
   - Scan QR code with Expo Go app (iOS/Android)
   - Or press `i` for iOS simulator, `a` for Android emulator

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- `POST /api/auth/login` - Login user
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

## Avatar Customization

### Body Types
- **Female**: Slim, Average, Athletic, Heavy
- **Male**: Slim, Average, Athletic, Heavy

### Customizable Parts
- **Eyes**: 5 colors (Blue, Brown, Green, Gray, Hazel)
- **Hair**: 6 colors (Dark, Black, Brown, Blonde, Red, White)
- **Top**: 5 colors
- **Pants**: 5 colors
- **Shoes**: 4 colors

### Accessories
- **Jacket**: ON/OFF toggle
- **Pants**: ON/OFF toggle
- **Full Suit**: 1 option (fits all body types)
- **Shoes**: Multiple options (gender-specific)

## Technology Stack

### Frontend
- **React Native** - Mobile app framework
- **Expo** - Development platform
- **React Three Fiber** - Three.js React renderer
- **Three.js** - 3D graphics library
- **Vite** - Build tool for avatar viewer

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing

## Development

### Running Individual Services

**Backend only:**
```bash
cd backend
npm run dev
```

**Avatar viewer only:**
```bash
cd avatar-web-viewer
npm run dev
```

**Mobile app only:**
```bash
npx expo start
```

### Utility Scripts

**Check registered users:**
```bash
cd backend
node check-users.js
```

**Clear all users:**
```bash
cd backend
node clear-users.js
```

## Architecture

### 3D Avatar System
- Base avatar models with skeleton/armature
- Texture-based customization for colors
- Accessory system with proper bone binding
- Real-time rendering in WebView

### Authentication Flow
1. User registers/logs in
2. JWT token generated and stored
3. Token persisted in AsyncStorage
4. Auto-login on app restart
5. Token validated on protected routes

### Communication
- React Native ↔ WebView: postMessage API
- Mobile App ↔ Backend: REST API
- Real-time 3D updates via message passing

## Troubleshooting

### Avatar not loading
- Check that avatar-web-viewer is running on port 5173
- Verify network connectivity between devices
- Check browser console for errors

### Authentication issues
- Verify MongoDB is running
- Check backend logs for errors
- Ensure JWT_SECRET is set in .env

### Build errors
- Clear node_modules and reinstall
- Clear Expo cache: `npx expo start -c`
- Check for TypeScript errors

## License

MIT

## Contributors

Built with ❤️ for avatar customization
