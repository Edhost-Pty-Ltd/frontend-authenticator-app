import { View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme';

type Tone = 'error' | 'success' | 'warning' | 'info';

const icons: Record<Tone, IconName> = {
  error: 'alert',
  success: 'check',
  warning: 'alert',
  info: 'info',
};

export function Notice({
  tone = 'error',
  title,
  message,
}: {
  tone?: Tone;
  title?: string;
  message: string;
}) {
  const { colors, radius } = useTheme();
  const background = {
    error: colors.errorMuted,
    success: colors.successMuted,
    warning: colors.warningMuted,
    info: colors.infoMuted,
  }[tone];
  const color = {
    error: colors.error,
    success: colors.success,
    warning: colors.warning,
    info: colors.info,
  }[tone];
  const textTone = tone === 'error' ? 'danger' : tone;

  return (
    <View
      accessibilityRole={tone === 'error' ? 'alert' : 'summary'}
      style={{
        backgroundColor: background,
        borderRadius: radius.md,
        padding: 14,
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-start',
      }}>
      <Icon name={icons[tone]} color={color} size={20} />
      <View style={{ flex: 1, gap: 2 }}>
        {title ? (
          <Text variant="label" tone={textTone}>
            {title}
          </Text>
        ) : null}
        <Text variant="caption" tone={textTone}>
          {message}
        </Text>
      </View>
    </View>
  );
}
