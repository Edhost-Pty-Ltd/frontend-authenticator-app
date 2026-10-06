import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme';

export function StepIndicator({ step, total }: { step: number; total: number }) {
  const { colors, radius } = useTheme();
  return (
    <View style={{ gap: 8 }} accessibilityLabel={`Step ${step} of ${total}`}>
      <Text variant="label" tone="muted">
        Step {step} of {total}
      </Text>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {Array.from({ length: total }, (_, index) => (
          <View
            key={index}
            style={{
              flex: 1,
              height: 4,
              borderRadius: radius.pill,
              backgroundColor: index < step ? colors.primary : colors.border,
            }}
          />
        ))}
      </View>
    </View>
  );
}
