import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing, Radius } from '@/core/theme';
import { getHistoryBookings, Booking } from '@/core/api/bookings';

export default function TechnicianHistoryScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getHistoryBookings('technician');
        setBookings(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to load history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={{ color: Colors.danger }}>{error}</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Job History</Text>
          {bookings.length === 0 ? (
            <Text style={{ color: Colors.inkMuted }}>No history found.</Text>
          ) : (
            bookings.map((b) => (
              <View key={b.id} style={styles.card}>
                <Text style={styles.cardTitle}>{b.category} - {b.status}</Text>
                <Text style={styles.cardSub}>{new Date(b.created_at).toLocaleString()}</Text>
                <Text style={styles.cardSub}>Customer ID: {b.customer_id.slice(-6)}</Text>
              </View>
            ))
          )}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: Spacing.xl },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: Spacing.xl },
  card: {
    backgroundColor: Colors.surfaceCanvas,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  cardSub: { fontSize: 14, color: Colors.inkMuted, marginTop: 4 },
});
