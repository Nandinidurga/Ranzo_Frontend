export type GenderOption = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export type SkillLevel = 'beginner' | 'intermediate' | 'expert';

export type LanguageProficiency = 'basic' | 'intermediate' | 'fluent';

export type SalaryPeriod = 'month' | 'day' | 'hour';

export type AvailabilityOption =
  | 'immediate'
  | 'within_15_days'
  | 'within_30_days'
  | '60_plus_days';

export type SeekerSkill = {
  name: string;
  level: SkillLevel;
};

export type WorkExperience = {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  description?: string;
};

export type Education = {
  id: string;
  degree: string;
  institution: string;
  year: string;
  score?: string;
};

export type LanguageEntry = {
  language: string;
  proficiency: LanguageProficiency;
};

export type SeekerWizardDraft = {
  photoUri: string | null;
  fullName: string;
  dateOfBirth: string | null;
  gender: GenderOption | null;
  email: string;
  city: string;
  cityPlaceId?: string;
  skills: SeekerSkill[];
  experiences: WorkExperience[];
  education: Education[];
  skippedExperience: boolean;
  languages: LanguageEntry[];
  salaryMin: string;
  salaryMax: string;
  salaryPeriod: SalaryPeriod;
  availability: AvailabilityOption;
  openToRelocate: boolean;
};

export type JobListItem = {
  id: string;
  title: string;
  /** Set when created from an employer job post (visible on seeker feed). */
  postedByEmployer?: boolean;
  employerJobId?: string;
  employerName: string;
  employerLogo?: string;
  verified?: boolean;
  location: string;
  distanceKm?: number;
  salaryMin?: number;
  salaryMax?: number;
  salaryPeriod?: string;
  freshness?: string;
  sector?: string;
  saved?: boolean;
  applied?: boolean;
};

export type JobDetail = JobListItem & {
  description: string;
  employmentType?: string;
  workingHours?: string;
  vacancies?: number;
  requirements: {
    skills: { name: string; mandatory?: boolean }[];
    experience?: string;
    education?: string;
    languages?: string[];
  };
  employer: {
    companyName: string;
    industry?: string;
    address?: string;
    gstVerified?: boolean;
    jobsPosted?: number;
  };
  similarJobs: JobListItem[];
};

export type ApplicationStatus =
  | 'applied'
  | 'viewed'
  | 'shortlisted'
  | 'interview'
  | 'hired'
  | 'rejected'
  | 'withdrawn';

export type ApplicationItem = {
  id: string;
  jobId: string;
  jobTitle: string;
  employerName: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  coverMessage?: string;
  employerNotes?: string;
  timeline: { status: ApplicationStatus; at: string; label: string }[];
};
