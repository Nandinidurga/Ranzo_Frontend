import { useEffect, useRef } from 'react';
import { Stack, useRouter } from 'expo-router';
import { Colors } from '@/core/theme';
import { hasCompletedLanguageIntro } from '@/core/bootstrap/languageIntro';

export default function AuthLayout() {
  const router = useRouter();
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;
    void hasCompletedLanguageIntro().then((done) => {
      if (!done) router.replace('/language');
    });
  }, [router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.surfaceWhite },
      }}
    />
  );
}
