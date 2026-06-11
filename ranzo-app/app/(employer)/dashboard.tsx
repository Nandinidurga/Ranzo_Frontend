import React, { useEffect } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Elevation, Radius, Spacing, Typography } from '@/core/theme';
import {
  BottomNav,
  EmptyState,
  JobCard,
  RanzoButton,
} from '@/core/widgets';
import { useAuthStore, useJobsStore } from '@/data/store';
import { timeAgo } from '@/core/utils/format';

const TABS = [
  { label: 'Home', icon: 'home-outline' as const, iconActive: 'home' as const, href: '/(employer)/dashboard' },
  { label: 'Post', icon: 'add-circle-outline' as const, iconActive: 'add-circle' as const, href: '/(employer)/post' },
  { label: 'Profile', icon: 'person-outline' as const, iconActive: 'person' as const, href: '/(employer)/profile' },
];

export default function EmployerDashboard() {
  const router = useRouter();
  const employer = useAuthStore((s) => s.employer);
  const jobs = useJobsStore((s) => s.employerJobs);
  const loadEmployerHistory = useJobsStore((s) => s.loadEmployerHistory);
  const acceptedJob = useJobsStore((s) => s.acceptedJob);

  useEffect(() => {
    loadEmployerHistory();
  }, [loadEmployerHistory]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <View>
          <Text style={Typography.caption}>Welcome,</Text>
          <Text style={Typography.h2}>{employer?.name ?? 'Employer'}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}
          onPress={() => router.push('/(employer)/profile')}
        >
          <Ionicons name="person" size={20} color={Colors.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="megaphone" size={28} color={Colors.white} />
          </View>
          <Text style={[Typography.h1, { color: Colors.white }]}>
            Need a worker?
          </Text>
          <Text style={[Typography.body, { color: Colors.primarySoft, textAlign: 'center' }]}>
            Post a job. Workers nearby in seconds.
          </Text>
          <View style={{ height: Spacing.lg }} />
          <RanzoButton
            label="Post a Job"
            onPress={() => router.push('/(employer)/post')}
            leadingIcon={<Ionicons name="add" size={18} color={Colors.white} />}
          />
        </View>

        {acceptedJob && (
          <Pressable
            onPress={() => router.push('/(employer)/job/active')}
            style={({ pressed }) => [
              styles.activeJobBanner,
              pressed && { opacity: 0.95 },
            ]}
          >
            <Ionicons name="briefcase" size={20} color={Colors.success} />
            <View style={{ flex: 1 }}>
              <Text style={Typography.bodyStrong}>Job in progress</Text>
              <Text style={Typography.caption}>Tap to view details</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.success} />
          </Pressable>
        )}

        <View style={styles.sectionHeader}>
          <Text style={Typography.h2}>Recent Jobs</Text>
        </View>

        {jobs.length === 0 ? (
          <EmptyState
            icon="briefcase-outline"
            title="No jobs yet"
            subtitle="Post your first job — workers nearby in seconds."
            ctaLabel="Post a Job"
            onCta={() => router.push('/(employer)/post')}
          />
        ) : (
          <View style={{ gap: Spacing.md }}>
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                jobType={job.type}
                area={job.area}
                distanceKm={job.distanceKm || 0.5}
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
                notes={job.notes}
              />
            ))}
          </View>
        )}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      <BottomNav items={TABS} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: Spacing.lg,
    paddingBottom: Spacing.huge,
    gap: Spacing.lg,
  },
  heroCard: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
    ...Elevation.card,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  activeJobBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.successSoft,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  sectionHeader: {
    marginTop: Spacing.sm,
  },
});
