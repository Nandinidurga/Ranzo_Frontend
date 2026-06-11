import React, { useCallback, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Colors, Spacing, Typography } from '@/core/theme';
import { RanzoChip } from '@/core/widgets';
import { fetchEmployerApplicants } from '@/core/api/employer';
import type { EmployerApplicant } from '@/features/job-portal/employerPortal';
import type { ApplicationStatus } from '@/features/seeker/types';
import { getMyJobs } from '@/core/api/jobs';

const STATUSES: (ApplicationStatus | 'all')[] = [
  'all',
  'applied',
  'shortlisted',
  'interview',
  'hired',
  'rejected',
];

/** M-E10: Applicants */
export default function EmployerApplicantsTab() {
  const router = useRouter();
  const [jobFilter, setJobFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [sort, setSort] = useState<'relevant' | 'newest' | 'rated'>('relevant');
  const [list, setList] = useState<EmployerApplicant[]>([]);
  const [jobs, setJobs] = useState<Array<{ id: string; title: string }>>([]);

  const loadJobs = useCallback(async () => {
    const mine = await getMyJobs().catch(() => []);
    setJobs(
      mine.map((j: any) => ({
        id: String(j.id),
        title: String(j.title ?? j.listItem?.title ?? 'Job'),
      }))
    );
  }, []);

  const load = useCallback(async () => {
    const data = await fetchEmployerApplicants({
      jobId: jobFilter,
      status: statusFilter,
      sort,
    });
    setList(data);
  }, [jobFilter, statusFilter, sort]);

  useFocusEffect(
    useCallback(() => {
      void loadJobs();
      void load();
    }, [load, loadJobs])
  );

  const formatApplied = (iso: string) => {
    const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>Applicants</Text>

      <Text style={styles.filterLabel}>Job</Text>
      <View style={styles.chips}>
        <RanzoChip label="All" selected={jobFilter === 'all'} onPress={() => setJobFilter('all')} />
        {jobs.map((j) => (
          <RanzoChip
            key={j.id}
            label={j.title.slice(0, 18)}
            selected={jobFilter === j.id}
            onPress={() => setJobFilter(j.id)}
          />
        ))}
      </View>

      <Text style={styles.filterLabel}>Status</Text>
      <View style={styles.chips}>
        {STATUSES.map((s) => (
          <RanzoChip
            key={s}
            label={s}
            selected={statusFilter === s}
            onPress={() => setStatusFilter(s)}
          />
        ))}
      </View>

      <Text style={styles.filterLabel}>Sort</Text>
      <View style={styles.chips}>
        {(
          [
            ['relevant', 'Most relevant'],
            ['newest', 'Newest'],
            ['rated', 'Highest rated'],
          ] as const
        ).map(([id, label]) => (
          <RanzoChip key={id} label={label} selected={sort === id} onPress={() => setSort(id)} />
        ))}
      </View>

      <FlatList
        data={list}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/(employer)/applicant/${item.id}` as never)}
          >
            <View style={styles.cardRow}>
              {item.photoUri ? (
                <Image source={{ uri: item.photoUri }} style={styles.photo} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoTxt}>{item.name.charAt(0)}</Text>
                </View>
              )}
              <View style={styles.cardBody}>
                <Text style={Typography.bodyStrong}>{item.name}</Text>
                <Text style={styles.skills}>{item.skills.slice(0, 3).join(' · ')}</Text>
                <Text style={styles.meta}>
                  {formatApplied(item.appliedAt)} · {item.status}
                </Text>
              </View>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No applicants yet</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  title: { ...Typography.h1, padding: Spacing.lg, paddingBottom: Spacing.sm },
  filterLabel: { ...Typography.caption, marginLeft: Spacing.lg, marginBottom: 4, fontWeight: '700' },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  list: { padding: Spacing.lg },
  card: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: 12,
  },
  cardRow: { flexDirection: 'row', gap: Spacing.md },
  photo: { width: 48, height: 48, borderRadius: 24 },
  photoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoTxt: { color: Colors.primary, fontWeight: '700', fontSize: 18 },
  cardBody: { flex: 1 },
  skills: { ...Typography.caption },
  meta: { color: Colors.primary, marginTop: 4 },
  empty: { ...Typography.caption, textAlign: 'center', padding: Spacing.xl },
});
