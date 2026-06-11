/** Re-exports employer portal job/feed APIs (seeker ↔ employer link). */
export {
  buildSeekerFeed,
  draftToCreateJobBody,
  deleteEmployerJob,
  findSeekerJob,
  getEmployerJob,
  getEmployerJobRecords,
  getPastJobTitles,
  getPublishedEmployerJobs,
  getSeekerJobDetail,
  getSeekerJobList,
  publishEmployerJob,
  updateEmployerJobStatus,
} from '@/features/job-portal/employerPortal';

export type {
  EmployerJobRecord,
  EmployerJobStatus,
} from '@/features/job-portal/employerPortal';

import { getSeekerJobDetail as getDetail } from '@/features/job-portal/employerPortal';
import { getSeekerJobList } from '@/features/job-portal/employerPortal';
import { MOCK_JOBS } from '@/features/seeker/mock/seedJobs';
import type { JobDetail, JobListItem } from '@/features/seeker/types';

export type SeekerFeedPayload = {
  recommended: JobListItem[];
  latest: JobListItem[];
  sectors: string[];
  completeness_pct: number;
};

export function mockJobDetail(id: string): JobDetail {
  const published = getDetail(id);
  if (published) return published;

  const base = MOCK_JOBS.find((j) => j.id === id) ?? MOCK_JOBS[0];
  return {
    ...base,
    id,
    description: 'We are looking for motivated candidates to join our growing team.',
    employmentType: 'Full-time',
    workingHours: '9 AM – 6 PM',
    vacancies: 3,
    requirements: {
      skills: [
        { name: 'Sales', mandatory: true },
        { name: 'Communication', mandatory: true },
      ],
      experience: '1–3 years',
      education: 'Graduate',
      languages: ['English', 'Hindi'],
    },
    employer: {
      companyName: base.employerName,
      industry: base.sector ?? 'Services',
      address: base.location,
      gstVerified: true,
      jobsPosted: 12,
    },
    similarJobs: getSeekerJobList().filter((j) => j.id !== id).slice(0, 3),
  };
}
