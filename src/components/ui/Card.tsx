import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

export function Card({
  children,
  padded = true,
  style,
}: {
  children: ReactNode;
  padded?: boolean;
  style?: ViewStyle;
}) {
  const { colors, radius, shadows } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          padding: padded ? 20 : 0,
          overflow: 'hidden',
        },
        shadows.card,
        style,
      ]}>
      {children}
    </View>
  );
}
