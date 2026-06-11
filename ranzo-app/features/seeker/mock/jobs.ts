import { getSeekerJobList, mockJobDetail } from '@/features/job-portal/jobCatalog';
import type { ApplicationItem } from '@/features/seeker/types';

export { MOCK_JOBS } from '@/features/seeker/mock/seedJobs';
export { getSeekerJobList, mockJobDetail };

export const MOCK_APPLICATIONS: ApplicationItem[] = [
  {
    id: 'app_1',
    jobId: 'job_1',
    jobTitle: 'Field Sales Executive',
    employerName: 'Bright Retail Pvt Ltd',
    status: 'shortlisted',
    appliedAt: '2026-05-18T10:00:00Z',
    updatedAt: '2026-05-20T14:00:00Z',
    coverMessage: 'Interested in the sales role with 2 years experience.',
    timeline: [
      { status: 'applied', at: '2026-05-18T10:00:00Z', label: 'Applied' },
      { status: 'viewed', at: '2026-05-19T09:00:00Z', label: 'Viewed' },
      { status: 'shortlisted', at: '2026-05-20T14:00:00Z', label: 'Shortlisted' },
    ],
  },
];
