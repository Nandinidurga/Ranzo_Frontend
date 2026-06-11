import { apiFetch } from '@/core/api/client';
import { apiV1Path } from '@/core/config/api';

export type JobDoc = Record<string, unknown> & { id: string };

export type JobListOut = {
  items: JobDoc[];
  total?: number;
  page?: number;
  size?: number;
};

export type JobStatsOut = {
  views: number;
  applications: number;
  conversion: number;
};

export type JobCreateBody = {
  title: string;
  status?: string;
  sector?: string;
  salary_min?: number;
  salary_max?: number;
  latitude?: number;
  longitude?: number;
  [key: string]: unknown;
};

export async function createJob(body: JobCreateBody) {
  return apiFetch<JobDoc>(apiV1Path('/jobs'), {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function getMyJobs() {
  return apiFetch<JobDoc[]>(apiV1Path('/jobs/my'), { method: 'GET' });
}

export async function getJob(jobId: string) {
  return apiFetch<JobDoc>(apiV1Path(`/jobs/${jobId}`), { method: 'GET' });
}

export async function patchJob(jobId: string, body: Partial<JobCreateBody>) {
  return apiFetch<JobDoc>(apiV1Path(`/jobs/${jobId}`), {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function deleteJob(jobId: string) {
  return apiFetch<void>(apiV1Path(`/jobs/${jobId}`), { method: 'DELETE' });
}

export async function getJobStats(jobId: string) {
  return apiFetch<JobStatsOut>(apiV1Path(`/jobs/${jobId}/stats`), { method: 'GET' });
}

export async function applyToJob(jobId: string) {
  return apiFetch<Record<string, unknown>>(apiV1Path(`/jobs/${jobId}/apply`), {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function getMyApplications() {
  return apiFetch<Record<string, unknown>[]>(apiV1Path('/applications/my'), {
    method: 'GET',
  });
}

export async function searchJobs(params?: { q?: string; page?: number; size?: number }) {
  const qs = new URLSearchParams();
  if (params?.q) qs.set('q', params.q);
  if (params?.page != null) qs.set('page', String(params.page));
  if (params?.size != null) qs.set('size', String(params.size));
  const suffix = qs.toString() ? `?${qs}` : '';
  return apiFetch<JobListOut>(apiV1Path(`/search/jobs${suffix}`), {
    method: 'GET',
    auth: false,
  });
}
