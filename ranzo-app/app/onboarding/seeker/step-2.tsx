import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography } from '@/core/theme';
import { RanzoAppBar, RanzoButton, RanzoChip, RanzoTextField } from '@/core/widgets';
import { WizardProgress } from '@/features/seeker/components/WizardProgress';
import { filterSkills, suggestedSkills } from '@/features/seeker/data/skills';
import { useSeekerWizardStore } from '@/features/seeker/stores/wizardStore';
import { saveSeekerWizardStep2 } from '@/core/api/seeker';
import type { SkillLevel } from '@/features/seeker/types';

const LEVELS: SkillLevel[] = ['beginner', 'intermediate', 'expert'];

export default function SeekerWizardStep2() {
  const router = useRouter();
  const { draft, patch } = useSeekerWizardStore();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestions = useMemo(() => suggestedSkills(), []);
  const results = filterSkills(query);

  const addSkill = (name: string) => {
    if (draft.skills.length >= 10) return;
    if (draft.skills.some((s) => s.name === name)) return;
    patch({ skills: [...draft.skills, { name, level: 'intermediate' }] });
  };

  const setLevel = (name: string, level: SkillLevel) => {
    patch({
      skills: draft.skills.map((s) => (s.name === name ? { ...s, level } : s)),
    });
  };

  const removeSkill = (name: string) => {
    patch({ skills: draft.skills.filter((s) => s.name !== name) });
  };

  const onNext = async () => {
    if (draft.skills.length < 1) {
      setError('Select at least 1 skill.');
      return;
    }
    setLoading(true);
    try {
      await saveSeekerWizardStep2(draft.skills);
      router.push('/onboarding/seeker/step-3');
    } catch (e: unknown) {
      setError((e as { message?: string })?.message ?? 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <RanzoAppBar title="Skills" showBack />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <WizardProgress step={2} title="Your skills" />
        <RanzoTextField
          value={query}
          onChangeText={setQuery}
          placeholder="Search skills"
        />
        <Text style={styles.section}>Suggested skills</Text>
        <View style={styles.chips}>
          {suggestions.map((s) => (
            <RanzoChip key={s} label={s} onPress={() => addSkill(s)} />
          ))}
        </View>
        {query.trim().length > 0 ? (
          <View style={styles.chips}>
            {results.map((s) => (
              <RanzoChip key={s} label={s} onPress={() => addSkill(s)} />
            ))}
          </View>
        ) : null}
        <Text style={styles.counter}>
          {draft.skills.length} / 10 skills selected
        </Text>
        {draft.skills.map((skill) => (
          <View key={skill.name} style={styles.selectedRow}>
            <Text style={styles.skillName}>{skill.name}</Text>
            <View style={styles.levelRow}>
              {LEVELS.map((lvl) => (
                <RanzoChip
                  key={lvl}
                  label={lvl}
                  selected={skill.level === lvl}
                  onPress={() => setLevel(skill.name, lvl)}
                />
              ))}
            </View>
            <RanzoButton label="Remove" variant="ghost" onPress={() => removeSkill(skill.name)} />
          </View>
        ))}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <RanzoButton label="Continue" onPress={onNext} loading={loading} disabled={draft.skills.length < 1} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  container: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  section: { ...Typography.bodyStrong, marginTop: Spacing.md, marginBottom: Spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  counter: { ...Typography.caption, marginVertical: Spacing.md, color: Colors.primary },
  selectedRow: {
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  skillName: { ...Typography.bodyStrong },
  levelRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  error: { color: Colors.danger },
});
