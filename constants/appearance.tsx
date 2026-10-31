import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const palettes = {
  light: { background: '#F4F5F7', surface: '#FFFFFF', elevated: '#F0F2F5', text: '#17212B', muted: '#687482', border: '#DCE1E7', accent: '#3157D5', hero: '#172B4D', danger: '#B54747' },
  dark: { background: '#101722', surface: '#182331', elevated: '#202D3D', text: '#F3F6FA', muted: '#A4B0BE', border: '#344254', accent: '#7C9BFF', hero: '#121D32', danger: '#FF8989' },
};
type Mode = 'light' | 'dark';
type AppearanceContextValue = { mode: Mode; colors: typeof palettes.light; toggle: () => void };
const AppearanceContext = createContext<AppearanceContextValue>({ mode: 'light', colors: palettes.light, toggle: () => {} });

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>('light');
  useEffect(() => { AsyncStorage.getItem('appearance_mode').then(value => { if (value === 'dark') setMode('dark'); }).catch(() => {}); }, []);
  const value = useMemo(() => ({
    mode,
    colors: palettes[mode],
    toggle: () => setMode(current => {
      const next = current === 'light' ? 'dark' : 'light';
      AsyncStorage.setItem('appearance_mode', next).catch(() => {});
      return next;
    }),
  }), [mode]);
  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}
export const useAppearance = () => useContext(AppearanceContext);
