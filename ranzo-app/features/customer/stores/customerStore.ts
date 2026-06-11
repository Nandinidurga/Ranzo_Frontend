import { create } from 'zustand';
import type { CustomerAddress } from '@/features/customer/types';

export type CustomerProfileDraft = {
  photoUri: string | null;
  fullName: string;
  email: string;
  city: string;
};

type CustomerState = {
  profile: CustomerProfileDraft;
  addresses: CustomerAddress[];
  selectedAddressId: string | null;
  profileComplete: boolean;
  addressesComplete: boolean;
  patchProfile: (patch: Partial<CustomerProfileDraft>) => void;
  setAddresses: (addresses: CustomerAddress[]) => void;
  addAddress: (address: CustomerAddress) => void;
  updateAddress: (id: string, patch: Partial<CustomerAddress>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  setSelectedAddressId: (id: string | null) => void;
  markProfileComplete: () => void;
  markAddressesComplete: () => void;
};

const defaultProfile = (): CustomerProfileDraft => ({
  photoUri: null,
  fullName: '',
  email: '',
  city: '',
});

function newId() {
  return `addr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  profile: defaultProfile(),
  addresses: [],
  selectedAddressId: null,
  profileComplete: false,
  addressesComplete: false,

  patchProfile: (patch) =>
    set((s) => ({ profile: { ...s.profile, ...patch } })),

  setAddresses: (addresses) => {
    const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0];
    set({
      addresses,
      selectedAddressId: defaultAddr?.id ?? null,
    });
  },

  addAddress: (address) => {
    const list = get().addresses;
    const isFirst = list.length === 0;
    const entry = { ...address, isDefault: isFirst || address.isDefault };
    const next = isFirst
      ? [entry]
      : entry.isDefault
        ? list.map((a) => ({ ...a, isDefault: false })).concat(entry)
        : [...list, entry];
    set({
      addresses: next,
      selectedAddressId: entry.isDefault ? entry.id : get().selectedAddressId ?? entry.id,
    });
  },

  updateAddress: (id, patch) => {
    set((s) => ({
      addresses: s.addresses.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
  },

  removeAddress: (id) => {
    const next = get().addresses.filter((a) => a.id !== id);
    const def = next.find((a) => a.isDefault) ?? next[0];
    set({
      addresses: next,
      selectedAddressId: def?.id ?? null,
    });
  },

  setDefaultAddress: (id) => {
    set((s) => ({
      addresses: s.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
      selectedAddressId: id,
    }));
  },

  setSelectedAddressId: (id) => set({ selectedAddressId: id }),

  markProfileComplete: () => set({ profileComplete: true }),
  markAddressesComplete: () => set({ addressesComplete: true }),
}));

export function createEmptyAddress(): CustomerAddress {
  return {
    id: newId(),
    label: 'Home',
    line1: '',
    city: '',
    pincode: '',
    isDefault: false,
  };
}
