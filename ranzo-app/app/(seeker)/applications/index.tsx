import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Radius, Spacing, Typography } from '@/core/theme';
import { RanzoAppBar, EmptyState } from '@/core/widgets';
import { getMyApplications } from '@/core/api/seeker';
import type { ApplicationItem, ApplicationStatus } from '@/features/seeker/types';

const ACTIVE: ApplicationStatus[] = ['applied', 'viewed', 'shortlisted', 'interview'];
const DONE: ApplicationStatus[] = ['hired', 'rejected', 'withdrawn'];

/** M-S11: My Applications */
export default function SeekerApplicationsScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<'active' | 'done'>('active');
  const [items, setItems] = useState<ApplicationItem[]>([]);

  useEffect(() => {
    void getMyApplications().then(setItems);
  }, []);

  const filtered = items.filter((a) =>
    tab === 'active' ? ACTIVE.includes(a.status) : DONE.includes(a.status)
  );

  return (
    <SafeAreaView style={styles.safe}>
      <RanzoAppBar title="My applications" showBack onBack={() => router.back()} />
      <View style={styles.tabs}>
        <Pressable onPress={() => setTab('active')} style={[styles.tab, tab === 'active' && styles.tabOn]}>
          <Text style={tab === 'active' ? styles.tabOnText : styles.tabText}>Active</Text>
        </Pressable>
        <Pressable onPress={() => setTab('done')} style={[styles.tab, tab === 'done' && styles.tabOn]}>
          <Text style={tab === 'done' ? styles.tabOnText : styles.tabText}>Completed</Text>
        </Pressable>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState title="No applications" subtitle="Apply to jobs to track them here" />}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/(seeker)/applications/${item.id}` as never)}
          >
            <Text style={Typography.bodyStrong}>{item.jobTitle}</Text>
            <Text style={styles.sub}>{item.employerName}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.status}</Text>
            </View>
            <Text style={styles.date}>Applied {new Date(item.appliedAt).toLocaleDateString()}</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  tabs: { flexDirection: 'row', padding: Spacing.lg, gap: Spacing.sm },
  tab: { flex: 1, padding: Spacing.sm, alignItems: 'center', borderRadius: Radius.md, backgroundColor: Colors.surfaceCanvas },
  tabOn: { backgroundColor: Colors.primary },
  tabText: { ...Typography.caption },
  tabOnText: { ...Typography.caption, color: Colors.white, fontWeight: '700' },
  list: { padding: Spacing.lg },
  card: {
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
  },
  sub: { ...Typography.caption, color: Colors.inkMuted },
  badge: {
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  badgeText: { ...Typography.caption, color: Colors.primary, fontWeight: '700', textTransform: 'capitalize' },
  date: { ...Typography.caption, marginTop: 4 },
});
