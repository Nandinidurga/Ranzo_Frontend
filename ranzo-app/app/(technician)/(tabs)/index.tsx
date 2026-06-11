import React, { useCallback, useEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Colors, Radius, Spacing, Typography } from '@/core/theme';
import { RanzoButton, RanzoToggle } from '@/core/widgets';
import {
  acceptTechnicianBooking,
  declineTechnicianBooking,
  getTechnicianIncomingOffer,
  goOffline,
  goOnline,
} from '@/core/api/technician';
import { subscribeBookingEvents } from '@/features/shared/bookingEvents';
import { useTechnicianStore } from '@/features/technician/stores/technicianStore';
import { useTranslation } from '@/core/i18n';

/** M-T05: Technician Home — linked to live customer bookings */
export default function TechnicianHomeTab() {
  const { t } = useTranslation();
  const router = useRouter();
  const [online, setOnlineLocal] = useState(false);
  const [incoming, setIncoming] = useState<Awaited<ReturnType<typeof getTechnicianIncomingOffer>>>(null);
  const [stats, setStats] = useState({
    jobsToday: 0,
    todayEarnings: 0,
    weekEarnings: 0,
  });

  const refresh = useCallback(() => {
    // TODO: Replace with backend stats endpoints when available.
    void getTechnicianIncomingOffer()
      .then((offer) => setIncoming(offer))
      .catch(() => setIncoming(null));
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  useEffect(() => {
    return subscribeBookingEvents(refresh);
  }, [refresh]);

  const activeJob = null;

  const onToggleOnline = async (v: boolean) => {
    if (v) {
      await goOnline();
    } else {
      await goOffline();
    }
    useTechnicianStore.getState().setOnline(v);
    setOnlineLocal(v);
    refresh();
  };

  const onAccept = () => {
    if (!incoming) return;
    void acceptTechnicianBooking(incoming.bookingId).then(() => {
      refresh();
      router.push(`/(technician)/service/${incoming.bookingId}` as never);
    });
  };

  const onDecline = () => {
    if (!incoming) return;
    void declineTechnicianBooking(incoming.bookingId).then(refresh);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.onlineCard}>
          <View>
            <Text style={Typography.h1}>{t('technician.goOnline')}</Text>
            <Text style={styles.sub}>
              {online ? t('technician.onlineVisible') : t('technician.goOnlineHint')}
            </Text>
          </View>
          <RanzoToggle value={online} onChange={onToggleOnline} />
        </View>

        {online && incoming && !activeJob && (
          <View style={styles.incomingCard}>
            <Text style={styles.incomingBadge}>{t('technician.newBooking')}</Text>
            <Text style={Typography.h2}>{incoming.serviceName}</Text>
            <Text style={Typography.bodyStrong}>{incoming.customerName}</Text>
            <Text style={styles.muted}>{incoming.addressLine}</Text>
            <Text style={styles.earn}>
              {t('technician.estAmount', { amount: incoming.payoutEstimate ?? 0 })}
            </Text>
            <RanzoButton label={t('technician.acceptJob')} onPress={onAccept} />
            <RanzoButton label={t('technician.decline')} variant="ghost" onPress={onDecline} />
          </View>
        )}

        {online && !activeJob && !incoming && (
          <View style={styles.waitingBox}>
            <Text style={styles.waiting}>{t('technician.waitingBookings')}</Text>
            <Text style={styles.earnToday}>
              {t('technician.todayEarnings', {
                amount: stats.todayEarnings.toLocaleString('en-IN'),
              })}
            </Text>
          </View>
        )}

        {/* Active job card will be wired once backend provides a tech \"active booking\" endpoint. */}

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{stats.jobsToday}</Text>
            <Text style={styles.statLbl}>{t('technician.jobsToday')}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}>₹{stats.todayEarnings.toLocaleString('en-IN')}</Text>
            <Text style={styles.statLbl}>{t('technician.earningsToday')}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}>₹{stats.weekEarnings.toLocaleString('en-IN')}</Text>
            <Text style={styles.statLbl}>{t('technician.thisWeek')}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceCanvas },
  container: { padding: Spacing.lg, gap: Spacing.md },
  onlineCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceWhite,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
  },
  sub: { ...Typography.caption, color: Colors.inkMuted, marginTop: 4 },
  incomingCard: {
    backgroundColor: Colors.warningSoft,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.warning,
  },
  incomingBadge: {
    ...Typography.caption,
    color: Colors.warning,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  waitingBox: { alignItems: 'center', padding: Spacing.xl },
  waiting: { ...Typography.h2, color: Colors.inkMuted },
  earnToday: { ...Typography.bodyStrong, color: Colors.primary, marginTop: Spacing.sm },
  jobCard: {
    backgroundColor: Colors.primarySoft,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
  },
  linkedBadge: { ...Typography.caption, color: Colors.primary, fontWeight: '700' },
  muted: { ...Typography.caption },
  eta: { color: Colors.primary, fontWeight: '700' },
  earn: { ...Typography.bodyStrong, color: Colors.primary },
  instructions: { ...Typography.caption, fontStyle: 'italic' },
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  stat: {
    flex: 1,
    backgroundColor: Colors.surfaceWhite,
    padding: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  statVal: { ...Typography.h2, fontSize: 16 },
  statLbl: { ...Typography.caption, textAlign: 'center' },
});
