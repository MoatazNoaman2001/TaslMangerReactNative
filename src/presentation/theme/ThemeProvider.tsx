import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme, type Theme } from './tokens';
import { useSettingsCache } from '@/data/persistence/MmkvSettingsRepository';
import { useCases } from '@/composition-root';
import type { ThemePreference } from '@/domain/entities/Settings';

interface ThemeContextValue {
  theme: Theme;
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const preference = useSettingsCache((s) => s.theme);

  const theme = useMemo(() => {
    const resolved = preference === 'system' ? (systemScheme ?? 'light') : preference;
    return resolved === 'dark' ? darkTheme : lightTheme;
  }, [preference, systemScheme]);

  const setPreference = useCallback((p: ThemePreference) => {
    useCases.setThemePreference.execute(p);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      preference,
      setPreference: (p) => useCases.setThemePreference.execute(p),
    }),
    [theme, preference, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx.theme;
}

export function useThemePreference() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemePreference must be used inside <ThemeProvider>');
  return { preference: ctx.preference, setPreference: ctx.setPreference };
}
