import { router } from 'expo-router';
import { View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Text } from '@/components/ui/Text';

const sections = [
  {
    title: 'Your account',
    body: 'You are responsible for the email, password, authenticator, and recovery codes on your account. Share them only with people you trust with the account itself.',
  },
  {
    title: 'Protection',
    body: 'Two-factor authentication adds a second step at sign-in. If you lose both the authenticator and the recovery codes, you may not be able to get back in.',
  },
  {
    title: 'Attempts',
    body: 'Authen may pause sign-in, reset, and code checks after repeated failures. That pause protects the account.',
  },
  {
    title: 'Sessions',
    body: 'Signing out ends access on that device. You should sign out on devices you do not control.',
  },
];

export default function TermsScreen() {
  return (
    <Screen header={<ScreenHeader title="Terms" onBack={() => (router.canGoBack() ? router.back() : router.replace('/welcome'))} />}>
      <View style={{ gap: 22 }}>
        <Text variant="heading" accessibilityRole="header">
          Terms
        </Text>
        {sections.map((section) => (
          <View key={section.title} style={{ gap: 6 }}>
            <Text variant="label">{section.title}</Text>
            <Text tone="muted">{section.body}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}
