import { apiFetch } from '@/core/api/client';
import { apiV1Path } from '@/core/config/api';
import type { SuccessOut } from '@/core/api/auth';

export type LocationUpdateIn = {
  lat: number;
  lng: number;
  accuracy_meters?: number;
  battery_level?: number;
};

export async function updateLocation(body: LocationUpdateIn) {
  return apiFetch<SuccessOut>(apiV1Path('/location/update'), {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
