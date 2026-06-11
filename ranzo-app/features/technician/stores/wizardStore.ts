import { create } from 'zustand';

export type TechnicianServiceRate = {
  subcategoryId: string;
  name: string;
  hourlyRate: string;
  experienceYears: string;
};

export type TechnicianWizardDraft = {
  fullName: string;
  photoUri: string | null;
  dateOfBirth: string | null;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  location: string;
  aadhaar: string;
  aadhaarVerified: boolean;
  services: TechnicianServiceRate[];
  workingHoursStart: string;
  workingHoursEnd: string;
  workingDays: string[];
  serviceRadiusKm: number;
};

type State = {
  step: 1 | 2 | 3;
  draft: TechnicianWizardDraft;
  patch: (p: Partial<TechnicianWizardDraft>) => void;
  setStep: (s: 1 | 2 | 3) => void;
  markProfileComplete: () => void;
};

const initial = (): TechnicianWizardDraft => ({
  fullName: '',
  photoUri: null,
  dateOfBirth: null,
  gender: null,
  location: '',
  aadhaar: '',
  aadhaarVerified: false,
  services: [],
  workingHoursStart: '9 AM',
  workingHoursEnd: '7 PM',
  workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  serviceRadiusKm: 10,
});

export const useTechnicianWizardStore = create<State>((set) => ({
  step: 1,
  draft: initial(),
  patch: (p) => set((s) => ({ draft: { ...s.draft, ...p } })),
  setStep: (step) => set({ step }),
  markProfileComplete: () => set({ draft: initial(), step: 1 }),
}));
