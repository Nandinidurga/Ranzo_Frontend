import type { Router } from 'expo-router';
import { assignRole } from '@/core/api/auth';
import { completeAuthSession } from '@/core/api/session';
import { appModeForPlatformRole } from '@/core/config/app';
import { navigateAfterRoleChosen } from '@/core/navigation/postAuth';
import { useI18nStore } from '@/core/i18n';
import type { PlatformRole } from '@/data/models';

export async function choosePlatformRole(router: Router, role: PlatformRole) {
  const app = appModeForPlatformRole(role);
  const rawLocale = useI18nStore.getState().locale;
  const language_preference =
    rawLocale === 'hi' || rawLocale === 'te' ? rawLocale : ('en' as const);

  const tokens = await assignRole({ app, primary_role: role, language_preference });

  await completeAuthSession(
    {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    },
    tokens.user
  );

  await navigateAfterRoleChosen(router, role);
}
