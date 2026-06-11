import type { ApiError } from '@/core/api/client';
import {
  getProfileMe,
  type ProfileMeOut,
} from '@/core/api/profile';
import { v1RoleToUiRole } from '@/core/config/app';
import type { Experience, PlatformRole, Skill } from '@/data/models';
import { useAuthStore } from '@/data/store/auth';

const META_KEYS = new Set([
  'user_id',
  'id',
  '_id',
  'created_at',
  'updated_at',
  'activated_at',
]);

export type ProfileMeSyncResult = {
  complete: boolean;
  status: number | null;
  data: ProfileMeOut | null;
};

const PROFILE_SYNC_TTL_MS = 45_000;
let lastProfileSyncAt = 0;
let lastProfileSyncResult: ProfileMeSyncResult | null = null;
let cachedUserId: string | null = null;

export function invalidateProfileMeCache() {
  lastProfileSyncAt = 0;
  lastProfileSyncResult = null;
  cachedUserId = null;
}

export function getCachedProfileSync(
  userId: string | null,
  force: boolean
): ProfileMeSyncResult | null {
  if (force || !userId || cachedUserId !== userId || !lastProfileSyncResult) {
    return null;
  }
  if (Date.now() - lastProfileSyncAt >= PROFILE_SYNC_TTL_MS) {
    return null;
  }
  return lastProfileSyncResult;
}

export function setCachedProfileSync(
  userId: string | null,
  result: ProfileMeSyncResult
) {
  lastProfileSyncAt = Date.now();
  lastProfileSyncResult = result;
  cachedUserId = userId;
}

function meaningfulKeys(profile: Record<string, unknown>): string[] {
  return Object.keys(profile).filter((k) => {
    if (META_KEYS.has(k)) return false;
    const v = profile[k];
    if (v == null || v === '') return false;
    if (Array.isArray(v) && v.length === 0) return false;
    return true;
  });
}

/** True when profile is missing or has no meaningful fields for the role. */
export function isProfileEmpty(
  profile: Record<string, unknown> | null | undefined,
  role: PlatformRole | string | null | undefined
): boolean {
  if (!profile || typeof profile !== 'object') return true;
  if (meaningfulKeys(profile).length === 0) return true;

  const r = String(role ?? useAuthStore.getState().primaryRole ?? '');

  if (r === 'seeker' || r === 'technician') {
    const name = profile.full_name ?? profile.name;
    const hasName = typeof name === 'string' && name.trim().length >= 2;
    const skills = profile.services_offered ?? profile.skills;
    const hasSkills = Array.isArray(skills) && skills.length > 0;
    const hasCity =
      typeof profile.city === 'string' && profile.city.trim().length > 0;
    const hasAddress =
      typeof profile.address === 'string' && profile.address.trim().length > 2;
    if (r === 'technician') {
      return !(hasName && (hasSkills || hasAddress || hasCity));
    }
    return !(hasName && (hasCity || hasSkills));
  }

  if (r === 'employer') {
    const company = profile.company_name;
    return !(typeof company === 'string' && company.trim().length >= 2);
  }

  if (r === 'customer') {
    const name = profile.full_name ?? profile.name;
    return !(typeof name === 'string' && name.trim().length >= 2);
  }

  return meaningfulKeys(profile).length === 0;
}

function yearsToExperience(years: unknown): Experience | undefined {
  const n = typeof years === 'number' ? years : Number(years);
  if (!Number.isFinite(n)) return undefined;
  if (n <= 1) return '0–1 yr';
  if (n <= 3) return '1–3 yrs';
  return '3+ yrs';
}

function asSkills(raw: unknown): Skill[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const list = raw.filter((s): s is string => typeof s === 'string');
  return list.length ? (list as Skill[]) : undefined;
}

