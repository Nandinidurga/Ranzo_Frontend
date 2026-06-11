import { Stack } from 'expo-router';
import { Colors } from '@/core/theme';

export default function SeekerRootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.surfaceWhite } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="job/[id]" />
      <Stack.Screen name="job/[id]/apply" />
      <Stack.Screen name="applications/index" />
      <Stack.Screen name="applications/[id]" />
    </Stack>
  );
}
