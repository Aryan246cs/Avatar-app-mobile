# Troubleshooting Guide

## Icons Not Showing

### Issue Fixed ✅
All icons have been properly mapped in `components/ui/icon-symbol.tsx` to use Material Icons on Android/Web.

### What Was Changed
- Added 14 icon mappings for all icons used in the app
- Changed `square.grid.2x2.fill` from `grid-view` to `apps` (more widely supported)
- Changed `eye.fill` and `eyeglasses` to `remove-red-eye` (better visual match)

### If Icons Still Don't Show

1. **Clear Metro bundler cache:**
   ```bash
   npx expo start -c
   ```

2. **Restart the app completely:**
   - Close the Expo Go app
   - Stop the Metro bundler (Ctrl+C)
   - Run `npx expo start` again
   - Reopen in Expo Go

3. **Check your Expo Go version:**
   - Make sure you have the latest Expo Go app installed
   - Update from App Store/Play Store if needed

4. **Verify Material Icons are loading:**
   - Open the app
   - Check the Metro bundler terminal for any font loading errors
   - Material Icons should load automatically with `@expo/vector-icons`

## Other Common Issues

### App Crashes on Startup
- Make sure all dependencies are installed: `npm install`
- Clear cache: `npx expo start -c`

### Dark Mode Not Working
- Check your phone's system settings
- The app automatically follows system theme
- Toggle dark mode in your phone settings to test

### Navigation Not Working
- Make sure you're logged in (enter any email/password)
- Tab bar should appear at the bottom after login
- If stuck, restart the app

### Styling Issues
- Different phones have different screen sizes
- The app is designed for mobile-first
- Safe areas are handled automatically by Expo

## Testing Checklist

After restarting the app, verify:

- [ ] Login screen shows email/password inputs
- [ ] Tab bar icons are visible (Home, Editor, Items, AI)
- [ ] Home screen shows 3 cards with icons
- [ ] Avatar Editor shows 5 part buttons with icons
- [ ] Item Selection shows grid of items with icons
- [ ] AI Generate screen shows sparkle icon
- [ ] All icons are visible in both light and dark mode

## Still Having Issues?

If icons still don't show after clearing cache:

1. Check the terminal output for errors
2. Look for any red error screens in the app
3. Try running on a different device/simulator
4. Verify `@expo/vector-icons` is installed: `npm list @expo/vector-icons`

## Icon Reference

All icons used in the app are documented in `ICON_REFERENCE.md`
