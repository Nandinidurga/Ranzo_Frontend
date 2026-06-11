import { create } from 'zustand';
import type { SeekerWizardDraft } from '@/features/seeker/types';

const initialDraft = (): SeekerWizardDraft => ({
  photoUri: null,
  fullName: '',
  dateOfBirth: null,
  gender: null,
  email: '',
  city: '',
  skills: [],
  experiences: [],
  education: [],
  skippedExperience: false,
  languages: [{ language: 'English', proficiency: 'fluent' }],
  salaryMin: '',
  salaryMax: '',
  salaryPeriod: 'month',
  availability: 'immediate',
  openToRelocate: false,
});

type WizardState = {
  draft: SeekerWizardDraft;
  reset: () => void;
  patch: (patch: Partial<SeekerWizardDraft>) => void;
};

export const useSeekerWizardStore = create<WizardState>((set) => ({
  draft: initialDraft(),
  reset: () => set({ draft: initialDraft() }),
  patch: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
}));
