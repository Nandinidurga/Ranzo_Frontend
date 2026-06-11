import { create } from 'zustand';
import type { BookingDraft, BookingTimeMode } from '@/features/customer/types';

const initial = (): BookingDraft => ({
  categoryId: '',
  categoryName: '',
  subcategoryId: '',
  subcategoryName: '',
  priceMin: 0,
  priceMax: 0,
  timeMode: 'now',
  scheduledAt: null,
  addressId: null,
  instructions: '',
});

type State = {
  draft: BookingDraft;
  init: (partial: Partial<BookingDraft>) => void;
  patch: (partial: Partial<BookingDraft>) => void;
  reset: () => void;
};

export const useBookingDraftStore = create<State>((set) => ({
  draft: initial(),
  init: (partial) => set({ draft: { ...initial(), ...partial } }),
  patch: (partial) => set((s) => ({ draft: { ...s.draft, ...partial } })),
  reset: () => set({ draft: initial() }),
}));

export function setBookingTimeMode(mode: BookingTimeMode) {
  useBookingDraftStore.getState().patch({ timeMode: mode });
}
