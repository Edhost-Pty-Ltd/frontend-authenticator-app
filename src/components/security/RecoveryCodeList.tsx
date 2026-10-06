import { useState } from 'react';
import { Share, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Notice } from '@/components/ui/Notice';
import { Text } from '@/components/ui/Text';
import { formatBackupCode } from '@/utils/format';

export function RecoveryCodeList({ codes }: { codes: string[] }) {
  const [copied, setCopied] = useState(false);
  const plain = codes.map((code) => code.replace(/[^A-Fa-f0-9]/g, '').toUpperCase()).join('\n');

  async function copyCodes() {
    await Clipboard.setStringAsync(plain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function exportCodes() {
    try {
      await Share.share({ message: plain });
    } catch {
      await copyCodes();
    }
  }

  return (
    <View style={{ gap: 16 }}>
      <Notice
        tone="warning"
        title="Keep these private"
        message="Anyone with these codes may be able to access your account."
      />
      <Card>
        <View style={{ gap: 12 }}>
          {codes.map((code) => (
            <Text key={code} variant="subheading" selectable style={{ letterSpacing: 0.8 }}>
              {formatBackupCode(code)}
            </Text>
          ))}
        </View>
      </Card>
      <Text variant="caption" tone="muted">
        Each code works once. The dash is only there to make it easier to read.
      </Text>
      <Button label={copied ? 'Copied' : 'Copy codes'} icon={copied ? 'check' : 'copy'} variant="secondary" onPress={copyCodes} />
      <Button label="Save / export" icon="key" variant="outline" onPress={exportCodes} />
    </View>
  );
}
