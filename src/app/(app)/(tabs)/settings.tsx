import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { ListRow } from '@/components/ui/ListRow';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/hooks/useAuth';
import { useTheme, type ThemePreference } from '@/theme';

export default function SettingsScreen() {
  const { logout } = useAuth();
  const { preference, setPreference } = useTheme();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const version = Constants.expoConfig?.version ?? '1.0.0';

  async function confirmLogout() {
    setLoading(true);
    try {
      await logout();
      setConfirming(false);
      router.replace('/welcome');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen edges={['top', 'left', 'right']}>
      <View style={{ gap: 22 }}>
        <Text variant="heading" accessibilityRole="header">
          Settings
        </Text>
        <View style={{ gap: 10 }}>
          <Text variant="label" tone="muted">
            Appearance
          </Text>
          <Card>
            <View style={{ gap: 12 }}>
              <View style={{ gap: 4 }}>
                <Text variant="label">Theme</Text>
                <Text variant="caption" tone="muted">
                  Light, dark, or match this device.
                </Text>
              </View>
              <SegmentedControl<ThemePreference>
                accessibilityLabel="Theme"
                value={preference}
                onChange={setPreference}
                options={[
                  { value: 'system', label: 'System', icon: 'monitor' },
                  { value: 'light', label: 'Light', icon: 'sun' },
                  { value: 'dark', label: 'Dark', icon: 'moon' },
                ]}
              />
            </View>
          </Card>
        </View>
        <View style={{ gap: 10 }}>
          <Text variant="label" tone="muted">
            Security
          </Text>
          <Card padded={false}>
            <ListRow title="Two-factor authentication" icon="shield" onPress={() => router.push('/security')} />
            <ListRow title="Recovery codes" icon="key" onPress={() => router.push('/recovery-codes')} />
            <ListRow title="Password" icon="lock" onPress={() => router.push('/change-password')} last />
          </Card>
        </View>
        <View style={{ gap: 10 }}>
          <Text variant="label" tone="muted">
            Account
          </Text>
          <Card padded={false}>
            <ListRow title="Profile" icon="user" onPress={() => router.push('/profile')} />
            <ListRow title="Log out" icon="logout" destructive onPress={() => setConfirming(true)} last />
          </Card>
        </View>
        <View style={{ gap: 10 }}>
          <Text variant="label" tone="muted">
            About
          </Text>
          <Card padded={false}>
            <ListRow title="Version" trailing={<Text variant="caption" tone="muted">{version}</Text>} />
            <ListRow title="Privacy" onPress={() => router.push('/privacy')} />
            <ListRow title="Terms" onPress={() => router.push('/terms')} last />
          </Card>
        </View>
      </View>
      <ConfirmationModal
        visible={confirming}
        title="Sign out?"
        message="You'll need to sign in again to access your account."
        confirmLabel="Sign out"
        destructive
        loading={loading}
        onCancel={() => setConfirming(false)}
        onConfirm={confirmLogout}
      />
    </Screen>
  );
}
