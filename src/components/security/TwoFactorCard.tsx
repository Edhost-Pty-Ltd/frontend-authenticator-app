import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { Text } from '@/components/ui/Text';

export function TwoFactorCard({
  enabled,
  onPress,
}: {
  enabled: boolean;
  onPress: () => void;
}) {
  return (
    <Card>
      <View style={{ gap: 14 }}>
        <Text variant="label" tone="muted">
          Account security
        </Text>
        <StatusIndicator tone={enabled ? 'on' : 'warning'} label={enabled ? 'Protected' : 'Needs attention'} />
        <View style={{ gap: 6 }}>
          <Text variant="subheading">Two-factor authentication</Text>
          <Text tone="muted">
            {enabled
              ? 'Enabled. Your account has an additional layer of protection.'
              : 'Not enabled. An authenticator protects you if your password is stolen.'}
          </Text>
        </View>
        <Button label={enabled ? 'Manage' : 'Enable'} variant={enabled ? 'secondary' : 'primary'} onPress={onPress} />
      </View>
    </Card>
  );
}
