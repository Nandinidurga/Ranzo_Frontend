import { apiFetch } from '@/core/api/client';
import { apiV1Path } from '@/core/config/api';
import type {
  ApplicationItem,
  JobDetail,
  JobListItem,
  SeekerSkill,
  SeekerWizardDraft,
} from '@/features/seeker/types';
import { useSeekerWizardStore } from '@/features/seeker/stores/wizardStore';

export async function postSeekerProfile(body: Record<string, unknown>) {
  return apiFetch<Record<string, unknown>>(apiV1Path('/profile/seeker/step/1'), {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function patchSeekerProfile(body: Record<string, unknown>) {
  return apiFetch<Record<string, unknown>>(apiV1Path('/profile/seeker'), {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function patchSeekerSkills(skills: SeekerSkill[]) {
  return apiFetch<Record<string, unknown>>(apiV1Path('/profile/seeker/step/2'), {
    method: 'PATCH',
    body: JSON.stringify({ skills }),
  });
}

export function draftToBasicPayload(draft: SeekerWizardDraft) {
  return {
    full_name: draft.fullName.trim(),
    date_of_birth: draft.dateOfBirth,
    gender: draft.gender,
    email: draft.email.trim() || undefined,
    city: draft.city.trim(),
    photo_uri: draft.photoUri ?? undefined,
  };
}

export async function saveSeekerWizardStep1(draft: SeekerWizardDraft) {
  return postSeekerProfile(draftToBasicPayload(draft));
}

export async function saveSeekerWizardStep2(skills: SeekerSkill[]) {
  return patchSeekerSkills(skills);
}

export async function saveSeekerWizardStep3And4(draft: SeekerWizardDraft) {
  await apiFetch<Record<string, unknown>>(apiV1Path('/profile/seeker/step/3'), {
    method: 'PATCH',
    body: JSON.stringify({
      experience: draft.experiences.map((e) => ({
        id: e.id,
        company: e.company,
        role: e.role,
        start_date: e.startDate,
        end_date: e.endDate ?? undefined,
        description: e.description ?? undefined,
        is_current: e.endDate ? false : true,
      })),
      education: draft.education.map((e) => ({
        id: e.id,
        degree: e.degree,
        institution: e.institution,
        year: e.year,
        score: e.score,
      })),
    }),
  });

  return apiFetch<Record<string, unknown>>(apiV1Path('/profile/seeker/step/4'), {
    method: 'PATCH',
    body: JSON.stringify({
      languages: draft.languages.map((l) => ({
        language: l.language,
        proficiency: l.proficiency,
      })),
      salary_expectation_min: Number(draft.salaryMin) || undefined,
      salary_expectation_max: Number(draft.salaryMax) || undefined,
      salary_period: draft.salaryPeriod,
      availability: draft.availability,
      willing_to_relocate: draft.openToRelocate,
    }),
  });
}

export type SeekerFeed = {
  recommended: JobListItem[];
  latest: JobListItem[];
  sectors: string[];
  completeness_pct: number;
};

export async function getSeekerFeed(city?: string): Promise<SeekerFeed> {
  return apiFetch<SeekerFeed>(
    apiV1Path(`/feed/seeker${city ? `?city=${encodeURIComponent(city)}` : ''}`)
  );
}

export type JobSearchParams = {
  q?: string;
  sector?: string;
  sort?: string;
};

export async function searchJobs(params: JobSearchParams): Promise<JobListItem[]> {
  const qs = new URLSearchParams();
  if (params.q) qs.set('q', params.q);
  if (params.sector) qs.set('sector', params.sector);
  if (params.sort) qs.set('sort', params.sort);
  const query = qs.toString();
  const res = await apiFetch<{ items: JobListItem[] }>(
    apiV1Path(`/search/jobs${query ? `?${query}` : ''}`),
    { method: 'GET', auth: false }
  );
  return res.items ?? [];
}

export async function getJobDetail(jobId: string): Promise<JobDetail> {
  return apiFetch<JobDetail>(apiV1Path(`/jobs/${jobId}`), { method: 'GET', auth: false });
}

export async function applyToJob(
  jobId: string,
  body: { cover_message?: string; salary_expectation?: { min?: number; max?: number } }
) {
  const payload = {
    cover_message: body.cover_message,
    salary_expectation_min: body.salary_expectation?.min,
    salary_expectation_max: body.salary_expectation?.max,
  };
  return apiFetch<{ id: string; status: string }>(apiV1Path(`/jobs/${jobId}/apply`), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getMyApplications(): Promise<ApplicationItem[]> {
  return apiFetch<ApplicationItem[]>(apiV1Path('/applications/my'), { method: 'GET' });
}

export async function getApplicationDetail(id: string): Promise<ApplicationItem> {
  return apiFetch<ApplicationItem>(apiV1Path(`/applications/${id}`), { method: 'GET' });
}
