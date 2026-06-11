import React from 'react';
import { useRouter } from 'expo-router';
import { goBackToRoleSelectMain } from '@/core/navigation/roleFlow';
import { WORK_ROLE_OPTIONS } from '@/core/onboarding/roleModes';
import { RoleSubRoleScreen } from '@/features/onboarding/components/RoleSubRoleScreen';
import { t } from '@/core/i18n';

/** M-005 WORK path: Technician or Customer */
export default function SelectWorkRoleScreen() {
  const router = useRouter();
  return (
    <RoleSubRoleScreen
      subtitle={t('roleSelect.pickWorkPath')}
      options={WORK_ROLE_OPTIONS()}
      onBack={() => goBackToRoleSelectMain(router)}
    />
  );
}
