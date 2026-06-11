import { KEY_ROLE_SELECT_DONE, loadJSON, saveJSON } from '@/data/storage';

/** True only after user explicitly picks WORK/JOB → sub-role. */
export async function hasCompletedRoleSelect(): Promise<boolean> {
  const done = await loadJSON<boolean>(KEY_ROLE_SELECT_DONE);
  return done === true;
}

export async function markRoleSelectComplete(): Promise<void> {
  await saveJSON(KEY_ROLE_SELECT_DONE, true);
}

export async function clearRoleSelectComplete(): Promise<void> {
  await saveJSON(KEY_ROLE_SELECT_DONE, false);
}
