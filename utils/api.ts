import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

export const getApiUrl = () => {
  const configuredUrl = Constants.expoConfig?.extra?.apiUrl;
  if (typeof configuredUrl === 'string' && configuredUrl.trim()) return configuredUrl.replace(/\/$/, '');
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (host) return `http://${host}:5000/api`;
  return 'http://localhost:5000/api';
};

const getToken = async () => AsyncStorage.getItem('auth_token');

const authHeaders = async () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${await getToken()}`,
});

// ─── Generic fetch with 401 guard ─────────────────────────────────────────────
// Returns parsed JSON. If the server returns 401 (expired/invalid token),
// clears the stored token so the next app launch redirects to login.
const apiFetch = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, options);
  if (res.status === 401) {
    // Token expired or invalid — clear it so index.tsx redirects to login
    await AsyncStorage.removeItem('auth_token');
  }
  return res.json();
};

// ─── Avatar Config ────────────────────────────────────────────────────────────
export const loadAvatarConfig = async () => {
  return apiFetch(`${getApiUrl()}/avatar/me`, { headers: await authHeaders() });
};

export const saveAvatarConfig = async (config: object) => {
  return apiFetch(`${getApiUrl()}/avatar/save`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(config),
  });
};

// ─── Gallery ──────────────────────────────────────────────────────────────────
export const loadGallery = async () => {
  return apiFetch(`${getApiUrl()}/gallery/me`, { headers: await authHeaders() });
};

export const saveToGallery = async (item: { name: string; style: string; character: string; imageData: string }) => {
  return apiFetch(`${getApiUrl()}/gallery/save`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(item),
  });
};

export const deleteFromGallery = async (id: string) => {
  return apiFetch(`${getApiUrl()}/gallery/${id}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });
};

// ─── Profile ──────────────────────────────────────────────────────────────────
export const loadProfile = async () => {
  return apiFetch(`${getApiUrl()}/profile/me`, { headers: await authHeaders() });
};

export const updateProfile = async (data: { username?: string; displayName?: string; pronouns?: string; bio?: string; profileImage?: string }) => {
  return apiFetch(`${getApiUrl()}/profile/update`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  return apiFetch(`${getApiUrl()}/auth/change-password`, {
    method: 'POST', headers: await authHeaders(), body: JSON.stringify({ currentPassword, newPassword }),
  });
};

export const generateAvatar = async (params: object) => {
  return apiFetch(`${getApiUrl()}/generate-avatar`, {
    method: 'POST', headers: await authHeaders(), body: JSON.stringify(params),
  });
};
