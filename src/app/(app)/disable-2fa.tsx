import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { TextField } from '@/components/forms/TextField';
import { PasswordField } from '@/components/forms/TextField';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/utils/errors';
import { isSixDigitCode } from '@/utils/validation';

export default function DisableTwoFactorScreen() {
  const { disableTwoFactor, refreshAccount } = useAuth();
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (loading) return;
    const nextPassword = password.length === 0 ? 'Enter your password.' : null;
    const nextCode = !isSixDigitCode(code) ? 'Enter the 6-digit code from your authenticator.' : null;
    setPasswordError(nextPassword);
    setCodeError(nextCode);
    setFormError(null);
    if (nextPassword || nextCode) return;
    setLoading(true);
    try {
      await disableTwoFactor(password, code);
      await refreshAccount();
      router.replace('/security');
    } catch (error) {
      setFormError(
        getErrorMessage(
          error,
          "We couldn't turn off two-factor authentication. Check your password and authenticator code, then try again.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen header={<ScreenHeader title="Two-factor" onBack={() => router.back()} />}>
      <View style={{ gap: 18 }}>
        <View style={{ gap: 8 }}>
          <Text variant="heading" accessibilityRole="header">
            Disable two-factor authentication?
          </Text>
          <Text tone="muted">This will reduce the protection on your account. You'll sign in with only your password.</Text>
        </View>
        <Notice tone="warning" title="This is hard to undo casually" message="Confirm with your password and a current authenticator code." />
        {formError ? <Notice message={formError} /> : null}
        <PasswordField label="Password" value={password} onChangeText={setPassword} error={passwordError} />
        <TextField
          label="Authenticator code"
          value={code}
          onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
          error={codeError}
          placeholder="6-digit code"
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
        />
        <Button label="Cancel" variant="secondary" onPress={() => router.back()} />
        <Button label="Disable" variant="danger" loading={loading} loadingLabel="Turning off..." onPress={submit} />
      </View>
    </Screen>
  );
}
