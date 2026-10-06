import type { ReactNode } from 'react';
import { Platform, Pressable, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme';

export function ListRow({
  title,
  subtitle,
  icon,
  onPress,
  trailing,
  destructive,
  last,
}: {
  title: string;
  subtitle?: ReactNode;
  icon?: IconName;
  onPress?: () => void;
  trailing?: ReactNode;
  destructive?: boolean;
  last?: boolean;
}) {
  const { colors } = useTheme();
  const content = (
    <>
      {icon ? <Icon name={icon} color={destructive ? colors.danger : colors.text} /> : null}
      <View style={{ flex: 1, gap: 4 }}>
        <Text variant="body" tone={destructive ? 'danger' : 'default'}>
          {title}
        </Text>
        {typeof subtitle === 'string' ? (
          <Text variant="caption" tone="muted">
            {subtitle}
          </Text>
        ) : (
          subtitle
        )}
      </View>
      {trailing}
      {onPress && !trailing ? <Icon name="chevron" color={colors.muted} /> : null}
    </>
  );

  const style = {
    minHeight: 60,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    borderBottomWidth: last ? 0 : 1,
    borderBottomColor: colors.border,
    ...(Platform.OS === 'web' && onPress ? ({ cursor: 'pointer' } as object) : null),
  };

  if (!onPress) return <View style={style}>{content}</View>;

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} style={({ pressed }) => [style, pressed ? { backgroundColor: colors.surface } : null]}>
      {content}
    </Pressable>
  );
}
