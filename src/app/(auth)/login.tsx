import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { TextInput, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Text } from '@/components/ui/Text';
import { PasswordField, TextField } from '@/components/forms/TextField';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/theme';
import { getErrorMessage } from '@/utils/errors';
import { isValidEmail } from '@/utils/validation';

export default function LoginScreen() {
  const { login } = useAuth();
  const { colors } = useTheme();
  const passwordRef = useRef<TextInput>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/welcome');
  }

  async function submit() {
    if (loading) return;
    const nextEmailError = email.trim().length === 0 ? 'Enter your email address.' : !isValidEmail(email) ? 'Please enter a valid email address.' : null;
    const nextPasswordError = password.length === 0 ? 'Enter your password.' : null;
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setFormError(null);
    if (nextEmailError || nextPasswordError) return;

    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.requires2FA) router.push('/verify-2fa');
      else router.replace('/home');
    } catch (error) {
      setFormError(getErrorMessage(error, "We couldn't sign you in. Check your email and password and try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen header={<ScreenHeader onBack={goBack} />}>
      <View style={{ gap: 22 }}>
        <View style={{ gap: 8 }}>
          <Text variant="heading" accessibilityRole="header">
            Welcome back
          </Text>
          <Text tone="muted">Sign in to continue</Text>
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
            inputRef={passwordRef}
            returnKeyType="go"
            onSubmitEditing={submit}
          />
          <Button label="Forgot password?" variant="text" size="sm" onPress={() => router.push('/forgot-password')} />
        </View>
        <Button label="Sign in" loading={loading} loadingLabel="Signing in..." onPress={submit} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          <DividerLabel />
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        </View>
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Text tone="muted" center>
            Don't have an account?
          </Text>
          <Button label="Create account" variant="text" onPress={() => router.push('/register')} />
        </View>
      </View>
    </Screen>
  );
}

function DividerLabel() {
  return (
    <Text variant="caption" tone="muted">
      or
    </Text>
  );
}
