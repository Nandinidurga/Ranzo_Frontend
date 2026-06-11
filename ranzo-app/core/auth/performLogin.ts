import type { ApiError } from '@/core/api/client';
import { loginWithPassword } from '@/core/api/auth';
import { completeAuthSession } from '@/core/api/session';
import { navigatePostAuth } from '@/core/navigation/postAuth';
import {
  savePasswordLoginCredentials,
  type SavedLoginMeta,
} from '@/core/auth/secureLogin';
import type { Role } from '@/data/models';
import type { Router } from 'expo-router';

export async function performPasswordLogin(
  phone: string,
  password: string,
  uiRole: Role,
  router: Router,
  opts?: { rememberCredentials?: boolean; meta?: SavedLoginMeta }
) {
  const tokens = await loginWithPassword(phone, password);
  const session = await completeAuthSession(
    {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    },
    tokens.user
  );

  if (opts?.rememberCredentials !== false) {
    await savePasswordLoginCredentials(phone, password, {
      role: opts?.meta?.role ?? session.resolvedRole,
      app: opts?.meta?.app ?? session.app,
    });
  }

  await navigatePostAuth(router);
  return session;
}

export function loginErrorMessage(e: unknown, fallback: string) {
  return (e as ApiError)?.message ?? fallback;
}
