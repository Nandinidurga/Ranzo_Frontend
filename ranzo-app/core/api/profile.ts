import { apiFetch, type ApiError } from '@/core/api/client';
import { apiV1Path } from '@/core/config/api';
import { getSelectedApp } from '@/core/config/app';
import type { AppMode, Experience, PlatformRole } from '@/data/models';
import { useAuthStore } from '@/data/store/auth';

export type ProfileMeOut = {
  user: Record<string, unknown>;
  profile: Record<string, unknown> | null;
  role: PlatformRole | string | null;
  app?: AppMode;
};

export type ProfileCompletenessOut = {
  completeness_pct: number;
};

export type WorkerProfileInput = {
  name: string;
  skills: string[];
  experience: Experience;
  lat: number;
  lng: number;
  address: string;
  city?: string;
  radius_km?: number;
};

function activePlatformRole(): PlatformRole {
  const fromStore = useAuthStore.getState().primaryRole;
  if (fromStore) return fromStore;
  const app = getSelectedApp();
  return app === 'job-portal' ? 'seeker' : 'technician';
}

function profilePathForRole(role: PlatformRole) {
  return apiV1Path(`/profile/${role}`);
}

export function experienceToYears(exp: Experience): number {
  if (exp === '0–1 yr') return 1;
  if (exp === '1–3 yrs') return 2;
  return 4;
}

/** Map onboarding input → v1 `PATCH /profile/me` body for seeker or technician. */
export function buildWorkerProfilePatch(input: WorkerProfileInput): Record<string, unknown> {
  const city =
    input.city ??
    input.address.split(',')[0]?.trim() ??
    input.address.trim().slice(0, 64);
  const role = activePlatformRole();

  if (role === 'seeker') {
    return {
      full_name: input.name.trim(),
      city,
      skills: input.skills,
      experience_years: experienceToYears(input.experience),
      availability: 'immediate',
    };
  }

  return {
    full_name: input.name.trim(),
    city,
    services_offered: input.skills,
    service_radius_km: input.radius_km ?? 10,
    latitude: input.lat,
    longitude: input.lng,
    address: input.address.trim(),
  };
}

/** Recommended: partial update for JWT active role. */
export async function patchProfileMe(body: Record<string, unknown>) {
  return apiFetch<Record<string, unknown>>(apiV1Path('/profile/me'), {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function getProfileMe() {
  return apiFetch<ProfileMeOut>(apiV1Path('/profile/me'), { method: 'GET' });
}

export async function patchRoleProfile(
  role: PlatformRole,
  body: Record<string, unknown>
) {
  return apiFetch<Record<string, unknown>>(profilePathForRole(role), {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function createRoleProfile(
  role: PlatformRole,
  body: Record<string, unknown>
) {
  return apiFetch<Record<string, unknown>>(profilePathForRole(role), {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** Save worker/seeker/technician profile via `PATCH /profile/me`. */
export type EmployerProfileInput = {
  company_name: string;
  industry?: string;
  city: string;
  address?: string;
  hiring_contact_name?: string;
  hiring_contact_phone?: string;
};

export type CustomerProfileInput = {
  full_name: string;
  email?: string;
};

export async function upsertEmployerProfile(input: EmployerProfileInput) {
  const body: Record<string, unknown> = {
    company_name: input.company_name.trim(),
    city: input.city.trim(),
    ...(input.industry ? { industry: input.industry.trim() } : {}),
    ...(input.address ? { address: input.address.trim() } : {}),
    ...(input.hiring_contact_name
      ? { hiring_contact_name: input.hiring_contact_name.trim() }
      : {}),
    ...(input.hiring_contact_phone
      ? { hiring_contact_phone: input.hiring_contact_phone.trim() }
      : {}),
  };
  try {
    return await patchProfileMe(body);
  } catch (e) {
    const err = e as ApiError;
    if (err.status === 404 || err.status === 400) {
      try {
        return await createRoleProfile('employer', body);
      } catch (e2) {
        const err2 = e2 as ApiError;
        if (err2.status === 409) {
          return patchRoleProfile('employer', body);
        }
        throw e2;
      }
    }
    throw e;
  }
}

export async function upsertCustomerProfile(input: CustomerProfileInput) {
  const body: Record<string, unknown> = {
    full_name: input.full_name.trim(),
    ...(input.email ? { email: input.email.trim() } : {}),
    saved_addresses: [],
  };
  try {
    return await patchProfileMe(body);
  } catch (e) {
    const err = e as ApiError;
    if (err.status === 404 || err.status === 400) {
      try {
        return await createRoleProfile('customer', body);
      } catch (e2) {
        const err2 = e2 as ApiError;
        if (err2.status === 409) {
          return patchRoleProfile('customer', body);
        }
        throw e2;
      }
    }
    throw e;
  }
}

export async function upsertWorkerProfile(input: WorkerProfileInput) {
  const body = buildWorkerProfilePatch(input);
  try {
    return await patchProfileMe(body);
  } catch (e) {
    const err = e as ApiError;
    if (err.status === 404 || err.status === 400) {
      const role = activePlatformRole();
      try {
        return await createRoleProfile(role, body);
      } catch (e2) {
        const err2 = e2 as ApiError;
        if (err2.status === 409) {
          return patchRoleProfile(role, body);
        }
        throw e2;
      }
    }
    throw e;
  }
}

export async function getProfileCompleteness() {
  return apiFetch<ProfileCompletenessOut>(apiV1Path('/profile/completeness'), {
    method: 'GET',
  });
}

export async function getPublicProfile(role: PlatformRole, userId: string) {
  return apiFetch<Record<string, unknown>>(apiV1Path(`/profile/${role}/${userId}`), {
    method: 'GET',
    auth: false,
  });
}

export async function getPublicSeekerProfile(profileId: string) {
  return getPublicProfile('seeker', profileId);
}

export async function getPublicEmployerProfile(profileId: string) {
  return getPublicProfile('employer', profileId);
}

export async function getPublicTechnicianProfile(profileId: string) {
  return getPublicProfile('technician', profileId);
}

export async function getPublicCustomerProfile(profileId: string) {
  return getPublicProfile('customer', profileId);
}
