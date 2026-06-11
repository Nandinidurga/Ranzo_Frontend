import React, { useEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Typography } from '@/core/theme';
import {
  EmptyState,
  LoadingShimmer,
  RanzoAppBar,
  WorkerCard,
} from '@/core/widgets';
import { useJobsStore } from '@/data/store';

export default function WorkerListScreen() {
  const router = useRouter();
  const candidates = useJobsStore((s) => s.candidates);
  const acceptedCount = useJobsStore((s) => s.acceptedCount);
  const selectWorker = useJobsStore((s) => s.selectWorker);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      // candidates ramp continues in background until selection
    };
  }, []);

  const handleSelect = async (workerId: string) => {
    setSelected(workerId);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    await new Promise((r) => setTimeout(r, 400));
    const job = selectWorker(workerId);
    if (job) router.replace('/(employer)/job/active');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <RanzoAppBar
        title="Workers ready"
        showBack
        onBack={() => router.replace('/(employer)/dashboard')}
      />
      <View style={styles.headerStrip}>
        <Text style={Typography.body}>
          <Text style={{ fontWeight: '700', color: Colors.primary }}>
            {acceptedCount}
          </Text>{' '}
          worker{acceptedCount !== 1 ? 's' : ''} ready • Pick one
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {candidates.length === 0 ? (
          <View style={{ gap: Spacing.md }}>
            <LoadingShimmer height={120} radius={16} />
            <LoadingShimmer height={120} radius={16} />
            <EmptyState
              title="Waiting for first acceptance…"
              subtitle="It usually takes a few seconds."
            />
          </View>
        ) : (
          candidates.map((c) => (
            <WorkerCard
              key={c.id}
              name={c.name}
              rating={c.rating}
              jobsCompleted={c.jobsCompleted}
              distanceKm={c.distanceKm}
              skills={c.skills}
              experienceLabel={c.experienceLabel}
              selected={selected === c.id}
              onCall={() => Linking.openURL(`tel:${c.phone}`)}
              onSelect={() => handleSelect(c.id)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceCanvas },
  headerStrip: {
    backgroundColor: Colors.primarySoft,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  scroll: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.huge,
  },
});
