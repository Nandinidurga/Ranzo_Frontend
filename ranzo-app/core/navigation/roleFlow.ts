import type { Router } from 'expo-router';

export const ROLE_SELECT_MAIN = '/onboarding/select-role';
export const ROLE_SELECT_WORK = '/onboarding/select-role/work';
export const ROLE_SELECT_JOB = '/onboarding/select-role/job';

export function goBackToRoleSelectMain(router: Router) {
  router.replace(ROLE_SELECT_MAIN as never);
}

export function goBackToRoleSelectWork(router: Router) {
  router.replace(ROLE_SELECT_WORK as never);
}

export function goBackToRoleSelectJob(router: Router) {
  router.replace(ROLE_SELECT_JOB as never);
}
