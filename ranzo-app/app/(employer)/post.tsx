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
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '@/core/theme';
import {
  RanzoAppBar,
  RanzoButton,
  RanzoChip,
  RanzoTextField,
} from '@/core/widgets';
import {
  ALL_SKILLS,
  DURATION_OPTIONS,
  DurationOption,
  Skill,
  SKILL_PAY_RANGE,
} from '@/data/models';
import { useAuthStore, useJobsStore } from '@/data/store';
import { getCurrentLocation } from '@/core/utils/location';
import { createJob } from '@/core/api/jobs';

export default function PostJobScreen() {
  const router = useRouter();
  const employer = useAuthStore((s) => s.employer);
  const postJob = useJobsStore((s) => s.postJob);
  const startMatching = useJobsStore((s) => s.startMatching);

  const [type, setType] = useState<Skill | null>(null);
  const [duration, setDuration] = useState<DurationOption | null>(null);
  const [pay, setPay] = useState('');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
    area: string;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const detectLocation = async () => {
    setLocationLoading(true);
    const result = await getCurrentLocation();
    setLocationLoading(false);
    setLocation(result.data);
  };

  const isValid = !!type && !!duration && !!location && Number(pay) > 0;

  const submit = async () => {
    if (!isValid || !type || !duration || !location) return;
    setSubmitting(true);
    try {
      const created = await createJob({
        title: type,
        sector: type,
        status: 'live',
        salary_min: Number(pay),
        salary_max: Number(pay),
        latitude: location.lat,
        longitude: location.lng,
        duration,
        notes: notes.trim() || undefined,
        address: location.address,
        area: location.area,
      });
      const job = postJob({
        type,
        lat: location.lat,
        lng: location.lng,
        duration,
        pay: Number(pay),
        notes: notes.trim() || undefined,
        address: location.address,
        area: location.area,
        employerName: employer?.name ?? 'Employer',
        employerPhone: employer?.phone ?? '+91',
      });
      const jobWithId = { ...job, id: String(created.id ?? job.id) };
      startMatching(jobWithId);
      router.push({ pathname: '/(employer)/matching', params: { jobId: jobWithId.id } });
    } catch {
      // Fall back to local mock flow when API is unavailable.
      const job = postJob({
        type,
        lat: location.lat,
        lng: location.lng,
        duration,
        pay: Number(pay),
        notes: notes.trim() || undefined,
        address: location.address,
        area: location.area,
        employerName: employer?.name ?? 'Employer',
        employerPhone: employer?.phone ?? '+91',
      });
      startMatching(job);
      router.push({ pathname: '/(employer)/matching', params: { jobId: job.id } });
    } finally {
      setSubmitting(false);
    }
  };

  const payRange = type ? SKILL_PAY_RANGE[type] : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <RanzoAppBar title="Post a job" showBack />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={Typography.h2}>Job type</Text>
            <View style={styles.chipGrid}>
              {ALL_SKILLS.map((skill) => (
                <RanzoChip
                  key={skill}
                  label={skill}
                  selected={type === skill}
                  onPress={() => setType(skill)}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={Typography.h2}>Where?</Text>
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
                <Ionicons
                  name={location ? 'checkmark-circle' : 'locate'}
                  size={22}
                  color={location ? Colors.success : Colors.primary}
                />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.locBtnLabel}>
                  {location ? location.area : 'Auto-detect location'}
                </Text>
                <Text style={styles.locBtnSub} numberOfLines={1}>
                  {location ? location.address : 'Tap to use my current spot'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={Typography.h2}>Duration</Text>
            <View style={styles.chipGrid}>
              {DURATION_OPTIONS.map((d) => (
                <RanzoChip
                  key={d}
                  label={d}
                  selected={duration === d}
                  onPress={() => setDuration(d)}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={Typography.h2}>Pay (₹)</Text>
            <RanzoTextField
              prefix="₹"
              value={pay}
              onChangeText={(t) => setPay(t.replace(/\D/g, '').slice(0, 5))}
              keyboardType="number-pad"
              placeholder="500"
              helper={
                payRange
                  ? `Typical for ${type}: ₹${payRange[0]}–${payRange[1]}`
                  : 'Pick job type to see typical range'
              }
            />
          </View>

          <View style={styles.section}>
            <Text style={Typography.h2}>Notes (optional)</Text>
            <RanzoTextField
              value={notes}
              onChangeText={(t) => setNotes(t.slice(0, 100))}
              placeholder="Anything the worker should know?"
              multiline
              helper={`${notes.length}/100`}
            />
          </View>

          <View style={{ height: Spacing.lg }} />

          <RanzoButton
            label="Send Job"
            onPress={submit}
            disabled={!isValid}
            loading={submitting}
            leadingIcon={<Ionicons name="paper-plane" size={18} color={Colors.white} />}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.huge, gap: Spacing.md },
  section: { gap: Spacing.sm, marginTop: Spacing.lg },
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
  locBtnLabel: {
    ...Typography.bodyStrong,
    color: Colors.primary,
  },
  locBtnSub: {
    ...Typography.caption,
    color: Colors.inkMuted,
    marginTop: 2,
  },
});
