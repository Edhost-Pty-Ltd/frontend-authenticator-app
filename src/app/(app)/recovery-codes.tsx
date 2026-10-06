import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { RecoveryCodeList } from '@/components/security/RecoveryCodeList';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { EmptyState } from '@/components/ui/EmptyState';
import { Notice } from '@/components/ui/Notice';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/hooks/useAuth';

export default function RecoveryCodesScreen() {
  const { user, freshBackupCodes, clearBackupCodes } = useAuth();
  const [stored, setStored] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const codes = freshBackupCodes;

  function continueOn() {
    if (!stored) {
      setError("Confirm that you've stored these codes before continuing.");
      return;
    }
    clearBackupCodes();
    router.replace('/home');
  }

  return (
    <Screen
      header={<ScreenHeader title="Recovery codes" onBack={() => router.back()} />}
      footer={codes ? <Button label="Continue" onPress={continueOn} /> : null}>
      <View style={{ gap: 18 }}>
        {codes ? (
          <>
            <View style={{ gap: 8 }}>
              <Text variant="heading" accessibilityRole="header">
                Save these codes somewhere secure
              </Text>
              <Text tone="muted">Each code can be used once if you lose access to your authenticator. They won't be shown again.</Text>
            </View>
            {error ? <Notice message={error} /> : null}
            <RecoveryCodeList codes={codes} />
            <Checkbox checked={stored} onChange={setStored} label="I've stored my recovery codes" />
          </>
        ) : (
          <EmptyState
            icon="key"
            title="No recovery codes to show"
            message={
              user?.twoFactorEnabled
                ? 'Codes are shown once, when they are created. You can replace them if you no longer have a copy.'
                : 'Recovery codes will appear here when you configure account recovery.'
            }
            action={
              user?.twoFactorEnabled ? (
                <Button label="Create new codes" onPress={() => router.push('/regenerate-codes')} />
              ) : (
                <Button label="Set up two-factor authentication" onPress={() => router.push('/setup-2fa')} />
              )
            }
          />
        )}
      </View>
    </Screen>
  );
}
