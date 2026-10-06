import { useEffect, useRef } from 'react';
import { Animated, Platform, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/theme';

export function SuccessMark() {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: Platform.OS !== 'web' }),
      Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
  }, [opacity, scale]);

  return (
    <Animated.View style={{ opacity, transform: [{ scale }], alignSelf: 'center' }}>
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: colors.successMuted,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Icon name="check" size={32} color={colors.success} strokeWidth={2.2} />
      </View>
    </Animated.View>
  );
}
