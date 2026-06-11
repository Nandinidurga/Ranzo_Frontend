import { apiFetch } from '@/core/api/client';
import { apiV1Path } from '@/core/config/api';
import type { SuccessOut } from '@/core/api/auth';

export type RegisterDeviceTokenIn = {
  token: string;
  device_id?: string;
  platform?: string;
};

export async function registerDeviceToken(body: RegisterDeviceTokenIn) {
  return apiFetch<SuccessOut>(apiV1Path('/devices/register-token'), {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
