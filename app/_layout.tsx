import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { SessionProvider} from '@/context/ctx';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <SessionProvider>
        <ThemeProvider value={DarkTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name='authentication/signIn' />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ThemeProvider>
      </SessionProvider>
    </SafeAreaProvider>
  );
}