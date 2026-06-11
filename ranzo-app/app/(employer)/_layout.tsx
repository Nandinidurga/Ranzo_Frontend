import { Stack } from 'expo-router';
import { Colors } from '@/core/theme';

export default function EmployerRootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.surfaceWhite } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="post-job" />
      <Stack.Screen name="applicant/[id]" />
      <Stack.Screen name="walk-in/new" />
      <Stack.Screen name="walk-in/live" />
      <Stack.Screen name="subscription" />
    </Stack>
  );
}
