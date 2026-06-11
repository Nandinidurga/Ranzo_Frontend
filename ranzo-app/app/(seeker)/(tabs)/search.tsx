import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '@/core/theme';
import { RanzoButton, RanzoChip, RanzoTextField, EmptyState } from '@/core/widgets';
import { SeekerJobCard } from '@/features/seeker/components/SeekerJobCard';
import { searchJobs } from '@/core/api/seeker';
import type { JobListItem } from '@/features/seeker/types';

const SORTS = ['relevant', 'newest', 'salary', 'closest'];

/** M-S07: Search Tab */
export default function SeekerSearchTab() {
  const router = useRouter();
  const params = useLocalSearchParams<{ sector?: string }>();
  const [q, setQ] = useState('');
  const [sector, setSector] = useState(params.sector ?? '');
  const [sort, setSort] = useState('relevant');
  const [mapView, setMapView] = useState(false);
  const [results, setResults] = useState<JobListItem[]>([]);
  const [searched, setSearched] = useState(false);

  const runSearch = async () => {
    const data = await searchJobs({ q, sector: sector || undefined, sort });
    setResults(data);
    setSearched(true);
  };

  const reset = () => {
    setQ('');
    setSector('');
    setSort('relevant');
    setResults([]);
    setSearched(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.top}>
        <RanzoTextField value={q} onChangeText={setQ} placeholder="Search jobs" />
        <Pressable onPress={() => setMapView((v) => !v)} style={styles.mapBtn}>
          <Ionicons name={mapView ? 'list' : 'map'} size={22} color={Colors.primary} />
        </Pressable>
      </View>

      <View style={styles.filters}>
        {['Sector', 'Distance', 'Salary', 'Freshness'].map((f) => (
          <RanzoChip key={f} label={f} size="sm" onPress={runSearch} />
        ))}
      </View>

      <View style={styles.sortRow}>
        {SORTS.map((s) => (
          <RanzoChip
            key={s}
            label={s}
            size="sm"
            selected={sort === s}
            onPress={() => setSort(s)}
          />
        ))}
        <RanzoButton label="Search" onPress={runSearch} />
      </View>

      {sector ? (
        <Text style={styles.sectorFilter}>Sector: {sector}</Text>
      ) : null}

      {mapView ? (
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapText}>Map view (coming soon)</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            searched ? (
              <EmptyState
                title="No jobs found"
                subtitle="Try different filters"
                ctaLabel="Reset"
                onCta={reset}
              />
            ) : null
          }
          renderItem={({ item }) => (
            <SeekerJobCard
              job={item}
              compact
              onPress={() => router.push(`/(seeker)/job/${item.id}` as never)}
            />
          )}
        />
      )}

      {searched && results.length > 0 ? (
        <Pressable style={styles.saveSearch}>
          <Text style={styles.saveSearchText}>Save this search</Text>
        </Pressable>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  top: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, gap: Spacing.sm },
  mapBtn: { padding: Spacing.sm },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, paddingHorizontal: Spacing.lg },
  sortRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, padding: Spacing.lg, alignItems: 'center' },
  sectorFilter: { ...Typography.caption, paddingHorizontal: Spacing.lg },
  list: { padding: Spacing.lg, paddingBottom: 80 },
  mapPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mapText: { ...Typography.body, color: Colors.inkMuted },
  saveSearch: { position: 'absolute', bottom: Spacing.lg, right: Spacing.lg },
  saveSearchText: { color: Colors.primary, fontWeight: '700' },
});
