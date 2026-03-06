# App Flow

Quick reference for app navigation and data flow.

## User Journey

1. **App Launch** → Check stored token
2. **Login/Register** → Get JWT token → Store in AsyncStorage
3. **Home Screen** → View options
4. **Avatar Editor** → Customize 3D avatar in real-time
5. **Save** → Store configuration (future feature)
6. **Logout** → Clear token → Return to login

## Technical Flow

- **React Native** ↔ **WebView** (postMessage)
- **Mobile App** ↔ **Backend API** (REST)
- **3D Viewer** → Three.js rendering

For detailed documentation, see:
- `README.md` - Complete setup and features
- `docs/AVATAR_SYSTEM.md` - 3D system details
- `docs/API.md` - API documentation
- `PROJECT_SUMMARY.md` - Project overview
