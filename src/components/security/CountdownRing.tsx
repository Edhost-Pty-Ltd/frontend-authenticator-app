import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme';

export function CountdownRing({ remaining, period }: { remaining: number; period: number }) {
  const { colors } = useTheme();
  const size = 46;
  const stroke = 3;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, remaining / period));
  const urgent = remaining <= 5;

  return (
    <View
      accessibilityLabel={`${remaining} seconds until the code changes`}
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={colors.border} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={urgent ? colors.warning : colors.primary}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - progress)}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ position: 'absolute' }}>
        <Text variant="caption" tone={urgent ? 'warning' : 'default'}>
          {remaining}
        </Text>
      </View>
    </View>
  );
}
