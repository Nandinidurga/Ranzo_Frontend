import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing, Typography } from '@/core/theme';
import { RanzoButton } from '@/core/widgets/RanzoButton';
import { RanzoTextField } from '@/core/widgets/RanzoTextField';
import { syncProfileMeFromApi } from '@/core/api/profileSync';
import {
  upsertCustomerProfile,
  upsertEmployerProfile,
} from '@/core/api/profile';
import { employerFormDefaults } from '@/core/utils/profileFormDefaults';
import { useAuthStore } from '@/data/store';
import { t } from '@/core/i18n';

type Props = {
  mode?: 'add' | 'edit';
  initialProfile?: Record<string, unknown> | null;
  onSaved?: () => void;
  onCancel?: () => void;
};

export function EmployerProfileForm({
  mode = 'add',
  initialProfile,
  onSaved,
  onCancel,
}: Props) {
  const primaryRole = useAuthStore((s) => s.primaryRole);
  const existing = useAuthStore((s) => s.employer);
  const phone = existing?.phone ?? '';

  const isCustomer = primaryRole === 'customer';

  const defaults = useMemo(
    () =>
      employerFormDefaults(initialProfile, { name: existing?.name }),
    [initialProfile, existing?.name]
  );

  const [fullName, setFullName] = useState(defaults.fullName);
  const [email, setEmail] = useState(defaults.email);
  const [companyName, setCompanyName] = useState(defaults.companyName);
  const [industry, setIndustry] = useState(defaults.industry);
  const [city, setCity] = useState(defaults.city);
  const [address, setAddress] = useState(defaults.address);
  const [contactName, setContactName] = useState(defaults.contactName);
  const [contactPhone, setContactPhone] = useState(defaults.contactPhone);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setFullName(defaults.fullName);
    setEmail(defaults.email);
    setCompanyName(defaults.companyName);
    setIndustry(defaults.industry);
    setCity(defaults.city);
    setAddress(defaults.address);
    setContactName(defaults.contactName);
    setContactPhone(defaults.contactPhone);
  }, [defaults]);

  const isValid = isCustomer
    ? fullName.trim().length >= 2
    : companyName.trim().length >= 2 && city.trim().length >= 2;

  const submit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (isCustomer) {
        await upsertCustomerProfile({
          full_name: fullName.trim(),
          ...(email.trim() ? { email: email.trim() } : {}),
        });
      } else {
        await upsertEmployerProfile({
          company_name: companyName.trim(),
          city: city.trim(),
          ...(industry.trim() ? { industry: industry.trim() } : {}),
          ...(address.trim() ? { address: address.trim() } : {}),
          ...(contactName.trim()
            ? { hiring_contact_name: contactName.trim() }
            : {}),
          ...(contactPhone.trim()
            ? { hiring_contact_phone: contactPhone.trim() }
            : {}),
        });
      }

      await syncProfileMeFromApi();
      await useAuthStore.getState().setEmployerProfile({
        id: existing?.id ?? useAuthStore.getState().userId ?? 'emp_local',
        role: 'employer',
        phone,
        name: isCustomer ? fullName.trim() : companyName.trim(),
        isDetailsFilled: true,
      });
      onSaved?.();
    } catch (e: any) {
      setSubmitError(e?.message ?? t('profile.saveFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const title =
    mode === 'edit' ? t('profile.editFormTitle') : t('profile.formTitle');
  const saveLabel =
    mode === 'edit' ? t('profile.updateProfile') : t('profile.saveProfile');

  return (
    <View style={styles.wrap}>
      <Text style={Typography.h2}>{title}</Text>
      <Text style={[Typography.body, styles.caption]}>
        {isCustomer ? t('profile.customerFormHint') : t('profile.employerFormHint')}
      </Text>

      {isCustomer ? (
        <>
          <RanzoTextField
            value={fullName}
            onChangeText={setFullName}
            placeholder={t('auth.namePlaceholder')}
            autoCapitalize="words"
          />
          <RanzoTextField
            value={email}
            onChangeText={setEmail}
            placeholder="Email (optional)"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </>
      ) : (
        <>
          <RanzoTextField
            value={companyName}
            onChangeText={setCompanyName}
            placeholder={t('profile.companyName')}
            autoCapitalize="words"
          />
          <RanzoTextField
            value={industry}
            onChangeText={setIndustry}
            placeholder={t('profile.industry')}
            autoCapitalize="words"
          />
          <RanzoTextField
            value={city}
            onChangeText={setCity}
            placeholder={t('profile.city')}
            autoCapitalize="words"
          />
          <RanzoTextField
            value={address}
            onChangeText={setAddress}
            placeholder={t('profile.address')}
            autoCapitalize="words"
          />
          <RanzoTextField
            value={contactName}
            onChangeText={setContactName}
            placeholder={t('profile.hiringContactName')}
            autoCapitalize="words"
          />
          <RanzoTextField
            value={contactPhone}
            onChangeText={setContactPhone}
            placeholder={t('profile.hiringContactPhone')}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </>
      )}

      {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

      <RanzoButton
        label={saveLabel}
        onPress={submit}
        disabled={!isValid}
        loading={submitting}
      />
      {onCancel ? (
        <RanzoButton
          label={t('profile.cancelEdit')}
          variant="ghost"
          onPress={onCancel}
          disabled={submitting}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.md },
  caption: { color: Colors.inkMuted },
  submitError: {
    color: Colors.danger,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
