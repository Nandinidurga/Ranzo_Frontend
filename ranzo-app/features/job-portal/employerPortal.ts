import type { PostJobDraft } from '@/features/employer/stores/postJobStore';
import { MOCK_JOBS } from '@/features/seeker/mock/seedJobs';
import type { ApplicationStatus, JobDetail, JobListItem } from '@/features/seeker/types';

export type EmployerJobStatus = 'Active' | 'Paused' | 'Filled' | 'Expired' | 'Drafts';
export type GstVerifyStatus = 'none' | 'pending' | 'verified';
export type SubscriptionTier = 'free' | 'standard' | 'premium';

export type EmployerJobRecord = {
  id: string;
  listItem: JobListItem;
  detail: JobDetail;
  status: EmployerJobStatus;
  publishedAt: string;
  draft: PostJobDraft;
  applicantCount: number;
  boosted: boolean;
};

export type EmployerApplicant = {
  id: string;
  jobId: string;
  jobTitle: string;
  name: string;
  photoUri?: string;
  skills: string[];
  appliedAt: string;
  status: ApplicationStatus;
  coverMessage?: string;
  rating: number;
  notes: string;
  interviewAt?: string;
  email?: string;
  phone?: string;
  experience?: string;
  education?: string;
};

export type WalkInDrive = {
  id: string;
  jobId: string;
  jobTitle: string;
  driveDate: string;
  timeSlots: string[];
  address: string;
  capacityPerSlot: number;
  instructions: string;
  status: 'Scheduled' | 'Live' | 'Completed';
  slotsBooked: number;
  slotsTotal: number;
  qrCode: string;
  attendees: WalkInAttendee[];
};

export type WalkInAttendee = {
  id: string;
  name: string;
  checkedInAt: string;
  outcome?: 'Hired' | 'Shortlisted' | 'Rejected';
};

export type BillingEntry = {
  id: string;
  date: string;
  description: string;
  amount: string;
};

export type EmployerDashboard = {
  activeJobs: number;
  applicantsThisWeek: number;
  hiresThisMonth: number;
  tier: SubscriptionTier;
  applicationsPerDay: number[];
};

const jobs = new Map<string, EmployerJobRecord>();
const applicants: EmployerApplicant[] = [];
const walkIns: WalkInDrive[] = [];
let subscriptionTier: SubscriptionTier = 'free';
const billingHistory: BillingEntry[] = [];
const applicationDailyCounts: number[] = [4, 6, 3, 8, 5, 9, 7];

function daysActive(publishedAt: string): number {
  const ms = Date.now() - new Date(publishedAt).getTime();
  return Math.max(1, Math.floor(ms / (24 * 60 * 60 * 1000)));
}

function syncSeekerFeedList(): JobListItem[] {
  return [...jobs.values()]
    .filter((j) => j.status === 'Active')
    .map((j) => j.listItem);
}

let seekerFeedCache: JobListItem[] = [];

export function getPublishedEmployerJobs(): JobListItem[] {
  return syncSeekerFeedList();
}

export function getEmployerJobRecords(status?: EmployerJobStatus): EmployerJobRecord[] {
  const all = [...jobs.values()].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  if (!status) return all;
  return all.filter((j) => j.status === status);
}

export function getEmployerJob(id: string): EmployerJobRecord | undefined {
  return jobs.get(id);
}

function buildDetail(item: JobListItem, draft: PostJobDraft): JobDetail {
  const skills =
    draft.skills.length > 0
      ? draft.skills.map((name) => ({ name, mandatory: true }))
      : [{ name: 'Communication', mandatory: true }];

  return {
    ...item,
    description: draft.description.trim() || 'Role details shared during interview.',
    employmentType: draft.employmentType,
    workingHours: draft.workingHours,
    vacancies: Number(draft.vacancies) || 1,
    requirements: {
      skills,
      experience: `${draft.experienceMin}–${draft.experienceMax} years`,
      education: draft.education,
      languages: ['English', 'Hindi'],
    },
    employer: {
      companyName: item.employerName,
      industry: item.sector,
      address: item.location,
      gstVerified: true,
      jobsPosted: jobs.size,
    },
    similarJobs: syncSeekerFeedList().filter((j) => j.id !== item.id).slice(0, 3),
  };
}

