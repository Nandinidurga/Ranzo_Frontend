import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '@/core/theme';
import { RanzoAppBar } from '@/core/widgets';
import { getCompletedJobs } from '@/core/api/technician';

/** M-T08: Completed jobs detail list */
export default function TechnicianJobHistoryScreen() {
  const [items, setItems] = useState<Awaited<ReturnType<typeof getCompletedJobs>>>([]);

  useEffect(() => {
    void getCompletedJobs()
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <RanzoAppBar title="Completed jobs" showBack />
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={Typography.bodyStrong}>{item.title}</Text>
            <View style={styles.row}>
              <Text style={styles.earn}>₹{item.earn.toLocaleString('en-IN')}</Text>
              <View style={styles.rating}>
                <Ionicons name="star" size={16} color={Colors.warning} />
                <Text style={styles.ratingTxt}> {item.rating}</Text>
              </View>
              <Text style={styles.date}>{item.date}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  list: { padding: Spacing.lg },
  card: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginTop: 4 },
  earn: { color: Colors.success, fontWeight: '700' },
  rating: { flexDirection: 'row', alignItems: 'center' },
  ratingTxt: { ...Typography.caption, fontWeight: '700' },
  date: { ...Typography.caption, color: Colors.inkMuted, marginLeft: 'auto' },
});
