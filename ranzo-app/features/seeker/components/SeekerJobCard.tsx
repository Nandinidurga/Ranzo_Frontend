import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '@/core/theme';
import type { JobListItem } from '@/features/seeker/types';

type Props = {
  job: JobListItem;
  compact?: boolean;
  onPress?: () => void;
};

export function SeekerJobCard({ job, compact, onPress }: Props) {
  const salary =
    job.salaryMin != null
      ? `₹${job.salaryMin.toLocaleString('en-IN')}${job.salaryMax ? `–${job.salaryMax.toLocaleString('en-IN')}` : ''}${job.salaryPeriod ? `/${job.salaryPeriod}` : ''}`
      : 'Salary not disclosed';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, compact && styles.compact, pressed && { opacity: 0.9 }]}
    >
      <View style={styles.row}>
        <Text style={styles.title} numberOfLines={2}>
          {job.title?.trim() || 'Untitled job'}
        </Text>
        {job.verified ? (
          <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
        ) : null}
      </View>
      <Text style={styles.employer}>
        {job.employerName}
        {job.postedByEmployer ? ' · Employer posted' : ''}
      </Text>
      <Text style={styles.meta}>
        {job.location}
        {job.distanceKm != null ? ` · ${job.distanceKm} km` : ''}
        {job.freshness ? ` · ${job.freshness}` : ''}
      </Text>
      <Text style={styles.salary}>{salary}</Text>
      {job.applied ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Applied</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 280,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Colors.surfaceWhite,
    marginRight: Spacing.md,
  },
  compact: { width: '100%', marginRight: 0, marginBottom: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  title: { ...Typography.bodyStrong, flex: 1 },
  employer: { ...Typography.caption, color: Colors.inkMuted, marginTop: 4 },
  meta: { ...Typography.caption, marginTop: 2 },
  salary: { ...Typography.caption, color: Colors.primary, fontWeight: '700', marginTop: 6 },
  badge: {
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  badgeText: { ...Typography.caption, color: Colors.primary, fontWeight: '700' },
});
