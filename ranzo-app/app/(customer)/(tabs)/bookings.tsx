import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '@/core/theme';
import { useTranslation } from '@/core/i18n';
import { RECENT_BOOKINGS } from '@/features/customer/mock/catalog';

export default function CustomerBookingsTab() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>{t('customer.myBookings')}</Text>
      {RECENT_BOOKINGS.map((b) => (
        <View key={b.id} style={styles.card}>
          <Text style={Typography.bodyStrong}>{b.serviceName}</Text>
          <Text style={styles.date}>{b.bookedAt}</Text>
        </View>
      ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite, padding: Spacing.lg },
  title: { ...Typography.h1, marginBottom: Spacing.lg },
  card: { padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  date: { ...Typography.caption, marginTop: 4 },
});
