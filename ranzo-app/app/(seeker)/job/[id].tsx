import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '@/core/theme';
import { RanzoAppBar, RanzoButton } from '@/core/widgets';
import { SeekerJobCard } from '@/features/seeker/components/SeekerJobCard';
import { getJobDetail } from '@/core/api/seeker';
import type { JobDetail } from '@/features/seeker/types';

const TABS = ['Description', 'Requirements', 'Employer', 'Similar'] as const;

/** M-S08: Job Detail */
export default function SeekerJobDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>('Description');

  useEffect(() => {
    if (id) void getJobDetail(id).then(setJob);
  }, [id]);

  if (!job) {
    return (
      <SafeAreaView style={styles.safe}>
        <RanzoAppBar title="Job" showBack onBack={() => router.back()} />
        <Text style={styles.loading}>Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <RanzoAppBar title={job.title} showBack onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={Typography.h1}>{job.title}</Text>
        <View style={styles.row}>
          <Text style={styles.employer}>{job.employerName}</Text>
          {job.verified ? (
            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
          ) : null}
        </View>
        <Text style={styles.meta}>
          {job.location}
          {job.distanceKm != null ? ` · ${job.distanceKm} km` : ''}
          {job.freshness ? ` · ${job.freshness}` : ''}
        </Text>

        <View style={styles.tabs}>
          {TABS.map((t) => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              style={[styles.tab, tab === t && styles.tabOn]}
            >
              <Text style={tab === t ? styles.tabTextOn : styles.tabText}>{t}</Text>
            </Pressable>
          ))}
        </View>

        {tab === 'Description' && (
          <View>
            <Text style={styles.body}>{job.description}</Text>
            <Text style={styles.line}>Type: {job.employmentType}</Text>
            <Text style={styles.line}>Hours: {job.workingHours}</Text>
            <Text style={styles.line}>Vacancies: {job.vacancies}</Text>
          </View>
        )}
        {tab === 'Requirements' && (
          <View>
            {job.requirements.skills.map((s) => (
              <Text key={s.name} style={styles.line}>
                • {s.name}{s.mandatory ? ' (required)' : ''}
              </Text>
            ))}
            <Text style={styles.line}>Experience: {job.requirements.experience}</Text>
            <Text style={styles.line}>Education: {job.requirements.education}</Text>
          </View>
        )}
        {tab === 'Employer' && (
          <View>
            <Text style={styles.line}>{job.employer.companyName}</Text>
            <Text style={styles.line}>{job.employer.industry}</Text>
            <Text style={styles.line}>{job.employer.address}</Text>
            {job.employer.gstVerified ? (
              <Text style={styles.verified}>GST verified</Text>
            ) : null}
            <Text style={styles.line}>{job.employer.jobsPosted} jobs posted</Text>
          </View>
        )}
        {tab === 'Similar' && (
          <View>
            {job.similarJobs.map((j) => (
              <SeekerJobCard
                key={j.id}
                job={j}
                compact
                onPress={() => router.replace(`/(seeker)/job/${j.id}` as never)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.bar}>
        <RanzoButton
          label="Apply"
          onPress={() => router.push(`/(seeker)/job/${id}/apply` as never)}
          style={{ flex: 1 }}
        />
        <Pressable style={styles.iconBtn}>
          <Ionicons name="heart-outline" size={24} color={Colors.primary} />
        </Pressable>
        <Pressable style={styles.iconBtn}>
          <Ionicons name="share-social-outline" size={24} color={Colors.primary} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  loading: { padding: Spacing.lg },
  container: { padding: Spacing.lg, paddingBottom: 100 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  employer: { ...Typography.bodyStrong, color: Colors.inkMuted },
  meta: { ...Typography.caption, marginBottom: Spacing.md },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  tab: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: 20, backgroundColor: Colors.surfaceCanvas },
  tabOn: { backgroundColor: Colors.primary },
  tabText: { ...Typography.caption, color: Colors.inkMuted },
  tabTextOn: { ...Typography.caption, color: Colors.white, fontWeight: '700' },
  body: { ...Typography.body, marginBottom: Spacing.sm },
  line: { ...Typography.caption, marginBottom: 4 },
  verified: { color: Colors.success, fontWeight: '700' },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    backgroundColor: Colors.surfaceWhite,
  },
  iconBtn: { padding: Spacing.sm },
});
