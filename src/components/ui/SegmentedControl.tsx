import { Platform, Pressable, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme';

type Option<T extends string> = { value: T; label: string; icon?: IconName };

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
}) {
  const { colors, radius } = useTheme();
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={{ flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.md, padding: 4, gap: 4 }}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            onPress={() => onChange(option.value)}
            style={{
              flex: 1,
              minHeight: 42,
              borderRadius: radius.sm,
              backgroundColor: selected ? colors.card : 'transparent',
              borderWidth: selected ? 1 : 0,
              borderColor: colors.border,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 6,
              ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
            }}>
            {option.icon ? <Icon name={option.icon} size={16} color={selected ? colors.primary : colors.muted} /> : null}
            <Text variant="label" tone={selected ? 'default' : 'muted'}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
