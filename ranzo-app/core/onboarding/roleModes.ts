import type { RoleSubOption } from '@/features/onboarding/components/RoleSubPickerModal';
import { t } from '@/core/i18n';

export type MainMode = 'work' | 'job';

export const WORK_ROLE_OPTIONS = (): RoleSubOption[] => [
  {
    id: 'technician',
    title: t('roleSelect.provideServices'),
    subtitle: t('roleSelect.provideServicesSub'),
    icon: 'hard-hat',
  },
  {
    id: 'customer',
    title: t('roleSelect.bookServices'),
    subtitle: t('roleSelect.bookServicesSub'),
    icon: 'tools',
  },
];

export const JOB_ROLE_OPTIONS = (): RoleSubOption[] => [
  {
    id: 'seeker',
    title: t('roleSelect.findJob'),
    subtitle: t('roleSelect.findJobSub'),
    icon: 'briefcase',
  },
  {
    id: 'employer',
    title: t('roleSelect.hireSomeone'),
    subtitle: t('roleSelect.hireSomeoneSub'),
    icon: 'handshake',
  },
];
