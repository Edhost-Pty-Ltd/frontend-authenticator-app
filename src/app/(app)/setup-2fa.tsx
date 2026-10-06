import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { CodeInput } from '@/components/forms/CodeInput';
import { QRCodeCard } from '@/components/security/QRCodeCard';
import { StepIndicator } from '@/components/security/StepIndicator';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { Notice } from '@/components/ui/Notice';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SuccessMark } from '@/components/ui/SuccessMark';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/hooks/useAuth';
import type { Enrollment } from '@/types/auth';
import { getErrorMessage } from '@/utils/errors';
import { hapticSuccess } from '@/utils/haptics';

export default function SetupTwoFactorScreen() {
  const { user, enrollTwoFactor, activateTwoFactor, refreshAccount } = useAuth();
  const [step, setStep] = useState(1);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const lock = useRef(false);

  const userId = user?.id;
  const alreadyEnabled = user?.twoFactorEnabled;

  useEffect(() => {
    let cancelled = false;
    if (!userId || alreadyEnabled) {
      setLoading(false);
      return;
    }
    enrollTwoFactor()
      .then((result) => {
        if (!cancelled) setEnrollment(result);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, "We couldn't start authenticator setup. Please try again."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [alreadyEnabled, enrollTwoFactor, userId]);

  async function verify(next = code) {
    if (lock.current || next.length !== 6) return;
    lock.current = true;
    setVerifying(true);
    setError(null);
    try {
      await activateTwoFactor(next);
      await refreshAccount();
      await hapticSuccess();
      setStep(3);
    } catch (err) {
      setCode('');
      setError(getErrorMessage(err, "That code isn't valid. Check the code in your authenticator and try again."));
    } finally {
      lock.current = false;
      setVerifying(false);
    }
  }

  if (user?.twoFactorEnabled && step < 3) {
    return (
      <Screen header={<ScreenHeader title="Two-factor" onBack={() => router.back()} />}>
        <View style={{ gap: 16 }}>
          <Text variant="heading" accessibilityRole="header">
            Already protected
          </Text>
          <Text tone="muted">Two-factor authentication is already on for this account.</Text>
          <Button label="Back to security" onPress={() => router.replace('/security')} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      header={<ScreenHeader title="Set up" onBack={() => (step === 2 ? setStep(1) : router.back())} />}
      footer={
        step === 1 && enrollment ? <Button label="Continue" onPress={() => setStep(2)} /> : step === 3 ? (
          <>
            <Button label="View recovery codes" onPress={() => router.replace('/recovery-codes')} />
            <Button label="Done" variant="secondary" onPress={() => router.replace('/home')} />
          </>
        ) : null
      }>
      {loading ? <LoadingState message="Setting up two-factor authentication..." /> : null}
      {!loading && error && !enrollment && step === 1 ? (
        <View style={{ gap: 16 }}>
          <Notice message={error} />
          <Button label="Try again" onPress={() => router.replace('/setup-2fa')} />
        </View>
      ) : null}
      {!loading && step === 1 && enrollment ? (
        <View style={{ gap: 20 }}>
          <StepIndicator step={1} total={3} />
          <View style={{ gap: 8 }}>
            <Text variant="heading" accessibilityRole="header">
              Scan this QR code
            </Text>
            <Text tone="muted">Use your authenticator app, then continue to confirm a code.</Text>
          </View>
          <QRCodeCard otpauthUrl={enrollment.otpauthUrl} qrCode={enrollment.qrCode} manualEntryCode={enrollment.manualEntryCode} />
        </View>
      ) : null}
      {step === 2 ? (
        <View style={{ gap: 20 }}>
          <StepIndicator step={2} total={3} />
          <View style={{ gap: 8 }}>
            <Text variant="heading" accessibilityRole="header">
              Enter the 6-digit code
            </Text>
            <Text tone="muted">From the authenticator you just added.</Text>
          </View>
          {error ? <Notice message={error} /> : null}
          <CodeInput value={code} onChange={setCode} onComplete={verify} error={Boolean(error)} editable={!verifying} autoFocus />
          <Button label="Verify" loading={verifying} loadingLabel="Verifying code..." onPress={() => verify()} />
        </View>
      ) : null}
      {step === 3 ? (
        <View style={{ gap: 18, paddingTop: 12 }}>
          <StepIndicator step={3} total={3} />
          <SuccessMark />
          <Text variant="heading" center accessibilityRole="header">
            Two-factor authentication enabled
          </Text>
          <Text tone="muted" center>
            Your account is now protected. Save your recovery codes before you leave.
          </Text>
        </View>
      ) : null}
    </Screen>
  );
}
