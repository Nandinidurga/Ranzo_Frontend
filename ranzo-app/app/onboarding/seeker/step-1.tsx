import React, { useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { goBackToRoleSelectJob } from '@/core/navigation/roleFlow';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors, Radius, Spacing, Typography } from '@/core/theme';
import { RanzoAppBar, RanzoButton, RanzoTextField } from '@/core/widgets';
import { WizardProgress } from '@/features/seeker/components/WizardProgress';
import { filterCities } from '@/features/seeker/data/cities';
import { useSeekerWizardStore } from '@/features/seeker/stores/wizardStore';
import { saveSeekerWizardStep1 } from '@/core/api/seeker';
import { isAtLeast18 } from '@/features/seeker/utils/age';
import type { GenderOption } from '@/features/seeker/types';

const GENDERS: { id: GenderOption; label: string }[] = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'other', label: 'Other' },
  { id: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export default function SeekerWizardStep1() {
  const router = useRouter();
  const { draft, patch } = useSeekerWizardStore();
  const [cityQuery, setCityQuery] = useState(draft.city);
  const [showDob, setShowDob] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dobDate = draft.dateOfBirth ? new Date(draft.dateOfBirth) : new Date(2000, 0, 1);
  const cities = filterCities(cityQuery);

  const pickPhoto = async (fromCamera: boolean) => {
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      patch({ photoUri: result.assets[0].uri });
    }
  };

  const valid =
    draft.fullName.trim().length >= 2 &&
    draft.dateOfBirth &&
    isAtLeast18(draft.dateOfBirth) &&
    draft.gender &&
    draft.city.trim().length >= 2;

  const onNext = async () => {
    if (!valid) {
      setError('Fill name, DOB (18+), gender, and city.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await saveSeekerWizardStep1(draft);
      router.push('/onboarding/seeker/step-2');
    } catch (e: unknown) {
      setError((e as { message?: string })?.message ?? 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <RanzoAppBar title="Basic info" showBack onBack={() => goBackToRoleSelectJob(router)} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <WizardProgress step={1} title="Tell us about you" />

        <Pressable style={styles.photoWrap} onPress={() => {}}>
          {draft.photoUri ? (
            <Image source={{ uri: draft.photoUri }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoHint}>Add photo</Text>
            </View>
          )}
        </Pressable>
        <View style={styles.photoActions}>
          <RanzoButton label="Camera" variant="secondary" onPress={() => pickPhoto(true)} />
          <RanzoButton label="Gallery" variant="ghost" onPress={() => pickPhoto(false)} />
        </View>

        <RanzoTextField
          label="Full name *"
          value={draft.fullName}
          onChangeText={(fullName) => patch({ fullName })}
        />

        <Pressable onPress={() => setShowDob(true)} style={styles.dobField}>
          <Text style={styles.label}>Date of birth *</Text>
          <Text style={styles.dobValue}>
            {draft.dateOfBirth
              ? new Date(draft.dateOfBirth).toLocaleDateString()
              : 'Select date (18+)'}
          </Text>
        </Pressable>
        {showDob && (
          <DateTimePicker
            value={dobDate}
            mode="date"
            maximumDate={new Date()}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, date) => {
              if (Platform.OS !== 'ios') setShowDob(false);
              if (date) patch({ dateOfBirth: date.toISOString().slice(0, 10) });
            }}
          />
        )}

        <Text style={styles.label}>Gender *</Text>
        <View style={styles.genderRow}>
          {GENDERS.map((g) => (
            <Pressable
              key={g.id}
              onPress={() => patch({ gender: g.id })}
              style={[styles.genderChip, draft.gender === g.id && styles.genderChipOn]}
            >
              <Text style={draft.gender === g.id ? styles.genderOnText : styles.genderText}>
                {g.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <RanzoTextField
          label="Email (optional)"
          value={draft.email}
          onChangeText={(email) => patch({ email })}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <RanzoTextField
          label="Current city *"
          value={cityQuery}
          onChangeText={(v) => {
            setCityQuery(v);
            patch({ city: v });
          }}
          placeholder="Start typing your city"
        />
        {cities.map((c) => (
          <Pressable key={c} onPress={() => { setCityQuery(c); patch({ city: c }); }} style={styles.cityItem}>
            <Text>{c}</Text>
          </Pressable>
        ))}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <RanzoButton label="Continue" onPress={onNext} loading={loading} disabled={!valid} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  container: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  photoWrap: { alignSelf: 'center', marginBottom: Spacing.sm },
  photo: { width: 120, height: 120, borderRadius: 60 },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoHint: { ...Typography.caption, color: Colors.primary },
  photoActions: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  label: { ...Typography.caption, color: Colors.inkMuted, marginBottom: 4 },
  dobField: { marginBottom: Spacing.md },
  dobValue: { ...Typography.body, paddingVertical: Spacing.sm },
  genderRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  genderChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  genderChipOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  genderText: { ...Typography.caption },
  genderOnText: { ...Typography.caption, color: Colors.white },
  cityItem: { paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  error: { color: Colors.danger, marginBottom: Spacing.sm },
});
