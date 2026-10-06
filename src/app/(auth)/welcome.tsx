import { router } from 'expo-router';
import { View } from 'react-native';

import { brand } from '@/brand';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme';

const points: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'lock',
    title: 'Sign in first',
    body: 'Your Authen account is the gate to the codes stored on this device.',
  },
  {
    icon: 'shield',
    title: 'Scan a setup code',
    body: 'A website shows a QR code. Authen keeps the shared secret from that code.',
  },
  {
    icon: 'key',
    title: 'A new code every 30 seconds',
    body: 'The 6-digit code is calculated here from that secret and the time. No network is required.',
  },
];

export default function WelcomeScreen() {
  const { colors } = useTheme();

  return (
    <Screen
      footer={
        <>
          <Button label="Create account" onPress={() => router.push('/register')} />
          <Button label="Sign in" variant="secondary" onPress={() => router.push('/login')} />
          <Text variant="caption" tone="muted" center>
            Authen never asks for your password by email.
          </Text>
        </>
      }>
      <View style={{ gap: 28, paddingTop: 12 }}>
        <View style={{ gap: 14 }}>
          <Logo size={64} />
          <View style={{ gap: 8 }}>
            <Text variant="display" accessibilityRole="header">
              Welcome to {brand.name}
            </Text>
            <Text variant="body" tone="muted">
              {brand.tagline}
            </Text>
          </View>
        </View>
        <View style={{ gap: 18 }}>
          {points.map((point) => (
            <View key={point.title} style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: colors.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Icon name={point.icon} size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="label">{point.title}</Text>
                <Text variant="caption" tone="muted">
                  {point.body}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}
