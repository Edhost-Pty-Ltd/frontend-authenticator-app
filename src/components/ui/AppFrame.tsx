import type { ReactNode } from 'react';
import { Platform, View } from 'react-native';

import { useTheme } from '@/theme';

export function AppFrame({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.chrome, alignItems: 'center' }}>
      <View
        style={{
          flex: 1,
          width: '100%',
          maxWidth: 480,
          backgroundColor: colors.background,
          borderLeftWidth: Platform.OS === 'web' ? 1 : 0,
          borderRightWidth: Platform.OS === 'web' ? 1 : 0,
          borderColor: colors.border,
        }}>
        {children}
      </View>
    </View>
  );
}
