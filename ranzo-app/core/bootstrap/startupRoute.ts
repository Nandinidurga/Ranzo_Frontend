import { hasCompletedLanguageIntro } from '@/core/bootstrap/languageIntro';
import { resolveSplashSession } from '@/core/bootstrap/splashSession';

export type StartupRoute = 'language' | 'login' | 'authed';

/** Cold-start route: language → login → app (when session exists). */
export async function resolveStartupRoute(): Promise<StartupRoute> {
  const introDone = await hasCompletedLanguageIntro();
  if (!introDone) return 'language';

  const session = await resolveSplashSession();
  if (session === 'authed') return 'authed';
  return 'login';
}
