import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { View } from 'react-native';

import { CodeInput } from '@/components/forms/CodeInput';
import { TextField } from '@/components/forms/TextField';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/hooks/useAuth';
import { AuthError, getErrorMessage } from '@/utils/errors';
import { hapticError, hapticSuccess } from '@/utils/haptics';
import { isBackupCode, isSixDigitCode } from '@/utils/validation';

export default function VerifyTwoFactorScreen() {
  const { pendingToken, pendingEmail, verifyTwoFactor } = useAuth();
  const lock = useRef(false);
  const [code, setCode] = useState('');
  const [recovery, setRecovery] = useState('');
  const [useRecovery, setUseRecovery] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(nextCode = code, backup = useRecovery) {
    if (lock.current) return;
    const value = backup ? recovery : nextCode;
    if (backup && !isBackupCode(value)) {
      setFormError('Enter a 10-character recovery code.');
      return;
    }
    if (!backup && !isSixDigitCode(value)) {
      setFormError('Enter the 6-digit code from your authenticator.');
      return;
    }
    lock.current = true;
    setLoading(true);
    setFormError(null);
    try {
      await verifyTwoFactor(value, backup);
      await hapticSuccess();
      router.replace('/home');
    } catch (error) {
      await hapticError();
      if (!backup) setCode('');
      setFormError(
        error instanceof AuthError
          ? error.message
          : getErrorMessage(error, "That code isn't valid. Check the code in your authenticator and try again."),
      );
    } finally {
      lock.current = false;
      setLoading(false);
    }
  }

  if (!pendingToken) {
    return (
      <Screen header={<ScreenHeader onBack={() => router.replace('/login')} />}>
        <View style={{ gap: 16, paddingTop: 12 }}>
          <Text variant="heading" accessibilityRole="header">
            Sign in again
          </Text>
          <Text tone="muted">Your verification step expired. Sign in to request a new code.</Text>
          <Button label="Back to sign in" onPress={() => router.replace('/login')} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen header={<ScreenHeader onBack={() => router.back()} />}>
      <View style={{ gap: 22 }}>
        <View style={{ gap: 8 }}>
          <Text variant="heading" accessibilityRole="header">
            Verify your identity
          </Text>
          <Text tone="muted">
            {useRecovery
              ? 'Enter one of your recovery codes. Each code works once.'
              : 'Enter the 6-digit code from your authenticator app.'}
          </Text>
          {pendingEmail ? (
            <Text variant="caption" tone="muted">
              Signing in as {pendingEmail}
            </Text>
          ) : null}
        </View>
        {formError ? <Notice message={formError} /> : null}
        {useRecovery ? (
          <TextField
            label="Recovery code"
            value={recovery}
            onChangeText={(value) => setRecovery(value.toUpperCase())}
            placeholder="XXXXX-XXXXX"
            autoCapitalize="characters"
            autoComplete="off"
            returnKeyType="go"
            onSubmitEditing={() => submit(code, true)}
          />
        ) : (
          <CodeInput
            value={code}
            onChange={setCode}
            onComplete={(value) => submit(value, false)}
            error={Boolean(formError)}
            editable={!loading}
            autoFocus
          />
        )}
        <Button
          label="Verify"
          loading={loading}
          loadingLabel="Verifying code..."
          onPress={() => submit()}
        />
        <Button
          label={useRecovery ? 'Use authenticator code' : 'Use a recovery code'}
          variant="text"
          onPress={() => {
            setUseRecovery((current) => !current);
            setFormError(null);
          }}
        />
      </View>
    </Screen>
  );
}
