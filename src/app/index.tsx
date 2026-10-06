import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

import { LaunchScreen } from '@/components/ui/LaunchScreen';
import { useAuth } from '@/hooks/useAuth';

const MINIMUM_LAUNCH_MS = 900;

export default function Index() {
  const { status } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), MINIMUM_LAUNCH_MS);
    return () => clearTimeout(timer);
  }, []);

  if (status === 'booting' || !ready) return <LaunchScreen />;
  if (status === 'authenticated') return <Redirect href="/home" />;
  return <Redirect href="/welcome" />;
}
