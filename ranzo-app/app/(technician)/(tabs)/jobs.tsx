import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '@/core/theme';
import { getCompletedJobs } from '@/core/api/technician';

/** M-T08: Job history (Jobs tab) */
export default function TechnicianJobsTab() {
  const router = useRouter();
  const [history, setHistory] = useState<Awaited<ReturnType<typeof getCompletedJobs>>>([]);

  useFocusEffect(
    useCallback(() => {
      void getCompletedJobs()
        .then(setHistory)
        .catch(() => setHistory([]));
    }, [])
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>Job history</Text>
      <FlatList
        data={history}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No completed jobs yet</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push('/(technician)/job-history' as never)}
          >
            <View style={styles.row}>
              <Text style={Typography.bodyStrong}>{item.title}</Text>
              <View style={styles.rating}>
                <Ionicons name="star" size={14} color={Colors.warning} />
                <Text style={styles.ratingTxt}>{item.rating}</Text>
              </View>
            </View>
            <Text style={styles.meta}>
              ₹{item.earn.toLocaleString('en-IN')} · {item.date}
            </Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  title: { ...Typography.h1, padding: Spacing.lg },
  list: { padding: Spacing.lg },
  card: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: 12,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingTxt: { ...Typography.caption, fontWeight: '700' },
  meta: { ...Typography.caption, marginTop: 4 },
  empty: { ...Typography.caption, textAlign: 'center', padding: Spacing.xl },
});
