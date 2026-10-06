import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { PasswordField, TextField } from '@/components/forms/TextField';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/utils/errors';
import { isSixDigitCode } from '@/utils/validation';

export default function RegenerateCodesScreen() {
  const { regenerateBackupCodes } = useAuth();
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
      await regenerateBackupCodes(password, code);
      router.replace('/recovery-codes');
    } catch (error) {
      setFormError(getErrorMessage(error, "We couldn't create new recovery codes. Check your password and authenticator code."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen header={<ScreenHeader title="Recovery codes" onBack={() => router.back()} />}>
      <View style={{ gap: 18 }}>
        <View style={{ gap: 8 }}>
          <Text variant="heading" accessibilityRole="header">
            Create new recovery codes
          </Text>
          <Text tone="muted">This replaces your existing codes. Codes you saved before will stop working.</Text>
        </View>
        <Notice tone="warning" message="Store the new codes somewhere private. They are shown only once." />
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
        <Button label="Create codes" loading={loading} loadingLabel="Creating codes..." onPress={submit} />
      </View>
    </Screen>
  );
}