function formatLocation(draft: PostJobDraft, employerCity?: string): string {
  const addr = draft.address.trim();
  const city = employerCity?.trim() || 'Hyderabad';
  if (!addr) return city;
  if (addr.toLowerCase().includes(city.toLowerCase())) return addr;
  return `${addr}, ${city}`;
}

export function publishEmployerJob(
  draft: PostJobDraft,
  employerName: string,
  employerCity?: string,
  existingId?: string
): EmployerJobRecord {
  const id = existingId ?? `job_pub_${Date.now()}`;
  const status: EmployerJobStatus =
    draft.visibility === 'live' ? 'Active' : 'Drafts';

  const listItem: JobListItem = {
    id,
    title: draft.title.trim() || 'Untitled job',
    postedByEmployer: status === 'Active',
    employerJobId: id,
    employerName: employerName.trim() || 'Employer',
    location: formatLocation(draft, employerCity),
    salaryMin: draft.salaryMin ? Number(draft.salaryMin) : undefined,
    salaryMax: draft.salaryMax ? Number(draft.salaryMax) : undefined,
    salaryPeriod: draft.salaryPeriod,
    freshness: 'Just now',
    sector: draft.sector || undefined,
  };

  const existing = jobs.get(id);
  const record: EmployerJobRecord = {
    id,
    listItem,
    detail: buildDetail(listItem, draft),
    status,
    publishedAt: existing?.publishedAt ?? new Date().toISOString(),
    draft: { ...draft },
    applicantCount: existing?.applicantCount ?? 0,
    boosted: draft.boost,
  };

  jobs.set(id, record);
  seekerFeedCache = syncSeekerFeedList();
  return record;
}

export function updateEmployerJobStatus(id: string, status: EmployerJobStatus): void {
  const job = jobs.get(id);
  if (!job) return;
  job.status = status;
  job.listItem.postedByEmployer = status === 'Active';
  if (status !== 'Active') job.listItem.postedByEmployer = false;
  jobs.set(id, job);
  seekerFeedCache = syncSeekerFeedList();
}

export function deleteEmployerJob(id: string): void {
  jobs.delete(id);
  seekerFeedCache = syncSeekerFeedList();
}

export function getPastJobTitles(): string[] {
  return [...jobs.values()].map((j) => j.listItem.title).slice(0, 5);
}

export function getSeekerJobList(): JobListItem[] {
  return [...seekerFeedCache, ...MOCK_JOBS];
}

export function findSeekerJob(id: string): JobListItem | undefined {
  return getSeekerJobList().find((j) => j.id === id);
}

export function getSeekerJobDetail(id: string): JobDetail | null {
  const rec = jobs.get(id);
  if (rec) return rec.detail;
  const mock = MOCK_JOBS.find((j) => j.id === id);
  if (!mock) return null;
  return buildDetail(mock, {
    title: mock.title,
    sector: mock.sector ?? '',
    subSector: '',
    employmentType: 'Full-time',
    vacancies: '1',
    description: '',
    skills: [],
    experienceMin: 0,
    experienceMax: 3,
    education: 'Graduate',
    address: mock.location,
    salaryMin: mock.salaryMin?.toString() ?? '',
    salaryMax: mock.salaryMax?.toString() ?? '',
    salaryPeriod: mock.salaryPeriod ?? 'month',
    workingHours: '9 AM – 6 PM',
    benefits: [],
    boost: false,
    visibility: 'live',
  });
}

function jobMatchesCity(job: JobListItem, city: string): boolean {
  const c = city.trim().toLowerCase();
  if (!c) return true;
  return job.location.toLowerCase().includes(c);
}

