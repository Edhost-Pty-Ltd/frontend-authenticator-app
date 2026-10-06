import { useState } from 'react';
import { Image, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { formatSecret } from '@/utils/format';

export function QRCodeCard({
  otpauthUrl,
  qrCode,
  manualEntryCode,
}: {
  otpauthUrl?: string;
  qrCode?: string;
  manualEntryCode: string;
}) {
  const [manual, setManual] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyKey() {
    await Clipboard.setStringAsync(manualEntryCode.replace(/\s+/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <View style={{ gap: 16 }}>
      <Card>
        <View style={{ alignItems: 'center', gap: 16 }}>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 16,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {qrCode ? (
              <Image source={{ uri: qrCode }} style={{ width: 196, height: 196 }} accessibilityLabel="QR code for authenticator setup" />
            ) : otpauthUrl ? (
              <QRCode value={otpauthUrl} size={196} backgroundColor="#FFFFFF" color="#16211F" />
            ) : null}
          </View>
          <Text variant="caption" tone="muted" center>
            Scan this with your authenticator app.
          </Text>
        </View>
      </Card>
      <Button
        label={manual ? 'Hide setup key' : "Can't scan? Enter the setup key"}
        variant="text"
        onPress={() => setManual((current) => !current)}
      />
      {manual ? (
        <Card>
          <View style={{ gap: 12 }}>
            <Text variant="label">Setup key</Text>
            <Text variant="subheading" selectable style={{ letterSpacing: 1 }}>
              {formatSecret(manualEntryCode)}
            </Text>
            <Text variant="caption" tone="muted">
              Enter this key manually if your camera can't scan the code.
            </Text>
            <Button label={copied ? 'Copied' : 'Copy key'} icon={copied ? 'check' : 'copy'} variant="outline" size="sm" onPress={copyKey} />
          </View>
        </Card>
      ) : null}
    </View>
  );
}
