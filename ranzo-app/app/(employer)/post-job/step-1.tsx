import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography } from '@/core/theme';
import { RanzoAppBar, RanzoButton, RanzoChip, RanzoTextField } from '@/core/widgets';
import { EMPLOYMENT_TYPES } from '@/features/employer/constants';
import { getPastJobTitles } from '@/features/job-portal/jobCatalog';
import { usePostJobStore } from '@/features/employer/stores/postJobStore';

/** M-E05: Post job — basics */
export default function PostJobStep1() {
  const router = useRouter();
  const { draft, patch, setStep } = usePostJobStore();
  const valid = draft.title.length >= 3 && draft.sector.length > 0;
  const aiSuggestions = useMemo(() => getPastJobTitles(), []);

  return (
    <SafeAreaView style={styles.safe}>
      <RanzoAppBar title="Post a job (1/4)" showBack />
      <ScrollView contentContainerStyle={styles.container}>
        <RanzoTextField
          label="Job title"
          value={draft.title}
          onChangeText={(title) => patch({ title })}
          placeholder="e.g. Senior Software Developer"
        />
        {aiSuggestions.length > 0 ? (
          <View>
            <Text style={styles.hint}>AI suggestions from your past posts</Text>
            <View style={styles.chips}>
              {aiSuggestions.map((t) => (
                <RanzoChip key={t} label={t} onPress={() => patch({ title: t })} />
              ))}
            </View>
          </View>
        ) : null}
        <RanzoTextField label="Sector" value={draft.sector} onChangeText={(sector) => patch({ sector })} />
        <RanzoTextField
          label="Sub-sector"
          value={draft.subSector}
          onChangeText={(subSector) => patch({ subSector })}
        />
        <Text style={styles.label}>Employment type</Text>
        <View style={styles.chips}>
          {EMPLOYMENT_TYPES.map((t) => (
            <RanzoChip
              key={t}
              label={t}
              selected={draft.employmentType === t}
              onPress={() => patch({ employmentType: t })}
            />
          ))}
        </View>
        <RanzoTextField
          label="Vacancies"
          value={draft.vacancies}
          onChangeText={(vacancies) => patch({ vacancies })}
          keyboardType="number-pad"
        />
        <RanzoButton
          label="Next"
          disabled={!valid}
          onPress={() => {
            setStep(2);
            router.push('/(employer)/post-job/step-2' as never);
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  container: { padding: Spacing.lg, gap: Spacing.md },
  hint: { ...Typography.caption, color: Colors.inkMuted, marginBottom: Spacing.sm },
  label: { ...Typography.bodyStrong },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
});
