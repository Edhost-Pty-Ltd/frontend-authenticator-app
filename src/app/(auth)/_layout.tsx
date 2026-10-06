import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { LaunchScreen } from '@/components/ui/LaunchScreen';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/theme';

export default function AuthLayout() {
  const { status } = useAuth();
  const { colors, scheme } = useTheme();

  if (status === 'booting') return <LaunchScreen />;
  if (status === 'authenticated') return <Redirect href="/home" />;

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </>
  );
}
