import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '@/core/theme';
import { WORKER_BOTTOM_NAV_ITEMS } from '@/core/config/workerBottomNav';
import { BottomNav, EmptyState, JobCard } from '@/core/widgets';
import { useJobsStore } from '@/data/store';
import { timeAgo } from '@/core/utils/format';

export default function WorkerJobsScreen() {
  const history = useJobsStore((s) => s.workerHistory);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={Typography.h1}>My Jobs</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {history.length === 0 ? (
          <EmptyState
            icon="time-outline"
            title="No jobs yet"
            subtitle="Accept your first job — it'll show up here."
          />
        ) : (
          history.map((job) => (
            <JobCard
              key={job.id}
              jobType={job.type}
              area={job.area}
              distanceKm={job.distanceKm}
              pay={job.pay}
              durationLabel={job.durationLabel}
              status={
                job.status === 'completed'
                  ? 'completed'
                  : job.status === 'cancelled'
                    ? 'cancelled'
                    : 'pending'
              }
              postedAtLabel={timeAgo(job.createdAt)}
            />
          ))
        )}
      </ScrollView>
      <BottomNav items={WORKER_BOTTOM_NAV_ITEMS} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  header: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  scroll: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxl },
});
