import { router } from 'expo-router';
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

export default function ChangePasswordScreen() {
  const { changePassword } = useAuth();
  const nextRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [nextError, setNextError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (loading) return;
    const currentMessage = current.length === 0 ? 'Enter your current password.' : null;
    const nextMessage = !isStrongPassword(next) ? 'Use 8 or more characters with uppercase, lowercase, and a number.' : null;
    const confirmMessage = next !== confirm ? "Those passwords don't match." : null;
    setCurrentError(currentMessage);
    setNextError(nextMessage);
    setConfirmError(confirmMessage);
    setFormError(null);
    if (currentMessage || nextMessage || confirmMessage) return;
    setLoading(true);
    try {
      await changePassword(current, next);
      await hapticSuccess();
      setDone(true);
    } catch (error) {
      setFormError(getErrorMessage(error, "We couldn't update your password. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <Screen footer={<Button label="Done" onPress={() => router.back()} />}>
        <View style={{ gap: 16, paddingTop: 36 }}>
          <SuccessMark />
          <Text variant="heading" center accessibilityRole="header">
            Password updated
          </Text>
          <Text tone="muted" center>
            Use this password the next time you sign in.
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen header={<ScreenHeader title="Password" onBack={() => router.back()} />}>
      <View style={{ gap: 18 }}>
        <View style={{ gap: 8 }}>
          <Text variant="heading" accessibilityRole="header">
            Change password
          </Text>
          <Text tone="muted">Choose something you don't use anywhere else.</Text>
        </View>
        {formError ? <Notice message={formError} /> : null}
        <PasswordField
          label="Current password"
          value={current}
          onChangeText={setCurrent}
          error={currentError}
          returnKeyType="next"
          onSubmitEditing={() => nextRef.current?.focus()}
        />
        <PasswordField
          label="New password"
          value={next}
          onChangeText={setNext}
          error={nextError}
          placeholder="New password"
          textContentType="newPassword"
          autoComplete="password-new"
          inputRef={nextRef}
          returnKeyType="next"
          onSubmitEditing={() => confirmRef.current?.focus()}
        />
        <PasswordStrength password={next} />
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
        <Button label="Update password" loading={loading} loadingLabel="Updating password..." onPress={submit} />
      </View>
    </Screen>
  );
}
