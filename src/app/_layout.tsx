import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSession } from '../features/session/store';
import { useSubscription } from '../features/subscription/store';
import { useTheme } from '../theme/tokens';

export default function RootLayout() {
  const hydrate = useSession((state) => state.hydrate);
  const initializeSubscriptions = useSubscription((state) => state.initialize);
  const { isDark } = useTheme();

  useEffect(() => {
    void Promise.all([hydrate(), initializeSubscriptions()]);
  }, [hydrate, initializeSubscriptions]);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
    </>
  );
}
