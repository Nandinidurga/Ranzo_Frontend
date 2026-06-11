import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '@/core/theme';
import { RanzoButton } from '@/core/widgets/RanzoButton';
import { RanzoChip } from '@/core/widgets/RanzoChip';
import { RanzoTextField } from '@/core/widgets/RanzoTextField';
import { syncProfileMeFromApi } from '@/core/api/profileSync';
import { upsertWorkerProfile } from '@/core/api/profile';
import { getSelectedApp } from '@/core/config/app';
import { updateLocation } from '@/core/api/location';
import { goOnline } from '@/core/api/technician';
import { getCurrentLocation } from '@/core/utils/location';
import { workerFormDefaults } from '@/core/utils/profileFormDefaults';
import {
  ALL_SKILLS,
  EXPERIENCE_OPTIONS,
  Experience,
  Skill,
} from '@/data/models';
import { useAuthStore } from '@/data/store';
import { t } from '@/core/i18n';

type Props = {
  mode?: 'add' | 'edit';
  initialProfile?: Record<string, unknown> | null;
  onSaved?: () => void;
  onCancel?: () => void;
};

export function WorkerProfileForm({
  mode = 'add',
  initialProfile,
  onSaved,
  onCancel,
}: Props) {
  const existingWorker = useAuthStore((s) => s.worker);
  const employer = useAuthStore.getState().employer;
  const phone =
    useAuthStore.getState().worker?.phone ?? employer?.phone ?? '+91';

  const defaults = useMemo(
    () =>
      workerFormDefaults(initialProfile, {
        name: existingWorker?.name,
        skills: existingWorker?.skills,
        experience: existingWorker?.experience,
        lat: existingWorker?.lat,
        lng: existingWorker?.lng,
        address: existingWorker?.address,
      }),
    [initialProfile, existingWorker]
  );

  const [name, setName] = useState(defaults.name);
  const [skills, setSkills] = useState<Skill[]>(defaults.skills);
  const [experience, setExperience] = useState<Experience | null>(
    defaults.experience
  );
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
    area: string;
  } | null>(
    defaults.lat != null && defaults.lng != null && defaults.address
      ? {
          lat: defaults.lat,
          lng: defaults.lng,
          address: defaults.address,
          area: defaults.city || defaults.address.split(',')[0]?.trim() || '',
        }
      : null
  );
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setName(defaults.name);
    setSkills(defaults.skills);
    setExperience(defaults.experience);
    if (defaults.lat != null && defaults.lng != null && defaults.address) {
      setLocation({
        lat: defaults.lat,
        lng: defaults.lng,
        address: defaults.address,
        area: defaults.city || defaults.address.split(',')[0]?.trim() || '',
      });
    }
  }, [defaults]);

  const toggleSkill = (skill: Skill) => {
    setSkills((prev) => {
      if (prev.includes(skill)) return prev.filter((s) => s !== skill);
      if (prev.length >= 3) return prev;
      return [...prev, skill];
    });
  };

  const detectLocation = async () => {
    setLocationLoading(true);
    const result = await getCurrentLocation();
    setLocationLoading(false);
    if (result.ok) {
      setLocation(result.data);
      setLocationDenied(false);
    } else {
      setLocation(result.data);
      setLocationDenied(true);
    }
  };

  const finalAddress = locationDenied
    ? manualAddress
    : location?.address ?? '';

  const isValid =
    name.trim().length >= 2 &&
    skills.length > 0 &&
    !!experience &&
    finalAddress.length >= 3;

  const submit = async () => {
    if (!isValid || !location) {
      if (!location) {
        await detectLocation();
      }
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    const address = locationDenied ? manualAddress.trim() : location.address;

    try {
      await upsertWorkerProfile({
        name: name.trim(),
        skills,
        experience: experience!,
        lat: location.lat,
        lng: location.lng,
        address,
        city: location.area,
      });

      await syncProfileMeFromApi();

      await useAuthStore.getState().setWorkerProfile({
        id: existingWorker?.id ?? useAuthStore.getState().userId ?? 'wrk_local',
        role: 'worker',
        phone,
        name: name.trim(),
        skills,
        experience: experience!,
        lat: location.lat,
        lng: location.lng,
        address,
        online: existingWorker?.online ?? false,
        rating: existingWorker?.rating ?? 0,
        jobsCompleted: existingWorker?.jobsCompleted ?? 0,
        isDetailsFilled: true,
      });

      updateLocation({ lat: location.lat, lng: location.lng }).catch(() => {});
      if (getSelectedApp() === 'home-services') {
        goOnline().catch(() => {});
      }
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
      <Text style={[Typography.body, styles.caption]}>{t('profile.workerFormHint')}</Text>

      <Text style={styles.label}>{t('auth.namePlaceholder')}</Text>
      <RanzoTextField
        value={name}
        onChangeText={setName}
        placeholder="Ravi Kumar"
        autoCapitalize="words"
      />

      <View style={styles.section}>
        <Text style={Typography.h2}>{t('profile.skillsLabel')}</Text>
        <Text style={styles.helper}>{t('profile.skillsHint')}</Text>
        <View style={styles.chipGrid}>
          {ALL_SKILLS.map((skill) => (
            <RanzoChip
              key={skill}
              label={skill}
              selected={skills.includes(skill)}
              onPress={() => toggleSkill(skill)}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={Typography.h2}>{t('profile.experienceLabel')}</Text>
        <View style={styles.chipGrid}>
          {EXPERIENCE_OPTIONS.map((exp) => (
            <RanzoChip
              key={exp}
              label={exp}
              selected={experience === exp}
              onPress={() => setExperience(exp)}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={Typography.h2}>{t('profile.locationLabel')}</Text>
        <Pressable
          onPress={detectLocation}
          disabled={locationLoading}
          style={({ pressed }) => [
            styles.locationBtn,
            pressed && { backgroundColor: Colors.primarySoft },
          ]}
        >
          {locationLoading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <Ionicons name="locate" size={22} color={Colors.primary} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.locationBtnLabel}>
              {locationLoading
                ? t('profile.detectingLocation')
                : location
                  ? t('profile.redetectLocation')
                  : t('profile.detectLocation')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
        </Pressable>

        {location && !locationDenied && (
          <View style={styles.locationResult}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.locationResultText} numberOfLines={2}>
              {location.address}
            </Text>
          </View>
        )}

        {locationDenied && (
          <RanzoTextField
            value={manualAddress}
            onChangeText={setManualAddress}
            placeholder="Brodipet, Guntur"
            autoCapitalize="words"
          />
        )}
      </View>

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
  label: { ...Typography.bodyStrong, marginTop: Spacing.sm },
  section: { marginTop: Spacing.md, gap: Spacing.sm },
  helper: { ...Typography.caption },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 64,
  },
  locationBtnLabel: { ...Typography.bodyStrong, color: Colors.primary },
  locationResult: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.successSoft,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  locationResultText: { ...Typography.body, color: Colors.success, flex: 1 },
  submitError: {
    color: Colors.danger,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
