import { ActivityIndicator, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme';

export function LoadingState({ message }: { message: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }} accessibilityRole="progressbar" accessibilityLabel={message}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text variant="body" tone="muted" center>
        {message}
      </Text>
    </View>
  );
}
