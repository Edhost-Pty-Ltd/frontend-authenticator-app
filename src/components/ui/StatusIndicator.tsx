import { View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme';

export type StatusTone = 'on' | 'off' | 'warning' | 'neutral';

const icons: Record<StatusTone, IconName> = {
  on: 'dot',
  off: 'circle',
  warning: 'alert',
  neutral: 'circle',
};

export function StatusIndicator({ tone, label }: { tone: StatusTone; label: string }) {
  const { colors } = useTheme();
  const color = tone === 'on' ? colors.success : tone === 'warning' ? colors.warning : colors.muted;
  const textTone = tone === 'on' ? 'success' : tone === 'warning' ? 'warning' : 'muted';

  return (
    <View
      accessibilityLabel={label}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Icon name={icons[tone]} size={tone === 'on' ? 14 : 16} color={color} />
      <Text variant="label" tone={textTone}>
        {label}
      </Text>
    </View>
  );
}
