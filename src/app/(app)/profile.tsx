import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { TextField } from '@/components/forms/TextField';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { ListRow } from '@/components/ui/ListRow';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/theme';
import { formatDate, initials } from '@/utils/format';

export default function ProfileScreen() {
  const { user, displayName, setDisplayName, logout } = useAuth();
  const { colors, fonts } = useTheme();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(displayName);
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  async function saveName() {
    await setDisplayName(name);
    setEditing(false);
  }

  async function confirmLogout() {
    setLoading(true);
    try {
      await logout();
      router.replace('/welcome');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen header={<ScreenHeader title="Profile" onBack={() => router.back()} />}>
      <View style={{ gap: 22 }}>
        <View style={{ alignItems: 'center', gap: 10 }}>
          <View
            style={{
              width: 84,
              height: 84,
              borderRadius: 42,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text variant="heading" tone="onPrimary" style={{ fontFamily: fonts.semibold }}>
              {initials(displayName, user.email)}
            </Text>
          </View>
          <Text variant="subheading" accessibilityRole="header">
            {displayName}
          </Text>
          <Text tone="muted">{user.email}</Text>
        </View>
        {editing ? (
          <View style={{ gap: 12 }}>
            <TextField label="Display name" value={name} onChangeText={setName} autoCapitalize="words" autoCorrect hint="This name stays on this device." />
            <Button label="Save name" onPress={saveName} />
            <Button label="Cancel" variant="text" onPress={() => setEditing(false)} />
          </View>
        ) : (
          <Button label="Edit name" variant="secondary" onPress={() => { setName(displayName); setEditing(true); }} />
        )}
        <Card padded={false}>
          <ListRow title="Email" subtitle={user.email} icon="mail" />
          <ListRow title="Member since" subtitle={formatDate(user.createdAt)} icon="user" />
          <ListRow
            title="Two-factor authentication"
            subtitle={user.twoFactorEnabled ? 'Enabled' : 'Not enabled'}
            icon="shield"
            onPress={() => router.push('/security')}
            last
          />
        </Card>
        <Button label="Manage security" onPress={() => router.push('/security')} />
        <Button label="Log out" variant="outline" onPress={() => setConfirming(true)} />
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
