import { create } from 'zustand';

export type GstVerifyStatus = 'none' | 'pending' | 'verified';

export type EmployerWizardDraft = {
  companyName: string;
  logoUri: string | null;
  industry: string;
  subIndustry: string;
  companySize: string;
  yearEstablished: string;
  gstin: string;
  pan: string;
  msme: string;
  gstStatus: GstVerifyStatus;
  address: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
};

type State = {
  step: 1 | 2 | 3;
  completed: boolean;
  draft: EmployerWizardDraft;
  patch: (p: Partial<EmployerWizardDraft>) => void;
  setStep: (s: 1 | 2 | 3) => void;
  markComplete: () => void;
};

const initial = (): EmployerWizardDraft => ({
  companyName: '',
  logoUri: null,
  industry: '',
  subIndustry: '',
  companySize: '',
  yearEstablished: '',
  gstin: '',
  pan: '',
  msme: '',
  gstStatus: 'none',
  address: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
});

export const useEmployerWizardStore = create<State>((set) => ({
  step: 1,
  completed: false,
  draft: initial(),
  patch: (p) => set((s) => ({ draft: { ...s.draft, ...p } })),
  setStep: (step) => set({ step }),
  markComplete: () => set({ completed: true }),
}));
