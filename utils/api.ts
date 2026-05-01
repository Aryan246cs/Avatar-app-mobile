import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

export const getApiUrl = () => {
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  return host ? `http://${host}:5000/api` : 'http://192.168.100.97:5000/api';
};

const getToken = async () => AsyncStorage.getItem('authToken');

const authHeaders = async () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${await getToken()}`,
});

// ─── Avatar Config ────────────────────────────────────────────────────────────
export const loadAvatarConfig = async () => {
  const res = await fetch(`${getApiUrl()}/avatar/me`, { headers: await authHeaders() });
  return res.json();
};

export const saveAvatarConfig = async (config: object) => {
  const res = await fetch(`${getApiUrl()}/avatar/save`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(config),
  });
  return res.json();
};

// ─── Gallery ──────────────────────────────────────────────────────────────────
export const loadGallery = async () => {
  const res = await fetch(`${getApiUrl()}/gallery/me`, { headers: await authHeaders() });
  return res.json();
};

export const saveToGallery = async (item: { name: string; style: string; character: string; imageData: string }) => {
  const res = await fetch(`${getApiUrl()}/gallery/save`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(item),
  });
  return res.json();
};

export const deleteFromGallery = async (id: string) => {
  const res = await fetch(`${getApiUrl()}/gallery/${id}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  return res.json();
};

// ─── Profile ──────────────────────────────────────────────────────────────────
export const loadProfile = async () => {
  const res = await fetch(`${getApiUrl()}/profile/me`, { headers: await authHeaders() });
  return res.json();
};

export const updateProfile = async (data: { username?: string; bio?: string }) => {
  const res = await fetch(`${getApiUrl()}/profile/update`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};
