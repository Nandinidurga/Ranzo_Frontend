import { refreshToken as refreshAuthToken } from '@/core/api/auth';
import { bootstrapSessionAfterAuth } from '@/core/api/session';
import { syncProfileMeFromApi } from '@/core/api/profileSync';
import { useAuthStore } from '@/data/store';

export type SplashSessionResult = 'authed' | 'login';

/**
 * M-001: valid access token → authed; expired → silent refresh; else → login.
 */
export async function resolveSplashSession(): Promise<SplashSessionResult> {
  const state = useAuthStore.getState();
  const { token, refreshToken: storedRefresh, roleSelectionPending } = state;

  if (token) {
    if (!roleSelectionPending) {
      try {
        await syncProfileMeFromApi();
      } catch {
        /* access token may be expired */
      }
    }
    return 'authed';
  }

  const rt = storedRefresh ?? useAuthStore.getState().refreshToken;
  if (!rt) {
    if (token) await useAuthStore.getState().signOut();
    return 'login';
  }

  try {
    const tokens = await refreshAuthToken(rt);
    const session = await bootstrapSessionAfterAuth(tokens, tokens.user);
    if (!session.roleSelectionPending) {
      await syncProfileMeFromApi();
    }
    return 'authed';
  } catch {
    await useAuthStore.getState().signOut();
    return 'login';
  }
}
