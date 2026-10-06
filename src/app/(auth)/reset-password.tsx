import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { TextInput, View } from 'react-native';

import { PasswordStrength } from '@/components/forms/PasswordStrength';
import { PasswordField } from '@/components/forms/TextField';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SuccessMark } from '@/components/ui/SuccessMark';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/utils/errors';
import { hapticSuccess } from '@/utils/haptics';
import { isStrongPassword } from '@/utils/validation';

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const tokenParam = Array.isArray(params.token) ? params.token[0] : params.token;
  const { resetPassword, pendingResetToken } = useAuth();
  const confirmRef = useRef<TextInput>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/login');
  }

  async function submit() {
    if (loading) return;
    const nextPassword = !isStrongPassword(password) ? 'Use 8 or more characters with uppercase, lowercase, and a number.' : null;
    const nextConfirm = password !== confirm ? "Those passwords don't match." : null;
    setPasswordError(nextPassword);
    setConfirmError(nextConfirm);
    setFormError(null);
    if (nextPassword || nextConfirm) return;
    setLoading(true);
    try {
      await resetPassword(password, tokenParam || pendingResetToken || '');
      await hapticSuccess();
      setDone(true);
    } catch (error) {
      setFormError(getErrorMessage(error, "We couldn't update your password. Request a new reset link and try again."));
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <Screen
        footer={<Button label="Continue to sign in" onPress={() => router.replace('/login')} />}>
        <View style={{ gap: 18, paddingTop: 32 }}>
          <SuccessMark />
          <Text variant="heading" center accessibilityRole="header">
            Password updated
          </Text>
          <Text tone="muted" center>
            You can now sign in with your new password.
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen header={<ScreenHeader onBack={goBack} />}>
      <View style={{ gap: 22 }}>
        <View style={{ gap: 8 }}>
          <Text variant="heading" accessibilityRole="header">
            Reset password
          </Text>
          <Text tone="muted">Choose a new password for your account.</Text>
        </View>
        {formError ? <Notice message={formError} /> : null}
        <PasswordField
          label="New password"
          value={password}
          onChangeText={setPassword}
          error={passwordError}
          placeholder="New password"
          textContentType="newPassword"
          autoComplete="password-new"
          returnKeyType="next"
          onSubmitEditing={() => confirmRef.current?.focus()}
        />
        <PasswordStrength password={password} />
        <PasswordField
          label="Confirm password"
          value={confirm}
          onChangeText={setConfirm}
          error={confirmError}
          placeholder="Repeat the new password"
          textContentType="newPassword"
          autoComplete="password-new"
          inputRef={confirmRef}
          returnKeyType="go"
          onSubmitEditing={submit}
        />
        <Button label="Reset password" loading={loading} loadingLabel="Updating password..." onPress={submit} />
      </View>
    </Screen>
  );
}
