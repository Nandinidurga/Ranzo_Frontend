import type { PlatformRole } from '@/data/models';
import type { ComponentProps } from 'react';
import type { MaterialCommunityIcons } from '@expo/vector-icons';

export const ROLE_SELECT_TAGLINE =
  'Hire Talent. Find Jobs. Get Work. Request Services.';

export type RoleSelectCard = {
  id: PlatformRole;
  titleKey: string;
  subtitleKey: string;
  icon: ComponentProps<typeof MaterialCommunityIcons>['name'];
};

export const ROLE_SELECT_CARDS: RoleSelectCard[] = [
  {
    id: 'seeker',
    titleKey: 'roleSelect.findJob',
    subtitleKey: 'roleSelect.findJobSub',
    icon: 'briefcase',
  },
  {
    id: 'employer',
    titleKey: 'roleSelect.hireSomeone',
    subtitleKey: 'roleSelect.hireSomeoneSub',
    icon: 'handshake',
  },
  {
    id: 'customer',
    titleKey: 'roleSelect.bookServices',
    subtitleKey: 'roleSelect.bookServicesSub',
    icon: 'tools',
  },
  {
    id: 'technician',
    titleKey: 'roleSelect.provideServices',
    subtitleKey: 'roleSelect.provideServicesSub',
    icon: 'hard-hat',
  },
];

export function profileWizardPath(role: PlatformRole): string {
  if (role === 'seeker') return '/onboarding/seeker/step-1';
  if (role === 'customer') return '/onboarding/customer/profile';
  if (role === 'employer') return '/onboarding/employer/step-1';
  if (role === 'technician') return '/onboarding/worker';
  return '/onboarding/worker';
}

