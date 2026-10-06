import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { darkColors, lightColors, type ColorPalette } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { shadows } from '@/theme/shadows';
import { spacing } from '@/theme/spacing';
import { fontFamilies, type FontRole } from '@/theme/typography';

const THEME_KEY = 'authen.theme.v1';

export type ThemePreference = 'system' | 'light' | 'dark';
export type Scheme = 'light' | 'dark';

type ThemeValue = {
  ready: boolean;
  preference: ThemePreference;
  scheme: Scheme;
  colors: ColorPalette;
  spacing: typeof spacing;
  radius: typeof radius;
  shadows: (typeof shadows)['light'];
  fonts: Record<FontRole, string | undefined>;
  setPreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({
  children,
  fontsReady,
}: {
  children: ReactNode;
  fontsReady: boolean;
}) {
  const system = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(THEME_KEY)
      .then((stored) => {
        if (cancelled) return;
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setPreferenceState(stored);
        }
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    AsyncStorage.setItem(THEME_KEY, next).catch(() => {});
  }, []);

  const scheme: Scheme = preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;

  const value = useMemo<ThemeValue>(() => {
    const fonts = fontsReady
      ? { ...fontFamilies }
      : {
          regular: undefined,
          medium: undefined,
          semibold: undefined,
          bold: undefined,
          display: undefined,
        };
    return {
      ready,
      preference,
      scheme,
      colors: scheme === 'dark' ? darkColors : lightColors,
      spacing,
      radius,
      shadows: shadows[scheme],
      fonts,
      setPreference,
    };
  }, [fontsReady, preference, ready, scheme, setPreference]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used within ThemeProvider');
  return value;
}
