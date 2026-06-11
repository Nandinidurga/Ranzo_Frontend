import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Colors, Spacing, Typography } from '@/core/theme';
import { RanzoButton } from '@/core/widgets';
import { fetchWalkInDrives } from '@/core/api/employer';
import type { WalkInDrive } from '@/features/job-portal/employerPortal';

/** M-E12: Walk-in drives */
export default function EmployerWalkInsTab() {
  const router = useRouter();
  const [drives, setDrives] = useState<WalkInDrive[]>([]);

  const load = useCallback(async () => {
    setDrives(await fetchWalkInDrives());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>Walk-in drives</Text>
      <View style={styles.pad}>
        <RanzoButton
          label="+ New Drive"
          onPress={() => router.push('/(employer)/walk-in/new' as never)}
        />
      </View>
      <FlatList
        data={drives}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No drives yet. Create one for walk-in hiring.</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => {
              if (item.status === 'Live') {
                router.push(`/(employer)/walk-in/live?id=${item.id}` as never);
              }
            }}
          >
            <Text style={Typography.bodyStrong}>{item.jobTitle}</Text>
            <Text style={styles.meta}>
              {item.driveDate} · {item.slotsBooked}/{item.slotsTotal} booked · {item.status}
            </Text>
            {item.status === 'Live' ? (
              <Text style={styles.live}>Tap for live dashboard →</Text>
            ) : null}
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  title: { ...Typography.h1, padding: Spacing.lg, paddingBottom: Spacing.sm },
  pad: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm },
  list: { padding: Spacing.lg },
  card: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: 12,
  },
  meta: { ...Typography.caption },
  live: { color: Colors.primary, fontWeight: '700', marginTop: 4 },
  empty: { ...Typography.caption, textAlign: 'center', padding: Spacing.xl },
});
