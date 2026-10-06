import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';

import { CountdownRing } from '@/components/security/CountdownRing';
import { Card } from '@/components/ui/Card';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme';
import type { AuthenticatorAccount } from '@/types/authenticator';
import { hapticSuccess } from '@/utils/haptics';
import { formatCode, generateTotp, secondsRemaining } from '@/utils/totp';

export function AuthenticatorCodeCard({
  account,
  now,
  onRemove,
}: {
  account: AuthenticatorAccount;
  now: number;
  onRemove: () => Promise<void>;
}) {
  const { colors, fonts } = useTheme();
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    try {
      setCode(
        generateTotp({
          secret: account.secret,
          timeMs: now,
          period: account.period,
          digits: account.digits,
          algorithm: account.algorithm,
        }),
      );
    } catch {
      setCode(null);
    }
  }, [account, now]);

  const remaining = secondsRemaining(now, account.period);
  const shown = code ? formatCode(code) : '------';
  const subtitle = account.label !== account.issuer ? account.label : null;

  async function copyCode() {
    if (!code) return;
    let wrote = false;
    try {
      await Clipboard.setStringAsync(code);
      wrote = true;
    } catch {
      wrote = false;
    }
    if (!wrote && Platform.OS === 'web' && typeof document !== 'undefined') {
      const field = document.createElement('textarea');
      field.value = code;
      field.setAttribute('readonly', 'true');
      field.style.position = 'fixed';
      field.style.left = '-9999px';
      document.body.appendChild(field);
      field.select();
      wrote = document.execCommand('copy');
      field.remove();
    }
    if (!wrote) return;
    setCopied(true);
    hapticSuccess().catch(() => {});
  }

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="subheading">{account.issuer}</Text>
          {subtitle ? (
            <Text variant="caption" tone="muted">
              {subtitle}
            </Text>
          ) : null}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove ${account.issuer}`}
          hitSlop={8}
          onPress={() => setConfirming(true)}
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="trash" color={colors.muted} />
        </Pressable>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, gap: 12 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copied ? `${shown} copied` : `Copy code ${shown}`}
          onPress={copyCode}
          style={{ flex: 1, gap: 2 }}>
          <Text
            variant="display"
            style={{ fontFamily: fonts.semibold, letterSpacing: 1, fontVariant: ['tabular-nums'] }}>
            {shown}
          </Text>
          <Text variant="caption" tone={copied ? 'success' : 'muted'}>
            {code ? (copied ? 'Copied' : 'Tap to copy') : 'This setup key could not produce a code'}
          </Text>
        </Pressable>
        <CountdownRing remaining={remaining} period={account.period} />
      </View>
      <ConfirmationModal
        visible={confirming}
        title={`Remove ${account.issuer}?`}
        message="The shared secret leaves this device. You will need the website’s QR code to add it again."
        confirmLabel="Remove"
        destructive
        loading={removing}
        onCancel={() => setConfirming(false)}
        onConfirm={async () => {
          setRemoving(true);
          try {
            await onRemove();
            setConfirming(false);
          } finally {
            setRemoving(false);
          }
        }}
      />
    </Card>
  );
}
