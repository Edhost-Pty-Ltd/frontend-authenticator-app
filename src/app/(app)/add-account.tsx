import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { TextField } from '@/components/forms/TextField';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Notice } from '@/components/ui/Notice';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Text } from '@/components/ui/Text';
import { useAuthenticator } from '@/hooks/useAuthenticator';
import { hapticSuccess } from '@/utils/haptics';
import { formatCode, generateTotp, parseSetupKey, secondsRemaining } from '@/utils/totp';

export default function AddAccountScreen() {
  const { addAccount, now } = useAuthenticator();
  const [issuer, setIssuer] = useState('');
  const [account, setAccount] = useState('');
  const [secret, setSecret] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const preview = useMemo(() => {
    try {
      const setup = parseSetupKey(secret, issuer, account);
      return {
        setup,
        code: generateTotp({ secret: setup.secret, timeMs: now }),
        remaining: secondsRemaining(now),
      };
    } catch {
      return null;
    }
  }, [account, issuer, now, secret]);

  async function save() {
    setError(null);
    setSaving(true);
    try {
      await addAccount(parseSetupKey(secret, issuer, account));
      hapticSuccess().catch(() => {});
      router.replace('/home');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'That setup key could not be saved.');
      setSaving(false);
    }
  }

  return (
    <Screen
      header={<ScreenHeader title="Enter setup key" onBack={() => router.back()} />}
      footer={<Button label="Save account" loading={saving} loadingLabel="Saving secret" onPress={save} />}>
      <View style={{ gap: 16 }}>
        <Text tone="muted">
          Type the key shown beside the QR code. Authen and the website will both use it, with the time, to produce the
          same 6-digit code.
        </Text>
        {error ? <Notice message={error} /> : null}
        <TextField
          label="Website"
          value={issuer}
          onChangeText={setIssuer}
          placeholder="Example Bank"
          autoCapitalize="words"
          autoCorrect={false}
        />
        <TextField
          label="Account"
          value={account}
          onChangeText={setAccount}
          placeholder="you@example.com"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          hint="Optional. Use the name shown on the website."
        />
        <TextField
          label="Setup key"
          value={secret}
          onChangeText={setSecret}
          placeholder="JBSWY3DPEHPK3PXP"
          autoCapitalize="characters"
          autoCorrect={false}
          hint="Letters A–Z and numbers 2–7. Spaces are ignored."
        />
        {preview ? (
          <Card>
            <Text variant="caption" tone="muted">
              Current code
            </Text>
            <Text variant="heading" style={{ fontVariant: ['tabular-nums'], marginTop: 4 }}>
              {formatCode(preview.code)}
            </Text>
            <Text variant="caption" tone="muted">
              Changes in {preview.remaining} seconds
            </Text>
          </Card>
        ) : null}
      </View>
    </Screen>
  );
}
