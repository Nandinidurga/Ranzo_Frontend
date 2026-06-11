import type { AppMode } from '@/data/models';
import { APP_MODE } from '@/core/config/appMode';
import { useAuthStore } from '@/data/store/auth';

/** Active module from session, else env default. */
export function getSelectedApp(): AppMode {
  return useAuthStore.getState().app ?? APP_MODE;
}
