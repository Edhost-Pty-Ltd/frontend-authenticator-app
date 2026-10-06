import { Platform, Pressable, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme';

export function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  const { colors, radius } = useTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      onPress={() => onChange(!checked)}
      style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null) }}>
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: radius.sm,
          borderWidth: 1.5,
          borderColor: checked ? colors.primary : colors.border,
          backgroundColor: checked ? colors.primary : colors.input,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 1,
        }}>
        {checked ? <Icon name="check" size={16} color={colors.onPrimary} strokeWidth={2.2} /> : null}
      </View>
      <Text variant="body" style={{ flex: 1 }}>
        {label}
      </Text>
    </Pressable>
  );
}
