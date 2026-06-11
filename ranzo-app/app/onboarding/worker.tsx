import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { goBackToRoleSelectWork } from '@/core/navigation/roleFlow';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '@/core/theme';
import {
  RanzoAppBar,
  RanzoButton,
  RanzoChip,
  RanzoTextField,
} from '@/core/widgets';
import { useAuthStore } from '@/data/store';
import {
  ALL_SKILLS,
  EXPERIENCE_OPTIONS,
  Experience,
  Skill,
} from '@/data/models';
import { getCurrentLocation } from '@/core/utils/location';
import { updateLocation } from '@/core/api/location';
import { upsertWorkerProfile } from '@/core/api/profile';
import { getSelectedApp } from '@/core/config/app';
import { goOnline } from '@/core/api/technician';

export default function WorkerOnboardingScreen() {
  const router = useRouter();
  const setWorkerProfile = useAuthStore((s) => s.setWorkerProfile);
  const existingWorker = useAuthStore((s) => s.worker);
  const employer = useAuthStore.getState().employer;
  const phone = useAuthStore.getState().worker?.phone ?? employer?.phone ?? '+91';

  const [name, setName] = useState(existingWorker?.name ?? '');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experience, setExperience] = useState<Experience | null>(null);
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
    area: string;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
        return;
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

      await setWorkerProfile({
        id: existingWorker?.id ?? useAuthStore.getState().userId ?? 'wrk_local',
        role: 'worker',
        phone,
        name: name.trim(),
        skills,
        experience: experience!,
        lat: location.lat,
        lng: location.lng,
        address,
        online: true,
        rating: existingWorker?.rating ?? 0,
        jobsCompleted: existingWorker?.jobsCompleted ?? 0,
        isDetailsFilled: true,
      });

      updateLocation({ lat: location.lat, lng: location.lng }).catch(() => {});
      if (getSelectedApp() === 'home-services') {
        goOnline().catch(() => {});
      }
      router.replace('/(worker)/dashboard');
    } catch (e: any) {
      setSubmitError(e?.message ?? 'Failed to save profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <RanzoAppBar title="Tell us about you" showBack onBack={() => goBackToRoleSelectWork(router)} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={Typography.h2}>Your name</Text>
          <RanzoTextField
            value={name}
            onChangeText={setName}
            placeholder="Ravi Kumar"
            autoCapitalize="words"
            returnKeyType="next"
          />

          <View style={styles.section}>
            <Text style={Typography.h2}>Select your skill</Text>
            <Text style={styles.helper}>Pick 1–3 skills you do</Text>
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
            <Text style={Typography.h2}>Experience</Text>
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
            <Text style={Typography.h2}>Your location</Text>
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
                    ? 'Detecting…'
                    : location
                      ? 'Re-detect location'
                      : 'Auto-detect my location'}
                </Text>
                <Text style={styles.locationBtnSub}>
                  Faster than typing your address
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
              <>
                <Text style={styles.deniedHint}>
                  Permission denied. Please type your area below.
                </Text>
                <RanzoTextField
                  value={manualAddress}
                  onChangeText={setManualAddress}
                  placeholder="Brodipet, Guntur"
                  autoCapitalize="words"
                />
              </>
            )}
          </View>

          {submitError ? (
            <Text style={styles.submitError}>{submitError}</Text>
          ) : null}

          <View style={{ height: Spacing.xxl }} />

          <RanzoButton
            label="Continue"
            onPress={submit}
            disabled={!isValid}
            loading={submitting}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing.huge,
    gap: Spacing.md,
  },
  section: { marginTop: Spacing.lg, gap: Spacing.sm },
  helper: { ...Typography.caption },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
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
  locationBtnLabel: {
    ...Typography.bodyStrong,
    color: Colors.primary,
  },
  locationBtnSub: {
    ...Typography.caption,
    color: Colors.inkMuted,
    marginTop: 2,
  },
  locationResult: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.successSoft,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  locationResultText: {
    ...Typography.body,
    color: Colors.success,
    flex: 1,
  },
  deniedHint: {
    ...Typography.caption,
    color: Colors.danger,
  },
  submitError: {
    color: Colors.danger,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
