import React from 'react';
import { Stack } from 'expo-router';
import { Colors } from '@/core/theme';

export default function WorkerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.surfaceWhite },
      }}
    />
  );
}
