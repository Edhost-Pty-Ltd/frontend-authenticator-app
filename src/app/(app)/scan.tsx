import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';

import { TextField } from '@/components/forms/TextField';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Notice } from '@/components/ui/Notice';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Text } from '@/components/ui/Text';
import { useAuthenticator } from '@/hooks/useAuthenticator';
import { useTheme } from '@/theme';
import { hapticError, hapticSuccess } from '@/utils/haptics';
import { parseOtpAuth } from '@/utils/totp';

export default function ScanScreen() {
  const { colors, radius } = useTheme();
  const { addAccount } = useAuthenticator();
  const [permission, requestPermission] = useCameraPermissions();
  const [link, setLink] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const handled = useRef(false);

  async function save(raw: string) {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      await addAccount(parseOtpAuth(raw));
      hapticSuccess().catch(() => {});
      router.replace('/home');
    } catch (caught) {
      handled.current = false;
      hapticError().catch(() => {});
      setError(caught instanceof Error ? caught.message : 'That setup could not be added.');
      setSaving(false);
    }
  }

  const cameraReady = Boolean(permission?.granted);
  const cameraBlocked = Boolean(permission && !permission.granted && !permission.canAskAgain);

  return (
    <Screen
      header={<ScreenHeader title="Scan setup code" onBack={() => router.back()} />}
      footer={<Button label="Enter a setup key" variant="secondary" onPress={() => router.push('/add-account')} />}>
      <View style={{ gap: 16 }}>
        <Text tone="muted">
          Point the camera at the QR code on the website. Authen reads the shared secret and stores it on this device.
        </Text>
        {error ? <Notice message={error} /> : null}
        <View style={{ height: 360, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.inverse }}>
          {cameraReady ? (
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onMountError={() => {
                setError('The camera could not start. Allow camera access, or enter the setup key.');
              }}
              onBarcodeScanned={({ data }) => {
                if (handled.current) return;
                handled.current = true;
                save(data).catch(() => {});
              }}
            />
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Allow camera"
              disabled={cameraBlocked}
              onPress={() => requestPermission()}
              style={({ pressed }) => ({
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                padding: 24,
                opacity: pressed ? 0.85 : 1,
                ...(Platform.OS === 'web' ? ({ cursor: cameraBlocked ? 'auto' : 'pointer' } as object) : null),
              })}>
              <Icon name="camera" size={42} color={colors.onPrimary} />
              <Text variant="label" tone="onPrimary" center>
                {cameraBlocked ? 'Camera is blocked in this browser' : 'Allow camera'}
              </Text>
            </Pressable>
          )}
          <View pointerEvents="none" style={{ position: 'absolute', top: 28, right: 28, bottom: 28, left: 28 }}>
            <View style={{ position: 'absolute', top: 0, left: 0, width: 28, height: 28, borderTopWidth: 3, borderLeftWidth: 3, borderColor: colors.onPrimary }} />
            <View style={{ position: 'absolute', top: 0, right: 0, width: 28, height: 28, borderTopWidth: 3, borderRightWidth: 3, borderColor: colors.onPrimary }} />
            <View style={{ position: 'absolute', bottom: 0, left: 0, width: 28, height: 28, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: colors.onPrimary }} />
            <View style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderBottomWidth: 3, borderRightWidth: 3, borderColor: colors.onPrimary }} />
          </View>
        </View>
        {saving ? (
          <Text variant="caption" tone="muted" center>
            Saving the shared secret on this device
          </Text>
        ) : (
          <Text variant="caption" tone="muted" center>
            A matching 6-digit code appears as soon as the secret is stored.
          </Text>
        )}
        <TextField
          label="Setup link"
          value={link}
          onChangeText={setLink}
          placeholder="otpauth://totp/..."
          autoCapitalize="none"
          autoCorrect={false}
          hint="Paste the link inside the QR code if you already have it."
        />
        <Button
          label="Add from link"
          loading={saving}
          loadingLabel="Saving secret"
          disabled={!link.trim()}
          onPress={() => save(link)}
        />
      </View>
    </Screen>
  );
}
