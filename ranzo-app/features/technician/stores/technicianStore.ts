import { create } from 'zustand';

export type PayoutDetails = {
  accountNumber: string;
  ifsc: string;
  holderName: string;
  verified: boolean;
};

type TechnicianState = {
  online: boolean;
  assignedJobId: string | null;
  profileComplete: boolean;
  payoutComplete: boolean;
  payout: PayoutDetails;
  todayEarnings: number;
  jobsToday: number;
  weekEarnings: number;
  walletBalance: number;
  setOnline: (v: boolean) => void;
  patchPayout: (p: Partial<PayoutDetails>) => void;
  markPayoutComplete: () => void;
  markProfileComplete: () => void;
};

export const useTechnicianStore = create<TechnicianState>((set) => ({
  online: false,
  assignedJobId: null,
  profileComplete: false,
  payoutComplete: false,
  payout: { accountNumber: '', ifsc: '', holderName: '', verified: false },
  todayEarnings: 1250,
  jobsToday: 3,
  weekEarnings: 8420,
  walletBalance: 15420,
  setOnline: (online) => set({ online }),
  patchPayout: (p) => set((s) => ({ payout: { ...s.payout, ...p } })),
  markPayoutComplete: () =>
    set((s) => ({ payoutComplete: true, payout: { ...s.payout, verified: true } })),
  markProfileComplete: () => set({ profileComplete: true }),
}));
