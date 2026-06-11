import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from '@/core/theme';
import { RanzoAppBar, RanzoButton, RanzoTextField } from '@/core/widgets';
import { EDUCATION_OPTIONS, JOB_SKILLS_SUGGESTIONS } from '@/features/employer/constants';
import { ExperienceRange } from '@/features/employer/components/ExperienceRange';
import { MultiSelectChips } from '@/features/employer/components/MultiSelectChips';
import { usePostJobStore } from '@/features/employer/stores/postJobStore';

/** M-E06: Description */
export default function PostJobStep2() {
  const router = useRouter();
  const { draft, patch, setStep } = usePostJobStore();

  return (
    <SafeAreaView style={styles.safe}>
      <RanzoAppBar title="Description (2/4)" showBack />
      <ScrollView contentContainerStyle={styles.container}>
        <RanzoTextField
          label="Description"
          value={draft.description}
          onChangeText={(description) => patch({ description })}
          multiline
          placeholder="Role responsibilities, team, growth…"
        />
        <MultiSelectChips
          label="Required skills"
          options={JOB_SKILLS_SUGGESTIONS}
          selected={draft.skills}
          onChange={(skills) => patch({ skills })}
          max={8}
        />
        <ExperienceRange
          min={draft.experienceMin}
          max={draft.experienceMax}
          onChange={(experienceMin, experienceMax) => patch({ experienceMin, experienceMax })}
        />
        <View style={styles.eduRow}>
          {EDUCATION_OPTIONS.map((edu) => (
            <RanzoButton
              key={edu}
              label={edu}
              variant={draft.education === edu ? 'primary' : 'secondary'}
              onPress={() => patch({ education: edu })}
              style={styles.eduBtn}
            />
          ))}
        </View>
        <RanzoButton
          label="Next"
          onPress={() => {
            setStep(3);
            router.push('/(employer)/post-job/step-3' as never);
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  container: { padding: Spacing.lg, gap: Spacing.md },
  eduRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  eduBtn: { flexGrow: 1, minWidth: '45%' },
});
