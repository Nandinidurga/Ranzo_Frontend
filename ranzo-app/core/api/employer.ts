import { apiFetch } from '@/core/api/client';
import { apiV1Path } from '@/core/config/api';
import type { EmployerWizardDraft } from '@/features/employer/stores/wizardStore';
import type {
  ApplicantFilters,
  EmployerApplicant,
  EmployerDashboard,
  GstVerifyStatus,
  SubscriptionTier,
} from '@/features/job-portal/employerPortal';
import { upsertEmployerProfile, type EmployerProfileInput } from '@/core/api/profile';
import { getMyJobs } from '@/core/api/jobs';

export function wizardDraftToProfile(draft: EmployerWizardDraft): EmployerProfileInput {
  const city =
    draft.address.split(',')[0]?.trim() ||
    draft.address.trim().slice(0, 64) ||
    'Hyderabad';
  return {
    company_name: draft.companyName,
    industry: draft.industry,
    city,
    address: draft.address,
    hiring_contact_name: draft.contactName,
    hiring_contact_phone: draft.contactPhone,
  };
}

export async function saveEmployerWizard(draft: EmployerWizardDraft) {
  return upsertEmployerProfile(wizardDraftToProfile(draft));
}

export async function verifyEmployerGst(gstin: string): Promise<GstVerifyStatus> {
  const res = await apiFetch<{ status: GstVerifyStatus }>(apiV1Path('/verify/gst'), {
    method: 'POST',
    body: JSON.stringify({ gstin }),
  });
  return res.status;
}

export async function fetchEmployerDashboard(): Promise<EmployerDashboard> {
  const jobs = await getMyJobs().catch(() => []);
  const activeJobs = jobs.filter((j) => (j as any).status !== 'archived').length;
  const tier: SubscriptionTier = 'free';
  return {
    activeJobs,
    applicantsThisWeek: 0,
    hiresThisMonth: 0,
    tier,
    applicationsPerDay: [0, 0, 0, 0, 0, 0, 0],
  };
}

export async function fetchEmployerApplicants(
  filters: ApplicantFilters
): Promise<EmployerApplicant[]> {
  const jobId = filters.jobId;
  if (!jobId || jobId === 'all') return [];

  const list = await apiFetch<Array<Record<string, any>>>(
    apiV1Path(`/jobs/${jobId}/applications`),
    { method: 'GET' }
  );

  const mapped = (Array.isArray(list) ? list : []).map((a) => {
    const id = String(a.id ?? a._id ?? '');
    const status = String(a.status ?? 'applied') as EmployerApplicant['status'];
    return {
      id,
      jobId,
      jobTitle: String(a.job_title ?? a.jobTitle ?? ''),
      name: String(a.name ?? a.candidate_name ?? 'Applicant'),
      photoUri: (typeof a.photo_url === 'string' ? a.photo_url : undefined) as
        | string
        | undefined,
      skills: Array.isArray(a.skills) ? a.skills.map(String) : [],
      appliedAt: String(a.applied_at ?? a.created_at ?? new Date().toISOString()),
      status,
      coverMessage: typeof a.cover_message === 'string' ? a.cover_message : undefined,
      rating: Number(a.rating ?? 0),
      notes: typeof a.notes === 'string' ? a.notes : '',
      interviewAt: typeof a.interview_at === 'string' ? a.interview_at : undefined,
      email: typeof a.email === 'string' ? a.email : undefined,
      phone: typeof a.phone === 'string' ? a.phone : undefined,
      experience: typeof a.experience === 'string' ? a.experience : undefined,
      education: typeof a.education === 'string' ? a.education : undefined,
    } satisfies EmployerApplicant;
  });

  if (filters.status && filters.status !== 'all') {
    return mapped.filter((a) => a.status === filters.status);
  }
  return mapped;
}

export async function fetchEmployerApplicant(id: string) {
  return apiFetch<EmployerApplicant>(apiV1Path(`/applications/${id}`), { method: 'GET' });
}

export async function patchEmployerApplicant(
  id: string,
  body: Partial<Pick<EmployerApplicant, 'status' | 'notes' | 'interviewAt'>>
) {
  if (body.status) {
    await apiFetch(apiV1Path(`/applications/${id}/status`), {
      method: 'PATCH',
      body: JSON.stringify({ status: body.status }),
    });
  }
  // Notes/interview scheduling are not specified in the PDF; best-effort no-op.
  return fetchEmployerApplicant(id);
}

export async function fetchWalkInDrives() {
  // Backend spec currently marks drives as 501; keep UI usable by returning empty list.
  const res = await apiFetch<{ items: any[] }>(apiV1Path('/drives/my'), { method: 'GET' });
  return res.items ?? [];
}

export async function createWalkInDrive(body: {
  jobId: string;
  jobTitle: string;
  driveDate: string;
  timeSlots: string[];
  address: string;
  capacityPerSlot: number;
  instructions: string;
  slotsTotal: number;
}) {
  return apiFetch<{ qrCode?: string; qr_code?: string }>(apiV1Path('/drives/create'), {
    method: 'POST',
    body: JSON.stringify({
      job_id: body.jobId,
      drive_date: body.driveDate,
      time_slots: body.timeSlots,
      address: body.address,
      capacity_per_slot: body.capacityPerSlot,
      instructions: body.instructions,
    }),
  });
}

export { getBillingHistory, getSubscriptionTier, upgradeSubscription } from '@/features/job-portal/employerPortal';
