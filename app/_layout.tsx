import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="calendar/[date]" options={{ title: 'Day' }} />
        <Stack.Screen name="calendar/add-expense" options={{ title: 'Add Expense' }} />
        <Stack.Screen name="calendar/add-income" options={{ title: 'Add Income' }} />
        <Stack.Screen name="edit/index" options={{ title: 'Edit' }} />
        <Stack.Screen name="edit/[item]" options={{ title: 'Edit Item' }} />
        <Stack.Screen name="monthly-summary/year-review" options={{ title: 'Year Review' }} />
        <Stack.Screen name="notes/add-note" options={{ title: 'Add Note' }} />
        <Stack.Screen name="auth/login" options={{ title: 'Log In' }} />
        <Stack.Screen name="auth/register" options={{ title: 'Register' }} />
        <Stack.Screen name="admin/index" options={{ title: 'Admin' }} />
        <Stack.Screen name="user/acc" options={{ title: 'Account' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
