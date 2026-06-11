import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '@/core/theme';
import { RanzoAppBar, RanzoButton } from '@/core/widgets';
import { createJob, type JobCreateBody } from '@/core/api/jobs';
import { draftToCreateJobBody, publishEmployerJob } from '@/features/job-portal/jobCatalog';
import { useEmployerWizardStore } from '@/features/employer/stores/wizardStore';
import { usePostJobStore } from '@/features/employer/stores/postJobStore';

function ReviewRow({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowBody}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value || '—'}</Text>
      </View>
      <Pressable onPress={onEdit} hitSlop={12} accessibilityLabel={`Edit ${label}`}>
        <Ionicons name="pencil" size={20} color={Colors.primary} />
      </Pressable>
    </View>
  );
}

/** M-E08: Review & publish */
export default function PostJobStep4() {
  const router = useRouter();
  const { draft, patch, reset, editingJobId } = usePostJobStore();
  const { companyName, address: employerAddress } = useEmployerWizardStore((s) => s.draft);
  const [loading, setLoading] = useState(false);

  const publish = async () => {
    if (draft.title.trim().length < 3) {
      Alert.alert('Job title required', 'Enter a job title of at least 3 characters.');
      return;
    }

    setLoading(true);
    const employerName = companyName.trim() || 'Employer';
    const employerCity =
      employerAddress.split(',')[0]?.trim() || employerAddress.trim() || undefined;
    const body = draftToCreateJobBody(draft, employerName);

    try {
      await createJob(body as JobCreateBody);
    } catch {
      /* offline/demo */
    }

    publishEmployerJob(draft, employerName, employerCity, editingJobId ?? undefined);
    reset();
    setLoading(false);
    Alert.alert(
      'Published',
      draft.visibility === 'live'
        ? `"${draft.title.trim()}" is live for job seekers.`
        : 'Saved as draft.'
    );
    router.replace('/(employer)/(tabs)/jobs' as never);
  };

  const salary =
    draft.salaryMin || draft.salaryMax
      ? `₹${draft.salaryMin || '0'}–${draft.salaryMax || '0'}/${draft.salaryPeriod}`
      : 'Not disclosed';

  return (
    <SafeAreaView style={styles.safe}>
      <RanzoAppBar title="Review (4/4)" showBack />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={Typography.h1}>{draft.title || 'Untitled job'}</Text>

        <ReviewRow
          label="Basics"
          value={`${draft.sector} · ${draft.employmentType} · ${draft.vacancies} vacancies`}
          onEdit={() => router.push('/(employer)/post-job/step-1' as never)}
        />
        <ReviewRow
          label="Description"
          value={`${draft.description.slice(0, 80)}${draft.description.length > 80 ? '…' : ''}\nSkills: ${draft.skills.join(', ') || '—'}\nExp: ${draft.experienceMin}–${draft.experienceMax} yrs · ${draft.education}`}
          onEdit={() => router.push('/(employer)/post-job/step-2' as never)}
        />
        <ReviewRow
          label="Location & pay"
          value={`${draft.address || '—'}\n${salary} · ${draft.workingHours}\nBenefits: ${draft.benefits.join(', ') || '—'}`}
          onEdit={() => router.push('/(employer)/post-job/step-3' as never)}
        />

        <Pressable onPress={() => patch({ boost: !draft.boost })} style={styles.checkRow}>
          <Text>{draft.boost ? '☑' : '☐'} Boost this job for ₹99 (featured listing)</Text>
        </Pressable>
        <Pressable
          onPress={() =>
            patch({ visibility: draft.visibility === 'live' ? 'draft' : 'live' })
          }
          style={styles.checkRow}
        >
          <Text>
            Visibility: {draft.visibility === 'live' ? 'Live now' : 'Save as draft'}
          </Text>
        </Pressable>
        <RanzoButton label="Publish" onPress={publish} loading={loading} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  container: { padding: Spacing.lg, gap: Spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  rowBody: { flex: 1 },
  rowLabel: { ...Typography.caption, color: Colors.inkMuted },
  rowValue: { ...Typography.body, marginTop: 2 },
  checkRow: { paddingVertical: Spacing.sm },
});