/** Apply `GET /profile/me` payload to local auth store. */
export async function applyProfileMeToStore(
  data: ProfileMeOut,
  complete: boolean
): Promise<void> {
  const platformRole = String(
    data.role ?? useAuthStore.getState().primaryRole ?? ''
  ) as PlatformRole;
  const profile = data.profile ?? {};
  const user = data.user ?? {};
  const userId =
    (typeof user.id === 'string' ? user.id : null) ??
    useAuthStore.getState().userId;
  const phone =
    (typeof user.phone === 'string' ? user.phone : null) ??
    useAuthStore.getState().worker?.phone ??
    useAuthStore.getState().employer?.phone ??
    '';

  const displayName =
    (typeof profile.full_name === 'string' && profile.full_name) ||
    (typeof profile.name === 'string' && profile.name) ||
    (typeof user.name === 'string' && user.name) ||
    (typeof profile.company_name === 'string' && profile.company_name) ||
    useAuthStore.getState().worker?.name ||
    useAuthStore.getState().employer?.name ||
    'User';

  if (data.app) {
    await useAuthStore.getState().setAppModule(data.app);
  }
  if (data.role && typeof data.role === 'string') {
    await useAuthStore.getState().setPrimaryRole(data.role as PlatformRole);
  }

  const uiRole = v1RoleToUiRole(platformRole);
  await useAuthStore.getState().setRole(uiRole);

  await useAuthStore.getState().setUserMeta({
    userId,
    isDetailsFilled: complete,
  });

  const isWorker =
    uiRole === 'worker' ||
    platformRole === 'seeker' ||
    platformRole === 'technician';

  if (isWorker) {
    await useAuthStore.getState().setEmployer(null);
    const lat =
      typeof profile.latitude === 'number'
        ? profile.latitude
        : useAuthStore.getState().worker?.lat;
    const lng =
      typeof profile.longitude === 'number'
        ? profile.longitude
        : useAuthStore.getState().worker?.lng;
    await useAuthStore.getState().setWorker({
      id: userId ?? 'unknown',
      role: 'worker',
      phone,
      name: displayName,
      isDetailsFilled: complete,
      skills:
        asSkills(profile.services_offered) ??
        asSkills(profile.skills) ??
        useAuthStore.getState().worker?.skills,
      experience:
        yearsToExperience(profile.experience_years ?? profile.experience) ??
        (typeof profile.experience_label === 'string'
          ? (profile.experience_label as Experience)
          : undefined) ??
        useAuthStore.getState().worker?.experience,
      lat,
      lng,
      address:
        (typeof profile.address === 'string' ? profile.address : undefined) ??
        useAuthStore.getState().worker?.address,
      online: useAuthStore.getState().worker?.online,
      rating: useAuthStore.getState().worker?.rating,
      jobsCompleted: useAuthStore.getState().worker?.jobsCompleted,
    });
  } else {
    await useAuthStore.getState().setWorker(null);
    await useAuthStore.getState().setEmployer({
      id: userId ?? 'unknown',
      role: 'employer',
      phone,
      name: displayName,
      isDetailsFilled: complete,
      defaultLocation: useAuthStore.getState().employer?.defaultLocation,
    });
  }
}

/** Fetch profile from API; updates store. Network errors keep local state. */
export async function syncProfileMeFromApi(): Promise<ProfileMeSyncResult> {
  const previousComplete = useAuthStore.getState().isDetailsFilled;

  try {
    const data = await getProfileMe();
    const role = data.role ?? useAuthStore.getState().primaryRole;
    const complete = !isProfileEmpty(data.profile, role);
    await applyProfileMeToStore(data, complete);
    return { complete, status: 200, data };
  } catch (e) {
    const err = e as ApiError;
    const status = err.status ?? null;

    if (status === 404) {
      await useAuthStore.getState().setUserMeta({
        userId: useAuthStore.getState().userId,
        isDetailsFilled: false,
      });
      return { complete: false, status, data: null };
    }

    return {
      complete: previousComplete,
      status,
      data: null,
    };
  }
}

export function isSuccessfulProfileStatus(status: number | null): boolean {
  return status != null && status >= 200 && status < 300;
}
