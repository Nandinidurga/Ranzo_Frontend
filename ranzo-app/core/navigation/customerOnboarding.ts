import type { Router } from 'expo-router';
import { useCustomerStore } from '@/features/customer/stores/customerStore';

export function customerNeedsProfile(): boolean {
  return !useCustomerStore.getState().profileComplete;
}

export function customerNeedsAddresses(): boolean {
  const s = useCustomerStore.getState();
  return s.profileComplete && !s.addressesComplete;
}

export async function navigateCustomerOnboarding(router: Router): Promise<boolean> {
  if (customerNeedsProfile()) {
    router.replace('/onboarding/customer/profile' as never);
    return true;
  }
  if (customerNeedsAddresses()) {
    router.replace('/onboarding/customer/addresses' as never);
    return true;
  }
  return false;
}
