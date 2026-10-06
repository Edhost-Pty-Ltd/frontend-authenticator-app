import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Notice } from '@/components/ui/Notice';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/theme';
import type { SessionInfo } from '@/types/auth';
import { getErrorMessage } from '@/utils/errors';
import { formatWhen } from '@/utils/format';

export default function SessionsScreen() {
  const { listSessions, revokeSession } = useAuth();
  const { colors } = useTheme();
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [target, setTarget] = useState<SessionInfo | null>(null);
  const [revoking, setRevoking] = useState(false);

  const load = useCallback(async () => {
    try {
      setSessions(await listSessions());
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, "We couldn't load your sessions."));
    } finally {
      setLoading(false);
    }
  }, [listSessions]);

  useFocusEffect(
    useCallback(() => {
      load().catch(() => {});
    }, [load]),
  );

  async function confirmRevoke() {
    if (!target) return;
    setRevoking(true);
    try {
      await revokeSession(target.id);
      setTarget(null);
      await load();
    } catch (err) {
      setError(getErrorMessage(err, "We couldn't sign out that session."));
      setTarget(null);
    } finally {
      setRevoking(false);
    }
  }

  return (
    <Screen header={<ScreenHeader title="Sessions" onBack={() => router.back()} />}>
      <View style={{ gap: 16 }}>
        <View style={{ gap: 8 }}>
          <Text variant="heading" accessibilityRole="header">
            Active sessions
          </Text>
          <Text tone="muted">Devices that can stay signed in to your account.</Text>
        </View>
        {error ? <Notice message={error} /> : null}
        {loading ? <Text tone="muted">Loading sessions...</Text> : null}
        {!loading && sessions.length === 0 ? (
          <EmptyState icon="device" title="No other sessions" message="When you sign in somewhere else, it will appear here." />
        ) : null}
        {sessions.map((session) => (
          <Card key={session.id}>
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                <Text variant="label">{session.label}</Text>
                {session.current ? <StatusIndicator tone="on" label="This device" /> : null}
              </View>
              <Text variant="caption" tone="muted">
                {session.detail}
              </Text>
              <Text variant="caption" tone="muted">
                Active {formatWhen(session.lastActiveAt)}
              </Text>
              {session.current ? (
                <Text variant="caption" style={{ color: colors.muted }}>
                  Sign out from Settings to end this session.
                </Text>
              ) : (
                <Button label="Sign out" variant="outline" size="sm" onPress={() => setTarget(session)} />
              )}
            </View>
          </Card>
        ))}
      </View>
      <ConfirmationModal
        visible={Boolean(target)}
        title="Sign out this session?"
        message={target ? `${target.label} will need to sign in again.` : ''}
        confirmLabel="Sign out"
        destructive
        loading={revoking}
        onCancel={() => setTarget(null)}
        onConfirm={confirmRevoke}
      />
    </Screen>
  );
}
