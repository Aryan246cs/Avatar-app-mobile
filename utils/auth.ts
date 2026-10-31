import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';

export const setAuthToken = async (token: string) => {
  try { await AsyncStorage.setItem(TOKEN_KEY, token); }
  catch {
    try { if (typeof window !== 'undefined' && window.localStorage) window.localStorage.setItem(TOKEN_KEY, token); }
    catch { /* Storage is unavailable. */ }
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  try { return await AsyncStorage.getItem(TOKEN_KEY); }
  catch {
    try { return typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem(TOKEN_KEY) : null; }
    catch { return null; }
  }
};

export const clearAuthToken = async () => {
  try { await AsyncStorage.removeItem(TOKEN_KEY); } catch { /* Storage is unavailable. */ }
  try { if (typeof window !== 'undefined' && window.localStorage) window.localStorage.removeItem(TOKEN_KEY); } catch { /* Storage is unavailable. */ }
};

export const isAuthenticated = async (): Promise<boolean> => Boolean(await getAuthToken());
