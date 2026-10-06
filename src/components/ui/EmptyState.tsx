import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme';

export function EmptyState({
  icon = 'info',
  title,
  message,
  action,
}: {
  icon?: IconName;
  title: string;
  message: string;
  action?: ReactNode;
}) {
  const { colors, radius } = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: 12, paddingVertical: 28, paddingHorizontal: 12 }}>
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: radius.pill,
          backgroundColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Icon name={icon} color={colors.muted} />
      </View>
      <Text variant="subheading" center accessibilityRole="header">
        {title}
      </Text>
      <Text variant="body" tone="muted" center>
        {message}
      </Text>
      {action ? <View style={{ alignSelf: 'stretch', marginTop: 8 }}>{action}</View> : null}
    </View>
  );
}
