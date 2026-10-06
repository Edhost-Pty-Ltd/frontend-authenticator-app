import type { ViewStyle } from 'react-native';

export const shadows: Record<'light' | 'dark', { card: ViewStyle }> = {
  light: {
    card: {
      shadowColor: '#16211F',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.06,
      shadowRadius: 24,
      elevation: 2,
    },
  },
  dark: {
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
  },
};
