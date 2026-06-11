import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Colors, Radius, Spacing, Typography } from '@/core/theme';
import { RanzoButton } from '@/core/widgets';
import { fetchEmployerDashboard } from '@/core/api/employer';
import type { EmployerDashboard } from '@/features/job-portal/employerPortal';

/** M-E04: Employer dashboard */
export default function EmployerHomeTab() {
  const router = useRouter();
  const [dash, setDash] = useState<EmployerDashboard | null>(null);

  const load = useCallback(async () => {
    setDash(await fetchEmployerDashboard());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const tier = dash?.tier ?? 'free';
  const maxBar = Math.max(...(dash?.applicationsPerDay ?? [1]), 1);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        {tier === 'free' ? (
          <Pressable
            style={styles.banner}
            onPress={() => router.push('/(employer)/subscription' as never)}
          >
            <Text style={styles.bannerTxt}>Upgrade plan — unlock more applicants</Text>
          </Pressable>
        ) : null}

        <View style={styles.statsRow}>
          {[
            { label: 'Active jobs', val: String(dash?.activeJobs ?? 0) },
            { label: 'Applicants (week)', val: String(dash?.applicantsThisWeek ?? 0) },
            { label: 'Hires (month)', val: String(dash?.hiresThisMonth ?? 0) },
            { label: 'Plan', val: tier.charAt(0).toUpperCase() + tier.slice(1) },
          ].map((s) => (
            <View key={s.label} style={styles.stat}>
              <Text style={styles.statVal}>{s.val}</Text>
              <Text style={styles.statLbl}>{s.label}</Text>
            </View>
          ))}
        </View>

        <Text style={Typography.h2}>Applications / day (7d)</Text>
        <View style={styles.chart}>
          {(dash?.applicationsPerDay ?? []).map((h, i) => (
            <View key={i} style={styles.barWrap}>
              <View style={[styles.bar, { height: (h / maxBar) * 72 }]} />
              <Text style={styles.barLbl}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</Text>
            </View>
          ))}
        </View>

        <RanzoButton
          label="+ Post Job"
          onPress={() => router.push('/(employer)/post-job/step-1' as never)}
        />
        <RanzoButton
          label="View Applicants"
          variant="secondary"
          onPress={() => router.push('/(employer)/(tabs)/applicants' as never)}
        />
        <RanzoButton
          label="Manage Walk-ins"
          variant="secondary"
          onPress={() => router.push('/(employer)/(tabs)/walk-ins' as never)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceCanvas },
  container: { padding: Spacing.lg, gap: Spacing.md },
  banner: { backgroundColor: Colors.primary, padding: Spacing.md, borderRadius: Radius.md },
  bannerTxt: { color: '#fff', fontWeight: '700' },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  stat: {
    width: '47%',
    backgroundColor: Colors.surfaceWhite,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  statVal: { ...Typography.h2 },
  statLbl: { ...Typography.caption },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 96,
    gap: 4,
    backgroundColor: Colors.surfaceWhite,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  barWrap: { flex: 1, alignItems: 'center' },
  bar: { width: '100%', backgroundColor: Colors.primary, borderRadius: 4, minHeight: 4 },
  barLbl: { fontSize: 10, marginTop: 4, color: Colors.inkMuted },
});
