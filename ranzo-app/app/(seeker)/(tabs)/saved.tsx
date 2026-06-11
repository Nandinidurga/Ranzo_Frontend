import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography } from '@/core/theme';
import { EmptyState } from '@/core/widgets';
import { SeekerJobCard } from '@/features/seeker/components/SeekerJobCard';
import { MOCK_JOBS } from '@/features/seeker/mock/jobs';

/** M-S10: Saved Tab */
export default function SeekerSavedTab() {
  const router = useRouter();
  const [tab, setTab] = useState<'jobs' | 'searches'>('jobs');
  const savedJobs = MOCK_JOBS.slice(0, 2).map((j) => ({ ...j, saved: true }));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.tabs}>
        <Pressable onPress={() => setTab('jobs')} style={[styles.tab, tab === 'jobs' && styles.tabOn]}>
          <Text style={tab === 'jobs' ? styles.tabTextOn : styles.tabText}>Saved Jobs</Text>
        </Pressable>
        <Pressable onPress={() => setTab('searches')} style={[styles.tab, tab === 'searches' && styles.tabOn]}>
          <Text style={tab === 'searches' ? styles.tabTextOn : styles.tabText}>Saved Searches</Text>
        </Pressable>
      </View>

      {tab === 'jobs' ? (
        <FlatList
          data={savedJobs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState title="No saved jobs" subtitle="Save jobs from search or job detail" />
          }
          renderItem={({ item }) => (
            <View>
              <SeekerJobCard job={item} compact onPress={() => router.push(`/(seeker)/job/${item.id}` as never)} />
              <Pressable style={styles.applyBtn} onPress={() => router.push(`/(seeker)/job/${item.id}/apply` as never)}>
                <Text style={styles.applyText}>{item.applied ? 'Applied' : 'Apply'}</Text>
              </Pressable>
            </View>
          )}
        />
      ) : (
        <FlatList
          data={[{ id: 's1', name: 'Sales jobs in Hyderabad' }]}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState title="No saved searches" subtitle="Save a search from the Search tab" />
          }
          renderItem={({ item }) => (
            <View style={styles.searchItem}>
              <Text style={Typography.bodyStrong}>{item.name}</Text>
              <Text style={styles.notify}>Notify: On</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  tabs: { flexDirection: 'row', padding: Spacing.lg, gap: Spacing.sm },
  tab: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center', borderRadius: 8, backgroundColor: Colors.surfaceCanvas },
  tabOn: { backgroundColor: Colors.primary },
  tabText: { ...Typography.caption, color: Colors.inkMuted },
  tabTextOn: { ...Typography.caption, color: Colors.white, fontWeight: '700' },
  list: { padding: Spacing.lg },
  applyBtn: { alignSelf: 'flex-end', marginTop: -Spacing.md, marginBottom: Spacing.lg },
  applyText: { color: Colors.primary, fontWeight: '700' },
  searchItem: { padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  notify: { ...Typography.caption, color: Colors.success },
});
