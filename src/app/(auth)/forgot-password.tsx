import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { TextField } from '@/components/forms/TextField';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/utils/errors';
import { isValidEmail } from '@/utils/validation';

export default function ForgotPasswordScreen() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/login');
  }

  async function submit() {
    if (loading) return;
    const nextError = email.trim().length === 0 ? 'Enter your email address.' : !isValidEmail(email) ? 'Please enter a valid email address.' : null;
    setEmailError(nextError);
    setFormError(null);
    if (nextError) return;
    setLoading(true);
    try {
      const result = await requestPasswordReset(email);
      setMessage(result);
    } catch (error) {
      setFormError(getErrorMessage(error, "We couldn't send reset instructions. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen header={<ScreenHeader onBack={goBack} />}>
      <View style={{ gap: 22 }}>
        {message ? (
          <View style={{ gap: 18 }}>
            <Text variant="heading" accessibilityRole="header">
              Check your email
            </Text>
            <Notice tone="success" title="Instructions sent" message={message} />
            <Text tone="muted">The message looks the same whether or not an account exists for that address.</Text>
            <Button label="Set a new password" onPress={() => router.push('/reset-password')} />
            <Button label="Back to sign in" variant="secondary" onPress={() => router.replace('/login')} />
          </View>
        ) : (
          <>
            <View style={{ gap: 8 }}>
              <Text variant="heading" accessibilityRole="header">
                Forgot your password?
              </Text>
              <Text tone="muted">Enter your email and we'll help you recover your account.</Text>
            </View>
            {formError ? <Notice message={formError} /> : null}
            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              error={emailError}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="send"
              onSubmitEditing={submit}
            />
            <Button label="Send reset instructions" loading={loading} loadingLabel="Sending..." onPress={submit} />
            <Button label="Back to sign in" variant="text" onPress={() => router.replace('/login')} />
          </>
        )}
      </View>
    </Screen>
  );
}
