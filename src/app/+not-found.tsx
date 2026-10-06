import { router } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';

export default function NotFoundScreen() {
  return (
    <Screen>
      <EmptyState
        title="This page isn't available"
        message="The link may be out of date."
        action={<Button label="Go to Authen" onPress={() => router.replace('/')} />}
      />
    </Screen>
  );
}
