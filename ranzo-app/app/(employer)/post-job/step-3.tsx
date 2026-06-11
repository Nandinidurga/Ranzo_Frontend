import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from '@/core/theme';
import { RanzoAppBar, RanzoButton, RanzoTextField } from '@/core/widgets';
import { BENEFITS_OPTIONS } from '@/features/employer/constants';
import { PlacesAutocomplete } from '@/features/employer/components/PlacesAutocomplete';
import { MultiSelectChips } from '@/features/employer/components/MultiSelectChips';
import { usePostJobStore } from '@/features/employer/stores/postJobStore';

const PERIODS = ['month', 'day', 'hour'];

/** M-E07: Location & compensation */
export default function PostJobStep3() {
  const router = useRouter();
  const { draft, patch, setStep } = usePostJobStore();

  return (
    <SafeAreaView style={styles.safe}>
      <RanzoAppBar title="Location & pay (3/4)" showBack />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <PlacesAutocomplete
          label="Job address"
          value={draft.address}
          onChange={(address) => patch({ address })}
        />
        <RanzoTextField
          label="Salary min"
          value={draft.salaryMin}
          onChangeText={(salaryMin) => patch({ salaryMin })}
          keyboardType="number-pad"
          prefix="₹"
        />
        <RanzoTextField
          label="Salary max"
          value={draft.salaryMax}
          onChangeText={(salaryMax) => patch({ salaryMax })}
          keyboardType="number-pad"
          prefix="₹"
        />
        <RanzoTextField
          label="Period"
          value={draft.salaryPeriod}
          onChangeText={(salaryPeriod) => patch({ salaryPeriod })}
          placeholder={PERIODS.join(' / ')}
        />
        <RanzoTextField
          label="Working hours"
          value={draft.workingHours}
          onChangeText={(workingHours) => patch({ workingHours })}
        />
        <MultiSelectChips
          label="Benefits"
          options={BENEFITS_OPTIONS}
          selected={draft.benefits}
          onChange={(benefits) => patch({ benefits })}
        />
        <RanzoButton
          label="Review"
          onPress={() => {
            setStep(4);
            router.push('/(employer)/post-job/step-4' as never);
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  container: { padding: Spacing.lg, gap: Spacing.md },
});
