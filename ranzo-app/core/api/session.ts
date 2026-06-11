import type { TokenPairOut, V1UserOut } from '@/core/api/auth';
import { syncProfileMeFromApi } from '@/core/api/profileSync';
import { v1RoleToUiRole } from '@/core/config/app';
import type { AppMode, PlatformRole, Role } from '@/data/models';
import type { EmployerProfile, WorkerProfile } from '@/data/models';
import { useAuthStore } from '@/data/store';
import type { Router } from 'expo-router';

function isRoleSelectionPending(user: V1UserOut): boolean {
  if (user.role_selection_pending === true) return true;
  return user.primary_role == null;
}

/**
 * Apply login/verify-otp/assign-role tokens locally.
 * Profile completeness is updated by `syncProfileMeFromApi()` after role is assigned.
 */
export async function bootstrapSessionAfterAuth(
  tokens: { access_token: string; refresh_token: string },
  apiUser: V1UserOut,
  displayName?: string
) {
  const pending = isRoleSelectionPending(apiUser);
  const primaryRole = apiUser.primary_role ?? null;
  const app: AppMode | null = apiUser.app ?? null;
  const userId = apiUser.id;
  const phone = apiUser.phone;

  const state = useAuthStore.getState();
  const sameUser = state.userId === userId;
  const existingWorker =
    sameUser && state.worker?.id === userId ? state.worker : null;
  const existingEmployer =
    sameUser && state.employer?.id === userId ? state.employer : null;

  const name =
    displayName?.trim() ||
    existingWorker?.name ||
    existingEmployer?.name ||
    'User';

  const resolvedRole: Role = primaryRole
    ? v1RoleToUiRole(primaryRole)
    : state.role ?? 'worker';

  let worker: WorkerProfile | null = null;
  let employer: EmployerProfile | null = null;

  if (!pending) {
    if (resolvedRole === 'worker') {
      worker = {
        id: userId,
        phone,
        role: 'worker',
        name,
        isDetailsFilled: false,
        skills: existingWorker?.skills,
        experience: existingWorker?.experience,
        lat: existingWorker?.lat,
        lng: existingWorker?.lng,
        address: existingWorker?.address,
        online: existingWorker?.online,
        rating: existingWorker?.rating,
        jobsCompleted: existingWorker?.jobsCompleted,
      };
    } else {
      employer = {
        id: userId,
        phone,
        role: 'employer',
        name,
        isDetailsFilled: false,
        defaultLocation: existingEmployer?.defaultLocation,
      };
    }
  }

  await useAuthStore.getState().setSessionAfterAuth({
    token: tokens.access_token,
    refreshToken: tokens.refresh_token,
    role: resolvedRole,
    userId,
    app,
    primaryRole,
    roleSelectionPending: pending,
    isDetailsFilled: false,
    worker,
    employer,
  });

  return { userId, resolvedRole, phone, name, app, primaryRole, roleSelectionPending: pending };
}

/** Bootstrap session; profile sync runs after navigation when role is assigned. */
export async function completeAuthSession(
  tokens: { access_token: string; refresh_token: string },
  apiUser: V1UserOut,
  displayName?: string
) {
  const session = await bootstrapSessionAfterAuth(tokens, apiUser, displayName);
  if (!session.roleSelectionPending && session.primaryRole) {
    void syncProfileMeFromApi();
  }
  return session;
}

export function homePathForPrimaryRole(
  primaryRole: PlatformRole | string | null | undefined
): string {
  switch (primaryRole) {
    case 'seeker':
      return '/(seeker)/(tabs)';
    case 'employer':
      return '/(employer)/(tabs)';
    case 'customer':
      return '/(customer)/(tabs)';
    case 'technician':
      return '/(technician)/(tabs)';
    default:
      return '/onboarding/select-role';
  }
}

export function navigateAfterAuth(router: Router, resolvedRole: Role) {
  const primaryRole = useAuthStore.getState().primaryRole;
  if (primaryRole === 'seeker') {
    router.replace('/(seeker)/(tabs)' as never);
    return;
  }
  if (primaryRole === 'customer') {
    router.replace('/(customer)/(tabs)' as never);
    return;
  }
  if (primaryRole === 'employer') {
    router.replace('/(employer)/(tabs)' as never);
    return;
  }
  if (primaryRole === 'technician' || resolvedRole === 'worker') {
    router.replace('/(technician)/(tabs)' as never);
    return;
  }
  router.replace('/onboarding/select-role' as never);
}

/** M-001: route to home for the user's primary role. */
export function navigateToPrimaryRoleHome(router: Router) {
  const { primaryRole, role, roleSelectionPending } = useAuthStore.getState();
  if (roleSelectionPending || !primaryRole) {
    router.replace('/onboarding/select-role' as never);
    return;
  }
  if (primaryRole === 'seeker') {
    router.replace('/(seeker)/(tabs)' as never);
    return;
  }
  if (primaryRole === 'customer') {
    router.replace('/(customer)/(tabs)' as never);
    return;
  }
  if (primaryRole === 'employer') {
    router.replace('/(employer)/(tabs)' as never);
    return;
  }
  if (primaryRole === 'technician') {
    router.replace('/(technician)/(tabs)' as never);
    return;
  }
  const uiRole: Role | null = role;
  if (!uiRole) {
    router.replace('/auth/login');
    return;
  }
  navigateAfterAuth(router, uiRole);
}
