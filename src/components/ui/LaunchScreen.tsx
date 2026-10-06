import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Platform, View } from 'react-native';

import { Logo } from '@/components/ui/Logo';
import { Text } from '@/components/ui/Text';
import { brand } from '@/brand';
import { brandFoam, brandInk, brandTide } from '@/theme/colors';
import { fontFamilies } from '@/theme/typography';
import { useTheme } from '@/theme';

export function LaunchScreen() {
  const { fonts } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 480, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(translate, { toValue: 0, duration: 480, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
  }, [opacity, translate]);

  return (
    <View
      accessibilityLabel={`${brand.name} is loading`}
      accessibilityRole="progressbar"
      style={{ flex: 1, backgroundColor: brandInk, alignItems: 'center', justifyContent: 'center', gap: 22, padding: 32 }}>
      <Animated.View style={{ alignItems: 'center', gap: 18, opacity, transform: [{ translateY: translate }] }}>
        <Logo size={76} tone="inverse" />
        <Text
          variant="display"
          style={{ color: brandFoam, fontFamily: fonts.display ?? fontFamilies.display }}>
          {brand.name}
        </Text>
      </Animated.View>
      <ActivityIndicator color={brandTide} />
    </View>
  );
}
