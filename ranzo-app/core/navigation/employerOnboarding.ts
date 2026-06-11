import type { Router } from 'expo-router';
import { useEmployerWizardStore } from '@/features/employer/stores/wizardStore';

export function employerNeedsOnboarding(): boolean {
  return !useEmployerWizardStore.getState().completed;
}

export async function navigateEmployerOnboarding(router: Router): Promise<boolean> {
  if (!employerNeedsOnboarding()) return false;
  const step = useEmployerWizardStore.getState().step;
  router.replace(`/onboarding/employer/step-${step}` as never);
  return true;
}
