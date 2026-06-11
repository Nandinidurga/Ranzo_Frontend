import type { Router } from 'expo-router';

import { syncProfileMeFromApi } from '@/core/api/profileSync';

import { navigateToPrimaryRoleHome } from '@/core/api/session';

import {

  markRoleSelectComplete,

} from '@/core/onboarding/roleSelectStorage';

import { profileWizardPath } from '@/core/onboarding/constants';

import { navigateCustomerOnboarding } from '@/core/navigation/customerOnboarding';

import { navigateEmployerOnboarding } from '@/core/navigation/employerOnboarding';

import { navigateTechnicianOnboarding } from '@/core/navigation/technicianOnboarding';

import { useAuthStore } from '@/data/store';

import type { PlatformRole } from '@/data/models';



/** After login / OTP / splash with session. */
export async function navigatePostAuth(router: Router) {
  const { roleSelectionPending, primaryRole } = useAuthStore.getState();

  // M-005: role must be assigned before role-scoped profile APIs.
  if (roleSelectionPending || !primaryRole) {
    router.replace('/onboarding/select-role' as never);
    return;
  }

  await syncProfileMeFromApi().catch(() => {});

  const { isDetailsFilled } = useAuthStore.getState();

  if (primaryRole === 'customer') {
    if (await navigateCustomerOnboarding(router)) return;
    navigateToPrimaryRoleHome(router);
    return;
  }

  if (primaryRole === 'employer') {
    if (await navigateEmployerOnboarding(router)) return;
    navigateToPrimaryRoleHome(router);
    return;
  }

  if (primaryRole === 'technician') {
    if (await navigateTechnicianOnboarding(router)) return;
    navigateToPrimaryRoleHome(router);
    return;
  }

  if (!isDetailsFilled && primaryRole) {
    router.replace(profileWizardPath(primaryRole) as never);
    return;
  }

  navigateToPrimaryRoleHome(router);
}



export async function navigateAfterRoleChosen(

  router: Router,

  platformRole: PlatformRole

) {

  await markRoleSelectComplete();

  if (platformRole === 'customer') {

    if (await navigateCustomerOnboarding(router)) return;

    navigateToPrimaryRoleHome(router);

    return;

  }

  if (platformRole === 'employer') {

    if (await navigateEmployerOnboarding(router)) return;

    navigateToPrimaryRoleHome(router);

    return;

  }

  if (platformRole === 'technician') {

    if (await navigateTechnicianOnboarding(router)) return;

    navigateToPrimaryRoleHome(router);

    return;

  }

  const { isDetailsFilled } = useAuthStore.getState();

  if (!isDetailsFilled) {

    router.replace(profileWizardPath(platformRole) as never);

    return;

  }

  navigateToPrimaryRoleHome(router);

}

