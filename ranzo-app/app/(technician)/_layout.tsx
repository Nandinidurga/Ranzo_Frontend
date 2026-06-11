import { Stack } from 'expo-router';
import { Colors } from '@/core/theme';

export default function TechnicianRootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.surfaceWhite } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="service/[id]" />
      <Stack.Screen name="job-history" />
    </Stack>
  );
}
