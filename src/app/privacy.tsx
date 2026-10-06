import { router } from 'expo-router';
import { View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Text } from '@/components/ui/Text';

const sections = [
  {
    title: 'What Authen stores',
    body: 'Your email, a protected password, and the secrets needed for two-factor authentication. Recovery codes are shown to you once and stored only in a form that cannot be read back.',
  },
  {
    title: 'How it is used',
    body: 'That information is used to sign you in and to protect the account. Authen does not use your credentials for advertising.',
  },
  {
    title: 'On this device',
    body: 'A display name and theme choice can stay on this device. Signing out clears the session stored here.',
  },
  {
    title: 'Your choices',
    body: 'You can change your password, replace recovery codes, turn off two-factor authentication, and sign out of sessions.',
  },
];

export default function PrivacyScreen() {
  return (
    <Screen header={<ScreenHeader title="Privacy" onBack={() => (router.canGoBack() ? router.back() : router.replace('/welcome'))} />}>
      <View style={{ gap: 22 }}>
        <Text variant="heading" accessibilityRole="header">
          Privacy
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
