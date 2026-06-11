import type { Router } from 'expo-router';
import { useTechnicianStore } from '@/features/technician/stores/technicianStore';

export function technicianNeedsPayoutSetup(): boolean {
  return !useTechnicianStore.getState().payoutComplete;
}

export async function navigateTechnicianOnboarding(router: Router): Promise<boolean> {
  if (!useTechnicianStore.getState().profileComplete) {
    router.replace('/onboarding/technician/step-1' as never);
    return true;
  }
  if (technicianNeedsPayoutSetup()) {
    router.replace('/onboarding/technician/payouts' as never);
    return true;
  }
  return false;
}
