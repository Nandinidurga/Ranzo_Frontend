import { Stack } from 'expo-router';
import { Colors } from '@/core/theme';

export default function CustomerRootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.surfaceWhite } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="services/[categoryId]" />
      <Stack.Screen name="book" />
      <Stack.Screen name="booking/[id]" />
      <Stack.Screen name="booking/[id]/tracking" />
      <Stack.Screen name="booking/[id]/complete" />
    </Stack>
  );
}
