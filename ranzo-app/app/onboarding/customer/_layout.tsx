import { Stack } from 'expo-router';
import { Colors } from '@/core/theme';

export default function CustomerOnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.surfaceWhite } }} />
  );
}
