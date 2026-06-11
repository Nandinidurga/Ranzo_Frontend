import { apiFetch } from '@/core/api/client';

export type HealthResponse = any;

export async function health() {
  return apiFetch<HealthResponse>('/', { method: 'GET', auth: false });
}

