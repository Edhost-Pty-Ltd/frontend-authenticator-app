import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ListRow } from '@/components/ui/ListRow';
import { Screen } from '@/components/ui/Screen';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/hooks/useAuth';
import { passwordStatus } from '@/utils/format';

export default function SecurityScreen() {
  const { user, refreshAccount } = useAuth();

  useFocusEffect(
    useCallback(() => {
      refreshAccount().catch(() => {});
    }, [refreshAccount]),
  );

  if (!user) return null;
  const enabled = user.twoFactorEnabled;

  return (
    <Screen edges={['top', 'left', 'right']}>
      <View style={{ gap: 22 }}>
        <View style={{ gap: 6 }}>
          <Text variant="heading" accessibilityRole="header">
            Security
          </Text>
          <Text tone="muted">Protection, recovery, and the devices signed in to Authen.</Text>
        </View>
        <Card padded={false}>
          <ListRow
            icon="shield"
            title="Two-factor authentication"
            subtitle={<StatusIndicator tone={enabled ? 'on' : 'off'} label={enabled ? 'Enabled' : 'Not enabled'} />}
            onPress={enabled ? undefined : () => router.push('/setup-2fa')}
          />
          <ListRow
            icon="key"
            title="Recovery codes"
            subtitle={enabled ? 'Stored securely' : 'Not created'}
            onPress={() => router.push('/recovery-codes')}
          />
          <ListRow
            icon="lock"
            title="Password"
            subtitle={passwordStatus(user.passwordChangedAt, user.createdAt)}
            onPress={() => router.push('/change-password')}
          />
          <ListRow icon="device" title="Active sessions" subtitle="Manage" onPress={() => router.push('/sessions')} last />
        </Card>
        {enabled ? (
          <Button
            label="Turn off two-factor authentication"
            variant="text"
            destructive
            onPress={() => router.push('/disable-2fa')}
          />
        ) : (
          <Button label="Enable two-factor authentication" onPress={() => router.push('/setup-2fa')} />
        )}
      </View>
    </Screen>
  );
}