export function buildSeekerFeed(city = 'Hyderabad') {
  const employerJobs = getPublishedEmployerJobs();
  const seedInCity = MOCK_JOBS.filter((j) => jobMatchesCity(j, city));
  const employerInCity = employerJobs.filter((j) => jobMatchesCity(j, city));

  const unique = (list: JobListItem[]) => {
    const seen = new Set<string>();
    return list.filter((j) => {
      if (seen.has(j.id)) return false;
      seen.add(j.id);
      return true;
    });
  };

  return {
    recommended: unique([...employerJobs, ...seedInCity, ...MOCK_JOBS]).slice(0, 4),
    latest: unique([
      ...employerInCity,
      ...employerJobs,
      ...seedInCity,
      ...MOCK_JOBS,
    ]).slice(0, 10),
    sectors: [
      ...new Set([
        ...([...employerJobs, ...seedInCity]
          .map((j) => j.sector)
          .filter(Boolean) as string[]),
        'Sales',
        'IT',
        'Marketing',
        'Healthcare',
        'BPO',
      ]),
    ].slice(0, 6),
    completeness_pct: 60,
  };
}

export function recordJobApplication(
  jobId: string,
  payload: {
    name: string;
    skills?: string[];
    coverMessage?: string;
    photoUri?: string;
  }
): EmployerApplicant | null {
  const job = jobs.get(jobId);
  if (!job) return null;

  const applicant: EmployerApplicant = {
    id: `app_${Date.now()}`,
    jobId,
    jobTitle: job.listItem.title,
    name: payload.name,
    photoUri: payload.photoUri,
    skills: payload.skills ?? ['Communication'],
    appliedAt: new Date().toISOString(),
    status: 'applied',
    coverMessage: payload.coverMessage,
    rating: 4 + Math.random(),
    notes: '',
    email: 'seeker@example.com',
    phone: '+91 98765 43210',
    experience: '1–3 years',
    education: 'Graduate',
  };

  applicants.unshift(applicant);
  job.applicantCount += 1;
  applicationDailyCounts[applicationDailyCounts.length - 1] += 1;
  jobs.set(jobId, job);
  return applicant;
}

export type ApplicantFilters = {
  jobId?: string;
  status?: ApplicationStatus | 'all';
  sort?: 'relevant' | 'newest' | 'rated';
};

export function getEmployerApplicants(filters: ApplicantFilters = {}): EmployerApplicant[] {
  let list = [...applicants];
  if (filters.jobId && filters.jobId !== 'all') {
    list = list.filter((a) => a.jobId === filters.jobId);
  }
  if (filters.status && filters.status !== 'all') {
    list = list.filter((a) => a.status === filters.status);
  }
  if (filters.sort === 'newest') {
    list.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  } else if (filters.sort === 'rated') {
    list.sort((a, b) => b.rating - a.rating);
  }
  return list;
}

export function getEmployerApplicant(id: string): EmployerApplicant | undefined {
  return applicants.find((a) => a.id === id);
}

export function updateApplicant(
  id: string,
  patch: Partial<Pick<EmployerApplicant, 'status' | 'notes' | 'interviewAt'>>
): EmployerApplicant | undefined {
  const idx = applicants.findIndex((a) => a.id === id);
  if (idx < 0) return undefined;
  applicants[idx] = { ...applicants[idx], ...patch };
  if (patch.status === 'hired') {
    const job = jobs.get(applicants[idx].jobId);
    if (job) updateEmployerJobStatus(job.id, 'Filled');
  }
  return applicants[idx];
}

export function getEmployerDashboard(): EmployerDashboard {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return {
    activeJobs: getEmployerJobRecords('Active').length,
    applicantsThisWeek: applicants.filter(
      (a) => new Date(a.appliedAt).getTime() >= weekAgo
    ).length,
    hiresThisMonth: applicants.filter(
      (a) => a.status === 'hired' && new Date(a.appliedAt).getTime() >= monthAgo
    ).length,
    tier: subscriptionTier,
    applicationsPerDay: [...applicationDailyCounts],
  };
}

export function jobToMyJobsRow(job: EmployerJobRecord) {
  return {
    id: job.id,
    title: job.listItem.title,
    applicants: job.applicantCount,
    days: daysActive(job.publishedAt),
    status: job.status,
  };
}

