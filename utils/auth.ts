// Persistent token storage utility
// Uses AsyncStorage for mobile, localStorage for web

import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';

export const setAuthToken = async (token: string) => {
  console.log('🔐 Saving token:', token.substring(0, 20) + '...');
  try {
    // Try AsyncStorage first (mobile)
    await AsyncStorage.setItem(TOKEN_KEY, token);
    console.log('✅ Token saved to AsyncStorage');
  } catch (error) {
    console.log('❌ AsyncStorage failed, trying localStorage:', error);
    try {
      // Fallback to localStorage (web)
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(TOKEN_KEY, token);
        console.log('✅ Token saved to localStorage');
      }
    } catch (webError) {
      console.error('❌ Both storage methods failed:', error, webError);
    }
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  console.log('🔍 Checking for saved token...');
  try {
    // Try AsyncStorage first (mobile)
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    console.log('📱 AsyncStorage result:', token ? 'Token found' : 'No token');
    return token;
  } catch (error) {
    console.log('❌ AsyncStorage failed, trying localStorage:', error);
    try {
      // Fallback to localStorage (web)
      if (typeof window !== 'undefined' && window.localStorage) {
        const webToken = localStorage.getItem(TOKEN_KEY);
        console.log('🌐 localStorage result:', webToken ? 'Token found' : 'No token');
        return webToken;
      }
      return null;
    } catch (webError) {
      console.error('❌ Both storage methods failed:', error, webError);
      return null;
    }
  }
};

export const clearAuthToken = async () => {
  try {
    // Clear from AsyncStorage (mobile)
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error clearing from AsyncStorage:', error);
  }
  
  try {
    // Clear from localStorage (web)
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error clearing from localStorage:', error);
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getAuthToken();
  return token !== null && token !== '';
};