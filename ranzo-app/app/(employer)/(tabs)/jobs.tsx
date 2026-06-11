import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Colors, Spacing, Typography } from '@/core/theme';
import { RanzoButton } from '@/core/widgets';
import {
  deleteEmployerJob,
  getEmployerJobRecords,
  jobToMyJobsRow,
  updateEmployerJobStatus,
} from '@/features/job-portal/employerPortal';
import type { EmployerJobStatus } from '@/features/job-portal/employerPortal';
import { usePostJobStore } from '@/features/employer/stores/postJobStore';

const TABS: EmployerJobStatus[] = ['Active', 'Paused', 'Filled', 'Expired', 'Drafts'];

/** M-E09: My Jobs */
export default function EmployerJobsTab() {
  const router = useRouter();
  const loadForEdit = usePostJobStore((s) => s.loadForEdit);
  const [tab, setTab] = useState<EmployerJobStatus>('Active');
  const [rows, setRows] = useState<ReturnType<typeof jobToMyJobsRow>[]>([]);

  const load = useCallback(() => {
    setRows(getEmployerJobRecords(tab).map(jobToMyJobsRow));
  }, [tab]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onPause = (id: string, current: EmployerJobStatus) => {
    const next = current === 'Paused' ? 'Active' : 'Paused';
    updateEmployerJobStatus(id, next);
    load();
  };

  const onDelete = (id: string, title: string) => {
    Alert.alert('Delete job?', title, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteEmployerJob(id);
          load();
        },
      },
    ]);
  };

  const onEdit = (id: string) => {
    const rec = getEmployerJobRecords().find((j) => j.id === id);
    if (!rec) return;
    loadForEdit(id, rec.draft);
    router.push('/(employer)/post-job/step-1' as never);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>My Jobs</Text>
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabOn]}>
            <Text style={tab === t ? styles.tabTxtOn : styles.tabTxt}>{t}</Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={rows}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTxt}>No {tab.toLowerCase()} jobs</Text>
            <RanzoButton
              label="+ Post Job"
              onPress={() => router.push('/(employer)/post-job/step-1' as never)}
            />
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={Typography.bodyStrong}>{item.title}</Text>
            <Text style={styles.meta}>
              {item.applicants} applicants · {item.days}d active
            </Text>
            <Text style={styles.badge}>{item.status}</Text>
            <View style={styles.actions}>
              <RanzoButton label="Edit" variant="ghost" onPress={() => onEdit(item.id)} />
              {item.status === 'Active' || item.status === 'Paused' ? (
                <RanzoButton
                  label={item.status === 'Paused' ? 'Resume' : 'Pause'}
                  variant="secondary"
                  onPress={() => onPause(item.id, item.status)}
                />
              ) : null}
              <RanzoButton
                label="Delete"
                variant="ghost"
                onPress={() => onDelete(item.id, item.title)}
              />
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  title: { ...Typography.h1, padding: Spacing.lg },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.lg, gap: 6 },
  tab: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: Colors.surfaceCanvas },
  tabOn: { backgroundColor: Colors.primarySoft },
  tabTxt: { fontSize: 12 },
  tabTxtOn: { fontSize: 12, color: Colors.primary, fontWeight: '700' },
  list: { padding: Spacing.lg },
  card: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: 12,
  },
  meta: { ...Typography.caption },
  badge: { color: Colors.primary, marginTop: 4, fontWeight: '700' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginTop: Spacing.sm },
  empty: { padding: Spacing.xl, gap: Spacing.md, alignItems: 'center' },
  emptyTxt: { ...Typography.caption, color: Colors.inkMuted },
});
