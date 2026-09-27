import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSession } from '../features/session/store';
import { useTheme } from '../theme/tokens';

export default function RootLayout() {
  const hydrate = useSession((state) => state.hydrate);
  const { isDark } = useTheme();
  useEffect(() => {
    void hydrate();
  }, [hydrate]);
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
    </>
  );
}
