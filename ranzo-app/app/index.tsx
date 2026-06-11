import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { SplashView } from '@/core/widgets';
import { resolveStartupRoute } from '@/core/bootstrap/startupRoute';
import { navigatePostAuth } from '@/core/navigation/postAuth';
import { useAuthStore } from '@/data/store';
import { useI18nStore } from '@/core/i18n';

/** Branding splash only when continuing past language selection. */
const SPLASH_MS = 1200;

export default function SplashRoute() {
  const router = useRouter();
  const authHydrated = useAuthStore((s) => s.hydrated);
  const i18nHydrated = useI18nStore((s) => s.hydrated);

  const navigated = useRef(false);
  const nativeSplashHidden = useRef(false);
  const splashStarted = useRef<number | null>(null);
  const [showBrandingSplash, setShowBrandingSplash] = useState(false);

  const hideNativeSplash = () => {
    if (nativeSplashHidden.current) return;
    nativeSplashHidden.current = true;
    ExpoSplashScreen.hideAsync().catch(() => {});
  };

  useEffect(() => {
    if (!authHydrated || !i18nHydrated) return;
    if (navigated.current) return;

    hideNativeSplash();

    const bootstrap = async () => {
      const route = await resolveStartupRoute();

      if (route === 'language') {
        if (navigated.current) return;
        navigated.current = true;
        router.replace('/language');
        return;
      }

      setShowBrandingSplash(true);
      if (splashStarted.current == null) {
        splashStarted.current = Date.now();
      }

      const started = splashStarted.current ?? Date.now();
      const remaining = SPLASH_MS - (Date.now() - started);
      if (remaining > 0) {
        await new Promise((r) => setTimeout(r, remaining));
      }

      if (navigated.current) return;
      navigated.current = true;

      if (route === 'authed') {
        await navigatePostAuth(router);
        return;
      }

      router.replace('/auth/login');
    };

    void bootstrap();
  }, [authHydrated, i18nHydrated, router]);

  if (!showBrandingSplash) {
    return <View style={{ flex: 1 }} onLayout={hideNativeSplash} />;
  }

  return (
    <View style={{ flex: 1 }} onLayout={hideNativeSplash}>
      <SplashView />
    </View>
  );
}
