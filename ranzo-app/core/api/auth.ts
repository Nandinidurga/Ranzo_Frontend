import { apiFetch, apiFetchWithStatus } from '@/core/api/client';
import { apiV1Path } from '@/core/config/api';
import type { AppMode, PlatformRole } from '@/data/models';

export type V1UserOut = {
  id: string;
  phone: string;
  primary_role: PlatformRole | null;
  app?: AppMode | null;
  role_selection_pending?: boolean;
  status: string;
};

export type TokenPairOut = {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  user: V1UserOut;
};

export type RegisterOut = {
  success: boolean;
  user: V1UserOut;
};

export type OtpPurpose = 'register' | 'login';

export type OtpRequestOut = {
  success: boolean;
  verification_id?: string;
  otp?: string;
  expires_at?: string;
  dev?: unknown;
};

export type SuccessOut = { success: boolean };

export type SessionDeviceOut = {
  id: string;
  device?: string | null;
  platform?: string | null;
  last_used_at?: string | null;
};

export async function requestOtp(phone: string, purpose: OtpPurpose) {
  return apiFetch<OtpRequestOut>(apiV1Path('/auth/request-otp'), {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ phone, purpose }),
  });
}

export async function verifyOtp(
  phone: string,
  otp: string,
  verificationId: string,
  purpose: OtpPurpose = 'login'
) {
  return apiFetch<TokenPairOut>(apiV1Path('/auth/verify-otp'), {
    method: 'POST',
    auth: false,
    body: JSON.stringify({
      phone,
      otp,
      verification_id: verificationId,
      purpose,
    }),
  });
}

export async function loginWithPassword(phone: string, password: string) {
  return apiFetch<TokenPairOut>(apiV1Path('/auth/login'), {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ phone, password }),
  });
}

export type RegisterAccountIn = {
  name: string;
  phone: string;
  password: string;
  otp: string;
  verification_id?: string;
};

export type RegisterAccountResult = {
  status: number;
  data: RegisterOut;
};

/** Creates account only (201) — no tokens. Role is set later via assign-role. */
export async function registerAccount(body: RegisterAccountIn) {
  return apiFetchWithStatus<RegisterOut>(apiV1Path('/auth/register'), {
    method: 'POST',
    auth: false,
    body: JSON.stringify({
      name: body.name.trim(),
      phone: body.phone,
      password: body.password,
      otp: body.otp,
      ...(body.verification_id ? { verification_id: body.verification_id } : {}),
    }),
  });
}

export async function refreshToken(refreshTokenValue: string) {
  return apiFetch<TokenPairOut>(apiV1Path('/auth/refresh-token'), {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ refresh_token: refreshTokenValue }),
  });
}

export async function logout(refreshTokenValue?: string | null) {
  return apiFetch<SuccessOut>(apiV1Path('/auth/logout'), {
    method: 'POST',
    auth: true,
    body: JSON.stringify(
      refreshTokenValue ? { refresh_token: refreshTokenValue } : {}
    ),
  });
}

export async function addRole(role: PlatformRole) {
  return apiFetch<SuccessOut>(apiV1Path('/auth/add-role'), {
    method: 'POST',
    body: JSON.stringify({ role }),
  });
}

export async function assignRole(args: {
  app: AppMode;
  primary_role: PlatformRole;
  language_preference?: 'en' | 'hi' | 'te';
}) {
  return apiFetch<TokenPairOut>(apiV1Path('/auth/assign-role'), {
    method: 'POST',
    body: JSON.stringify(args),
  });
}

export async function listSessions() {
  return apiFetch<SessionDeviceOut[]>(apiV1Path('/auth/sessions'), { method: 'GET' });
}

export async function revokeSession(sessionId: string) {
  return apiFetch<SuccessOut>(apiV1Path(`/auth/sessions/${sessionId}`), { method: 'DELETE' });
}
