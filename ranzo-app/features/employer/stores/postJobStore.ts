import { create } from 'zustand';

export type PostJobDraft = {
  title: string;
  sector: string;
  subSector: string;
  employmentType: string;
  vacancies: string;
  description: string;
  skills: string[];
  experienceMin: number;
  experienceMax: number;
  education: string;
  address: string;
  salaryMin: string;
  salaryMax: string;
  salaryPeriod: string;
  workingHours: string;
  benefits: string[];
  boost: boolean;
  visibility: 'live' | 'draft';
};

type State = {
  step: 1 | 2 | 3 | 4;
  editingJobId: string | null;
  draft: PostJobDraft;
  patch: (p: Partial<PostJobDraft>) => void;
  setStep: (s: 1 | 2 | 3 | 4) => void;
  loadForEdit: (jobId: string, draft: PostJobDraft) => void;
  reset: () => void;
};

const initial = (): PostJobDraft => ({
  title: '',
  sector: '',
  subSector: '',
  employmentType: 'Full-time',
  vacancies: '1',
  description: '',
  skills: [],
  experienceMin: 0,
  experienceMax: 3,
  education: 'Any',
  address: '',
  salaryMin: '',
  salaryMax: '',
  salaryPeriod: 'month',
  workingHours: '9 AM – 6 PM',
  benefits: [],
  boost: false,
  visibility: 'live',
});

export const usePostJobStore = create<State>((set) => ({
  step: 1,
  editingJobId: null,
  draft: initial(),
  patch: (p) => set((s) => ({ draft: { ...s.draft, ...p } })),
  setStep: (step) => set({ step }),
  loadForEdit: (jobId, draft) => set({ editingJobId: jobId, draft, step: 1 }),
  reset: () => set({ step: 1, editingJobId: null, draft: initial() }),
}));
