import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Radius, Spacing, Typography } from '@/core/theme';
import { RanzoAppBar, RanzoButton } from '@/core/widgets';
import { getBookingStatus, resetBookingPoll } from '@/core/api/customer';
import type { BookingStatusUpdate } from '@/features/customer/types';
import { useTranslation } from '@/core/i18n';

const POLL_MS = 2000;

/** M-C06: Booking confirmation / searching */
export default function BookingStatusScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [status, setStatus] = useState<BookingStatusUpdate | null>(null);
  const [failed, setFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = async () => {
    if (!id) return;
    const next = await getBookingStatus(id);
    setStatus(next);
    if (next.status === 'assigned' && next.technician) {
      if (timer.current) clearInterval(timer.current);
      setTimeout(() => {
        router.replace(`/(customer)/booking/${id}/tracking` as never);
      }, 800);
    }
    // Keep polling while technician confirms acceptance
    if (next.status === 'failed') {
      setFailed(true);
      if (timer.current) clearInterval(timer.current);
    }
  };

  useEffect(() => {
    if (!id) return;
    void poll();
    timer.current = setInterval(poll, POLL_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [id]);

  const retry = () => {
    if (!id) return;
    setFailed(false);
    resetBookingPoll(id);
    void poll();
    timer.current = setInterval(poll, POLL_MS);
  };

  const tech = status?.technician;
  const searching = !failed && !tech;

  return (
    <SafeAreaView style={styles.safe}>
      <RanzoAppBar title={t('customer.bookingTitle')} showBack onBack={() => router.replace('/(customer)/(tabs)' as never)} />
      <View style={styles.body}>
        {searching ? (
          <>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.title}>{status?.message ?? t('customer.findingTech')}</Text>
            {status?.techniciansSent != null ? (
              <Text style={styles.update}>
                {t('customer.sentToTechs', { count: status.techniciansSent })}
              </Text>
            ) : null}
            {status?.techniciansAccepted != null ? (
              <Text style={styles.update}>
                {t('customer.accepted', { count: status.techniciansAccepted })}
              </Text>
            ) : null}
          </>
        ) : failed ? (
          <>
            <Text style={styles.failTitle}>{t('customer.noTech')}</Text>
            <Text style={styles.failSub}>
              {status?.refundProcessed ? t('customer.refundProcessed') : t('customer.refundSoon')}
            </Text>
            <RanzoButton label={t('customer.retry')} onPress={retry} />
            <RanzoButton label={t('customer.backHome')} variant="ghost" onPress={() => router.replace('/(customer)/(tabs)' as never)} />
          </>
        ) : tech ? (
          <View style={styles.techCard}>
            <View style={styles.techAvatar}>
              <Text style={styles.techInitial}>{tech.name.charAt(0)}</Text>
            </View>
            <Text style={Typography.h1}>{tech.name}</Text>
            <Text style={styles.rating}>★ {tech.rating.toFixed(1)}</Text>
            <Text style={styles.eta}>{t('customer.eta', { min: tech.etaMinutes })}</Text>
            <RanzoButton
              label={t('customer.trackService')}
              onPress={() => router.replace(`/(customer)/booking/${id}/tracking` as never)}
              style={{ marginTop: Spacing.xl }}
            />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.md },
  title: { ...Typography.h2, textAlign: 'center' },
  update: { ...Typography.caption, color: Colors.inkMuted },
  failTitle: { ...Typography.h1, textAlign: 'center', color: Colors.danger },
  failSub: { ...Typography.body, textAlign: 'center' },
  techCard: { alignItems: 'center', width: '100%' },
  techAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  techInitial: { fontSize: 32, color: Colors.primary, fontWeight: '700' },
  rating: { ...Typography.bodyStrong, marginTop: Spacing.sm },
  eta: { ...Typography.caption, color: Colors.primary, marginTop: Spacing.xs },
});
