import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, Typography } from '@/core/theme';
import { RanzoAppBar, RanzoButton } from '@/core/widgets';
import { getApplicationDetail } from '@/core/api/seeker';
import type { ApplicationItem } from '@/features/seeker/types';

/** M-S12: Application Detail */
export default function SeekerApplicationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [app, setApp] = useState<ApplicationItem | null>(null);

  useEffect(() => {
    if (id) void getApplicationDetail(id).then(setApp);
  }, [id]);

  if (!app) {
    return (
      <SafeAreaView style={styles.safe}>
        <RanzoAppBar title="Application" showBack onBack={() => router.back()} />
        <Text style={{ padding: Spacing.lg }}>Loading…</Text>
      </SafeAreaView>
    );
  }

  const canWithdraw = ['applied', 'viewed', 'shortlisted'].includes(app.status);

  return (
    <SafeAreaView style={styles.safe}>
      <RanzoAppBar title="Application" showBack onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable onPress={() => router.push(`/(seeker)/job/${app.jobId}` as never)}>
          <Text style={Typography.h1}>{app.jobTitle}</Text>
          <Text style={styles.link}>View full job →</Text>
        </Pressable>
        <Text style={styles.sub}>{app.employerName}</Text>

        <Text style={styles.section}>Status timeline</Text>
        {app.timeline.map((step, i) => (
          <View key={`${step.status}-${i}`} style={styles.timelineRow}>
            <View style={[styles.dot, i === app.timeline.length - 1 && styles.dotActive]} />
            <View>
              <Text style={Typography.bodyStrong}>{step.label}</Text>
              <Text style={styles.date}>{new Date(step.at).toLocaleString()}</Text>
            </View>
          </View>
        ))}

        {app.coverMessage ? (
          <>
            <Text style={styles.section}>Your cover message</Text>
            <Text style={styles.body}>{app.coverMessage}</Text>
          </>
        ) : null}

        {app.employerNotes ? (
          <>
            <Text style={styles.section}>Employer notes</Text>
            <Text style={styles.body}>{app.employerNotes}</Text>
          </>
        ) : null}

        {canWithdraw ? (
          <RanzoButton label="Withdraw application" variant="danger" onPress={() => router.back()} />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  container: { padding: Spacing.lg, gap: Spacing.md },
  link: { color: Colors.primary, fontWeight: '700' },
  sub: { ...Typography.caption, color: Colors.inkMuted },
  section: { ...Typography.h2, marginTop: Spacing.md },
  timelineRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.divider, marginTop: 4 },
  dotActive: { backgroundColor: Colors.primary },
  date: { ...Typography.caption, color: Colors.inkMuted },
  body: { ...Typography.body },
});
