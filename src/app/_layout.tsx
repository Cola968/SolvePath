import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SUBSCRIPTIONS_ENABLED } from '../config/release';
import { useSession } from '../features/session/store';
import { useSubscription } from '../features/subscription/store';
import { useTheme } from '../theme/tokens';

export default function RootLayout() {
  const hydrate = useSession((state) => state.hydrate);
  const initializeSubscriptions = useSubscription((state) => state.initialize);
  const { isDark } = useTheme();

  useEffect(() => {
    if (SUBSCRIPTIONS_ENABLED) {
      void Promise.all([hydrate(), initializeSubscriptions()]);
      return;
    }
    void hydrate();
  }, [hydrate, initializeSubscriptions]);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
    </>
  );
}
