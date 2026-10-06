import { useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { Platform, Pressable, View } from 'react-native';

import { AuthenticatorCodeCard } from '@/components/security/AuthenticatorCodeCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { LoadingState } from '@/components/ui/LoadingState';
import { Logo } from '@/components/ui/Logo';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/hooks/useAuth';
import { useAuthenticator } from '@/hooks/useAuthenticator';
import { useTheme } from '@/theme';
import { initials } from '@/utils/format';

export default function HomeScreen() {
  const { user, displayName } = useAuth();
  const { accounts, ready, now, removeAccount } = useAuthenticator();
  const { colors, fonts } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();

  async function openScanner() {
    if (!permission?.granted) {
      try {
        await requestPermission();
      } catch {
        // The scan screen asks again if the camera is still blocked.
      }
    }
    router.push('/scan');
  }

  if (!user) return null;

  return (
    <Screen edges={['top', 'left', 'right']}>
      <View style={{ gap: 22 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo size={36} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Scan a QR code"
              onPress={openScanner}
              style={({ pressed }) => ({
                width: 44,
                height: 44,
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: pressed ? colors.primaryPressed : colors.primary,
                ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
              })}>
              <Icon name="camera" color={colors.onPrimary} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open profile"
              onPress={() => router.push('/profile')}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text variant="label" tone="onPrimary" style={{ fontFamily: fonts.semibold }}>
                {initials(displayName, user.email)}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={{ gap: 6 }}>
          <Text variant="heading" accessibilityRole="header">
            Codes
          </Text>
          <Text variant="body" tone="muted">
            Each code is calculated on this device from a shared secret and the current time. A new code appears every 30
            seconds, with or without a network connection.
          </Text>
        </View>

        {!ready ? <LoadingState message="Loading your codes" /> : null}

        {ready && accounts.length === 0 ? (
          <EmptyState
            icon="key"
            title="No accounts yet"
            message="After you sign in, scan the QR code a website shows when you turn on two-factor authentication. Authen keeps that secret here and creates the matching 6-digit code."
            action={
              <View style={{ gap: 10 }}>
                <Button label="Scan a QR code" icon="camera" onPress={openScanner} />
                <Button label="Enter a setup key" variant="secondary" onPress={() => router.push('/add-account')} />
              </View>
            }
          />
        ) : null}

        {ready
          ? accounts.map((account) => (
              <AuthenticatorCodeCard
                key={account.id}
                account={account}
                now={now}
                onRemove={() => removeAccount(account.id)}
              />
            ))
          : null}
      </View>
    </Screen>
  );
}
