import React from 'react';
import { useRouter } from 'expo-router';
import { goBackToRoleSelectMain } from '@/core/navigation/roleFlow';
import { JOB_ROLE_OPTIONS } from '@/core/onboarding/roleModes';
import { RoleSubRoleScreen } from '@/features/onboarding/components/RoleSubRoleScreen';
import { t } from '@/core/i18n';

/** M-005 JOB path: Seeker or Employer */
export default function SelectJobRoleScreen() {
  const router = useRouter();
  return (
    <RoleSubRoleScreen
      subtitle={t('roleSelect.pickJobPath')}
      options={JOB_ROLE_OPTIONS()}
      onBack={() => goBackToRoleSelectMain(router)}
    />
  );
}
