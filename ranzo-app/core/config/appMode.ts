import type { AppMode } from '@/data/models';

/** Default app module from env (no store dependency). */
export const APP_MODE: AppMode =
  (process.env.EXPO_PUBLIC_APP_MODE as AppMode | undefined) || 'home-services';
