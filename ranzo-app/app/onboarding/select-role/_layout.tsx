import { Stack } from 'expo-router';
import { Colors } from '@/core/theme';

export default function SelectRoleLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.surfaceWhite },
        animation: 'slide_from_right',
      }}
    />
  );
}
