import { ActivityIndicator, Platform, Pressable, View, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'danger' | 'text';
type Size = 'md' | 'sm';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  loadingLabel?: string;
  disabled?: boolean;
  icon?: IconName;
  destructive?: boolean;
  accessibilityHint?: string;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingLabel,
  disabled = false,
  icon,
  destructive = false,
  accessibilityHint,
}: Props) {
  const { colors, radius } = useTheme();
  const isDisabled = disabled || loading;
  const minHeight = size === 'sm' ? 42 : 52;

  const palette = {
    primary: { background: colors.primary, border: colors.primary, text: 'onPrimary' as const, spinner: colors.onPrimary },
    secondary: { background: colors.secondary, border: colors.secondary, text: 'default' as const, spinner: colors.text },
    outline: { background: 'transparent', border: colors.border, text: 'default' as const, spinner: colors.text },
    danger: { background: colors.danger, border: colors.danger, text: 'onDanger' as const, spinner: colors.onDanger },
    text: { background: 'transparent', border: 'transparent', text: 'primary' as const, spinner: colors.primary },
  }[variant];
  const textTone = variant === 'text' && destructive ? 'danger' : palette.text;
  const spinnerColor = variant === 'text' && destructive ? colors.danger : palette.spinner;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={loading && loadingLabel ? loadingLabel : label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => {
        const style: ViewStyle = {
          minHeight,
          borderRadius: radius.md,
          backgroundColor: palette.background,
          borderWidth: variant === 'text' ? 0 : 1.5,
          borderColor: palette.border,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 18,
          paddingVertical: size === 'sm' ? 8 : 12,
          opacity: isDisabled ? 0.46 : pressed ? 0.88 : 1,
          transform: [{ scale: pressed && !isDisabled ? 0.985 : 1 }],
          width: '100%',
        };
        if (Platform.OS === 'web') (style as ViewStyle & { cursor?: 'auto' | 'pointer' }).cursor = isDisabled ? 'auto' : 'pointer';
        return style;
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        {loading ? <ActivityIndicator color={spinnerColor} /> : null}
        {!loading && icon ? <Icon name={icon} size={18} color={spinnerColor} /> : null}
        <Text variant="button" tone={textTone}>
          {loading && loadingLabel ? loadingLabel : label}
        </Text>
      </View>
    </Pressable>
  );
}
