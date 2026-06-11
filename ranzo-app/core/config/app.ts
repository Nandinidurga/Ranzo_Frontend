import type { AppMode, PlatformRole, Role } from '@/data/models';
import { getSelectedApp } from '@/core/config/selectedApp';

export { APP_MODE } from '@/core/config/appMode';
export { getSelectedApp } from '@/core/config/selectedApp';

/** Landing WORK → home-services; JOB → job-portal. */
export function appModeForUiRole(role: Role): AppMode {
  return role === 'worker' ? 'home-services' : 'job-portal';
}

export function appModeForPlatformRole(role: PlatformRole): AppMode {
  return role === 'seeker' || role === 'employer' ? 'job-portal' : 'home-services';
}

export function isPlatformRoleValidForApp(app: AppMode, role: PlatformRole): boolean {
  if (app === 'job-portal') {
    return role === 'seeker' || role === 'employer';
  }
  return role === 'technician' || role === 'customer';
}

/** Map UI role to `primary_role` for the selected app module. */
export function toV1Role(role: Role, app: AppMode = getSelectedApp()): PlatformRole {
  if (app === 'job-portal') {
    return role === 'worker' ? 'seeker' : 'employer';
  }
  return role === 'worker' ? 'technician' : 'customer';
}

/** Infer UI role from v1 `primary_role`. */
export function v1RoleToUiRole(primaryRole: PlatformRole | string): Role {
  if (primaryRole === 'employer' || primaryRole === 'customer') return 'employer';
  return 'worker';
}

export function registrationPlatformRoleOptions(app: AppMode = getSelectedApp()): PlatformRole[] {
  if (app === 'job-portal') {
    return ['seeker', 'employer'];
  }
  return ['technician', 'customer'];
}

export function defaultPlatformRoleForUiRole(
  uiRole: Role,
  app: AppMode = getSelectedApp()
): PlatformRole {
  return toV1Role(uiRole, app);
}