export async function verifyGstin(gstin: string): Promise<GstVerifyStatus> {
  await new Promise((r) => setTimeout(r, 900));
  const last = gstin.slice(-1);
  if (last === '0') return 'pending';
  return 'verified';
}

export function getWalkInDrives(): WalkInDrive[] {
  return [...walkIns];
}

export function getWalkInDrive(id: string): WalkInDrive | undefined {
  return walkIns.find((w) => w.id === id);
}

export function createWalkInDrive(input: Omit<WalkInDrive, 'id' | 'qrCode' | 'attendees' | 'slotsBooked' | 'status'>): WalkInDrive {
  const drive: WalkInDrive = {
    ...input,
    id: `walk_${Date.now()}`,
    qrCode: `RANZO-WALK-${Date.now()}`,
    attendees: [],
    slotsBooked: 0,
    status: input.driveDate === 'Today' ? 'Live' : 'Scheduled',
  };
  walkIns.unshift(drive);
  return drive;
}

export function checkInAttendee(driveId: string, name: string): void {
  const drive = walkIns.find((w) => w.id === driveId);
  if (!drive) return;
  drive.attendees.push({
    id: `att_${Date.now()}`,
    name,
    checkedInAt: new Date().toISOString(),
  });
  drive.slotsBooked = Math.min(drive.slotsTotal, drive.slotsBooked + 1);
}

export function logWalkInOutcome(
  driveId: string,
  attendeeId: string,
  outcome: WalkInAttendee['outcome']
): void {
  const drive = walkIns.find((w) => w.id === driveId);
  const att = drive?.attendees.find((a) => a.id === attendeeId);
  if (att && outcome) att.outcome = outcome;
}

export function getSubscriptionTier(): SubscriptionTier {
  return subscriptionTier;
}

export function upgradeSubscription(tier: SubscriptionTier): void {
  subscriptionTier = tier;
  if (tier !== 'free') {
    billingHistory.unshift({
      id: `bill_${Date.now()}`,
      date: new Date().toLocaleDateString('en-IN'),
      description: `${tier.charAt(0).toUpperCase() + tier.slice(1)} plan`,
      amount: tier === 'standard' ? '₹999' : '₹2999',
    });
  }
}

export function getBillingHistory(): BillingEntry[] {
  return [...billingHistory];
}

export function draftToCreateJobBody(
  draft: PostJobDraft,
  employerName: string
): Record<string, unknown> {
  return {
    title: draft.title.trim(),
    status: draft.visibility === 'live' ? 'active' : 'draft',
    sector: draft.sector || undefined,
    sub_sector: draft.subSector || undefined,
    employment_type: draft.employmentType,
    vacancies: Number(draft.vacancies) || 1,
    description: draft.description,
    skills: draft.skills,
    experience_min: draft.experienceMin,
    experience_max: draft.experienceMax,
    education: draft.education,
    address: draft.address,
    salary_min: draft.salaryMin ? Number(draft.salaryMin) : undefined,
    salary_max: draft.salaryMax ? Number(draft.salaryMax) : undefined,
    salary_period: draft.salaryPeriod,
    working_hours: draft.workingHours,
    benefits: draft.benefits,
    employer_name: employerName,
  };
}

// Seed demo applicants for active jobs if empty
export function seedDemoApplicantsIfNeeded(): void {
  if (applicants.length > 0) return;
  const names = [
    { name: 'Ravi Kumar', skills: ['Software Development', 'Communication', 'Git'] },
    { name: 'Anita Desai', skills: ['HR', 'Payroll', 'Excel'] },
  ];
  const active = getEmployerJobRecords('Active');
  if (active.length === 0) return;
  names.forEach((n, i) => {
    recordJobApplication(active[0]?.id ?? 'job_1', {
      ...n,
      coverMessage: 'Interested in this role.',
    });
    if (applicants[i]) applicants[i].status = i === 0 ? 'applied' : 'shortlisted';
  });
}
