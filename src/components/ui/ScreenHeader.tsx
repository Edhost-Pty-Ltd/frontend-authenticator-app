import { Platform, Pressable, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme';

export function ScreenHeader({ title, onBack }: { title?: string; onBack?: () => void }) {
  const { colors } = useTheme();
  if (!title && !onBack) return null;

  return (
    <View style={{ minHeight: 52, flexDirection: 'row', alignItems: 'center' }}>
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBack}
          hitSlop={8}
          style={({ pressed }) => ({
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: pressed ? colors.surface : 'transparent',
            ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
          })}>
          <Icon name="back" />
        </Pressable>
      ) : (
        <View style={{ width: 44 }} />
      )}
      <View style={{ flex: 1, alignItems: 'center' }}>
        {title ? (
          <Text variant="label" accessibilityRole="header">
            {title}
          </Text>
        ) : null}
      </View>
      <View style={{ width: 44 }} />
    </View>
  );
}
