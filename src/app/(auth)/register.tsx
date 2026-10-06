import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { PasswordStrength } from '@/components/forms/PasswordStrength';
import { PasswordField, TextField } from '@/components/forms/TextField';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Notice } from '@/components/ui/Notice';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/utils/errors';
import { isStrongPassword, isValidEmail } from '@/utils/validation';

export default function RegisterScreen() {
  const { register } = useAuth();
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/welcome');
  }

  async function submit() {
    if (loading) return;
    const nextEmail = email.trim().length === 0 ? 'Enter your email address.' : !isValidEmail(email) ? 'Please enter a valid email address.' : null;
    const nextPassword = password.length === 0 ? 'Create a password.' : !isStrongPassword(password) ? 'Use 8 or more characters with uppercase, lowercase, and a number.' : null;
    const nextConfirm = confirm !== password ? "Those passwords don't match." : null;
    const nextForm = accepted ? null : 'Please agree to the Terms and Privacy Policy to create an account.';
    setEmailError(nextEmail);
    setPasswordError(nextPassword);
    setConfirmError(nextConfirm);
    setFormError(nextForm);
    if (nextEmail || nextPassword || nextConfirm || nextForm) return;

    setLoading(true);
    try {
      await register(email, password);
      router.replace('/home');
    } catch (error) {
      setFormError(getErrorMessage(error, "We couldn't create your account. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen header={<ScreenHeader onBack={goBack} />}>
      <View style={{ gap: 22 }}>
        <View style={{ gap: 8 }}>
          <Text variant="heading" accessibilityRole="header">
            Create your account
          </Text>
          <Text tone="muted">A few details, then your account is ready.</Text>
        </View>
        {formError ? <Notice message={formError} /> : null}
        <View style={{ gap: 16 }}>
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            error={emailError}
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          <PasswordField
            label="Password"
            value={password}
            onChangeText={setPassword}
            error={passwordError}
            placeholder="Create a password"
            textContentType="newPassword"
            autoComplete="password-new"
            inputRef={passwordRef}
            returnKeyType="next"
            onSubmitEditing={() => confirmRef.current?.focus()}
          />
          <PasswordStrength password={password} />
          <PasswordField
            label="Confirm password"
            value={confirm}
            onChangeText={setConfirm}
            error={confirmError}
            placeholder="Repeat your password"
            textContentType="newPassword"
            autoComplete="password-new"
            inputRef={confirmRef}
            returnKeyType="go"
            onSubmitEditing={submit}
          />
          <View style={{ gap: 8 }}>
            <Checkbox checked={accepted} onChange={setAccepted} label="I agree to the Terms and Privacy Policy." />
            <View style={{ flexDirection: 'row', gap: 16, paddingLeft: 36 }}>
              <Pressable accessibilityRole="link" onPress={() => router.push('/terms')}>
                <Text variant="label" tone="primary">
                  Terms
                </Text>
              </Pressable>
              <Pressable accessibilityRole="link" onPress={() => router.push('/privacy')}>
                <Text variant="label" tone="primary">
                  Privacy
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
        <Button label="Create account" loading={loading} loadingLabel="Creating account..." onPress={submit} />
        <View style={{ alignItems: 'center' }}>
          <Text tone="muted" center>
            Already have an account?
          </Text>
          <Button label="Sign in" variant="text" onPress={() => router.push('/login')} />
        </View>
      </View>
    </Screen>
  );
}
