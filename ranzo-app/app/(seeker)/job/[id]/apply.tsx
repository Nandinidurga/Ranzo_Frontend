import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, Typography } from '@/core/theme';
import { RanzoAppBar, RanzoButton, RanzoTextField } from '@/core/widgets';
import { applyToJob, getJobDetail } from '@/core/api/seeker';

/** M-S09: Apply Confirmation */
export default function SeekerApplyScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [title, setTitle] = useState<string | null>(null);
  const [cover, setCover] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!id) return;
    void getJobDetail(id).then((j) => setTitle(j.title));
  }, [id]);

  const onApply = async () => {
    if (!id) return;
    setLoading(true);
    try {
      await applyToJob(id, {
        cover_message: cover.trim() || undefined,
        salary_expectation: {
          min: salaryMin ? Number(salaryMin) : undefined,
          max: salaryMax ? Number(salaryMax) : undefined,
        },
      });
      router.replace('/(seeker)/applications' as never);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <RanzoAppBar title={title ?? 'Apply'} showBack onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.container}>
        {title == null ? (
          <Text style={styles.loading}>Loading job…</Text>
        ) : (
          <Text style={Typography.h1}>Apply to {title}?</Text>
        )}
        <RanzoTextField
          label="Cover message (optional)"
          value={cover}
          onChangeText={(v) => setCover(v.slice(0, 500))}
          multiline
          placeholder="Why you're a good fit"
        />
        <Text style={styles.counter}>{cover.length}/500</Text>
        <Text style={styles.label}>Salary expectation override (optional)</Text>
        <View style={styles.salaryRow}>
          <RanzoTextField prefix="₹" value={salaryMin} onChangeText={setSalaryMin} placeholder="Min" keyboardType="number-pad" />
          <RanzoTextField prefix="₹" value={salaryMax} onChangeText={setSalaryMax} placeholder="Max" keyboardType="number-pad" />
        </View>
        <RanzoButton label="Apply" onPress={onApply} loading={loading} disabled={!title} />
        <RanzoButton label="Cancel" variant="ghost" onPress={() => router.back()} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  container: { padding: Spacing.lg, gap: Spacing.md },
  loading: { ...Typography.body, color: Colors.inkMuted },
  counter: { ...Typography.caption, color: Colors.inkMuted, textAlign: 'right' },
  label: { ...Typography.bodyStrong },
  salaryRow: { flexDirection: 'row', gap: Spacing.sm },
});
