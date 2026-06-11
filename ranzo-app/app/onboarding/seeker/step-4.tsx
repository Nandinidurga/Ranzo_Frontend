import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography } from '@/core/theme';
import { RanzoAppBar, RanzoButton, RanzoChip, RanzoTextField, RanzoToggle } from '@/core/widgets';
import { WizardProgress } from '@/features/seeker/components/WizardProgress';
import { useSeekerWizardStore } from '@/features/seeker/stores/wizardStore';
import { saveSeekerWizardStep3And4 } from '@/core/api/seeker';
import type { AvailabilityOption, LanguageProficiency, SalaryPeriod } from '@/features/seeker/types';

const LANG_OPTIONS = ['English', 'Hindi', 'Telugu', 'Tamil', 'Kannada', 'Marathi'];
const PROF: LanguageProficiency[] = ['basic', 'intermediate', 'fluent'];
const AVAIL: { id: AvailabilityOption; label: string }[] = [
  { id: 'immediate', label: 'Immediate' },
  { id: 'within_15_days', label: 'Within 15 days' },
  { id: 'within_30_days', label: 'Within 30 days' },
  { id: '60_plus_days', label: '60+ days' },
];
const PERIODS: SalaryPeriod[] = ['month', 'day', 'hour'];

export default function SeekerWizardStep4() {
  const router = useRouter();
  const { draft, patch } = useSeekerWizardStore();
  const [loading, setLoading] = useState(false);

  const toggleLang = (language: string) => {
    const exists = draft.languages.find((l) => l.language === language);
    if (exists) {
      patch({ languages: draft.languages.filter((l) => l.language !== language) });
    } else {
      patch({ languages: [...draft.languages, { language, proficiency: 'intermediate' }] });
    }
  };

  const onNext = async () => {
    setLoading(true);
    try {
      await saveSeekerWizardStep3And4(draft);
      router.push('/onboarding/seeker/preview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <RanzoAppBar title="Preferences" showBack />
      <ScrollView contentContainerStyle={styles.container}>
        <WizardProgress step={4} title="Languages, salary, availability" />

        <Text style={styles.label}>Languages spoken</Text>
        <View style={styles.chips}>
          {LANG_OPTIONS.map((l) => (
            <RanzoChip
              key={l}
              label={l}
              selected={draft.languages.some((x) => x.language === l)}
              onPress={() => toggleLang(l)}
            />
          ))}
        </View>
        {draft.languages.map((entry) => (
          <View key={entry.language} style={styles.langRow}>
            <Text style={styles.langName}>{entry.language}</Text>
            {PROF.map((p) => (
              <RanzoChip
                key={p}
                label={p}
                size="sm"
                selected={entry.proficiency === p}
                onPress={() =>
                  patch({
                    languages: draft.languages.map((l) =>
                      l.language === entry.language ? { ...l, proficiency: p } : l
                    ),
                  })
                }
              />
            ))}
          </View>
        ))}

        <Text style={styles.label}>Salary expectation</Text>
        <View style={styles.salaryRow}>
          <RanzoTextField prefix="₹" value={draft.salaryMin} onChangeText={(salaryMin) => patch({ salaryMin })} placeholder="Min" keyboardType="number-pad" />
          <RanzoTextField prefix="₹" value={draft.salaryMax} onChangeText={(salaryMax) => patch({ salaryMax })} placeholder="Max" keyboardType="number-pad" />
        </View>
        <View style={styles.chips}>
          {PERIODS.map((p) => (
            <RanzoChip
              key={p}
              label={`Per ${p}`}
              selected={draft.salaryPeriod === p}
              onPress={() => patch({ salaryPeriod: p })}
            />
          ))}
        </View>

        <Text style={styles.label}>Availability</Text>
        {AVAIL.map((a) => (
          <RanzoChip
            key={a.id}
            label={a.label}
            selected={draft.availability === a.id}
            onPress={() => patch({ availability: a.id })}
            style={{ marginBottom: Spacing.sm }}
          />
        ))}

        <View style={styles.toggleRow}>
          <Text style={Typography.bodyStrong}>Open to relocate?</Text>
          <RanzoToggle value={draft.openToRelocate} onChange={(openToRelocate) => patch({ openToRelocate })} />
        </View>

        <RanzoButton label="Continue" onPress={onNext} loading={loading} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  container: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  label: { ...Typography.bodyStrong, marginTop: Spacing.md, marginBottom: Spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  langRow: { marginTop: Spacing.sm, gap: Spacing.xs },
  langName: { ...Typography.caption, fontWeight: '700' },
  salaryRow: { flexDirection: 'row', gap: Spacing.sm },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.lg },
});
