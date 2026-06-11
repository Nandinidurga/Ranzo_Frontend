import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '@/core/theme';
import { RanzoAppBar, RanzoButton } from '@/core/widgets';
import {
  cancelCustomerBooking,
  getBookingCompletion,
  getLiveTrackingUpdate,
} from '@/core/api/customer';
import type { LiveTrackingUpdate } from '@/features/customer/types';
import { useTranslation } from '@/core/i18n';

const POLL_MS = 2500;

/** M-C07: Live tracking */
export default function LiveTrackingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tracking, setTracking] = useState<LiveTrackingUpdate | null>(null);
  const [eta, setEta] = useState(0);
  const [cancelModal, setCancelModal] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = async () => {
    if (!id) return;
    const done = await getBookingCompletion(id);
    if (done) {
      if (timer.current) clearInterval(timer.current);
      router.replace(`/(customer)/booking/${id}/complete` as never);
      return;
    }
    const next = await getLiveTrackingUpdate(id);
    if (next) {
      setTracking(next);
      setEta(next.etaMinutes);
    }
  };

  useEffect(() => {
    if (!id) return;
    void poll();
    timer.current = setInterval(poll, POLL_MS);
    const etaTimer = setInterval(() => setEta((e) => Math.max(0, e - 1)), 60000);
    return () => {
      if (timer.current) clearInterval(timer.current);
      clearInterval(etaTimer);
    };
  }, [id]);

  const tech = tracking?.technician;

  const onCancel = async () => {
    if (!id) return;
    await cancelCustomerBooking(id);
    setCancelModal(false);
    Alert.alert(t('customer.cancelled'), t('customer.cancelAlert'));
    router.replace('/(customer)/(tabs)' as never);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.banner}>
        <Text style={styles.bannerText}>{tracking?.banner ?? t('customer.techOnWay')}</Text>
        <Text style={styles.eta}>{t('customer.eta', { min: eta })}</Text>
      </View>

      <View style={styles.map}>
        <View style={styles.mapGrid} />
        <View style={[styles.marker, styles.customerMarker]}>
          <Ionicons name="home" size={18} color={Colors.surfaceWhite} />
        </View>
        <View
          style={[
            styles.marker,
            styles.techMarker,
            { top: '38%', left: '55%' },
          ]}
        >
          <Ionicons name="car" size={18} color={Colors.surfaceWhite} />
        </View>
        <Text style={styles.mapHint}>{t('customer.liveGpsDemo')}</Text>
      </View>

      <View style={styles.sheet}>
        {tech ? (
          <>
            <View style={styles.techRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarTxt}>{tech.name.charAt(0)}</Text>
              </View>
              <View style={styles.techInfo}>
                <Text style={Typography.bodyStrong}>{tech.name}</Text>
                <Text style={styles.rating}>★ {tech.rating.toFixed(1)}</Text>
                <Text style={styles.phone}>{tech.phoneMasked ?? t('customer.phoneMasked')}</Text>
              </View>
            </View>
            <View style={styles.actions}>
              <Pressable
                style={styles.actionBtn}
                onPress={() => Linking.openURL(`tel:${tech.phoneMasked ?? ''}`)}
              >
                <Ionicons name="call" size={22} color={Colors.primary} />
                <Text style={styles.actionLabel}>{t('customer.call')}</Text>
              </Pressable>
              <Pressable
                style={styles.actionBtn}
                onPress={() => Alert.alert(t('customer.chatDemoTitle'), t('customer.chatDemo'))}
              >
                <Ionicons name="chatbubble" size={22} color={Colors.primary} />
                <Text style={styles.actionLabel}>{t('customer.chat')}</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <Text style={styles.loading}>{t('customer.loadingTracking')}</Text>
        )}
        <RanzoButton label={t('customer.cancelBooking')} variant="ghost" onPress={() => setCancelModal(true)} />
        <Text style={styles.policy}>{t('customer.cancelPolicy')}</Text>
      </View>

      <Modal visible={cancelModal} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={Typography.h2}>{t('customer.cancelConfirmTitle')}</Text>
            <Text style={styles.modalSub}>{t('customer.cancelConfirmSub')}</Text>
            <RanzoButton label={t('customer.yesCancel')} onPress={onCancel} />
            <RanzoButton label={t('customer.keepBooking')} variant="ghost" onPress={() => setCancelModal(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  banner: {
    backgroundColor: Colors.primary,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  bannerText: { ...Typography.h1, color: Colors.surfaceWhite, textAlign: 'center' },
  eta: { color: Colors.surfaceWhite, marginTop: Spacing.xs, opacity: 0.9 },
  map: {
    flex: 1,
    backgroundColor: '#e8f0e8',
    margin: Spacing.md,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapGrid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
    borderWidth: 1,
    borderColor: Colors.inkMuted,
  },
  marker: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerMarker: {
    bottom: '30%',
    left: '25%',
    backgroundColor: Colors.danger,
  },
  techMarker: {
    backgroundColor: Colors.primary,
  },
  mapHint: {
    position: 'absolute',
    bottom: Spacing.sm,
    ...Typography.caption,
    color: Colors.inkMuted,
  },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    backgroundColor: Colors.surfaceWhite,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    gap: Spacing.md,
  },
  techRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: { fontSize: 24, fontWeight: '700', color: Colors.primary },
  techInfo: { flex: 1 },
  rating: { ...Typography.caption, color: Colors.primary },
  phone: { ...Typography.caption, color: Colors.inkMuted },
  actions: { flexDirection: 'row', gap: Spacing.lg },
  actionBtn: { alignItems: 'center', gap: 4 },
  actionLabel: { ...Typography.caption, color: Colors.primary },
  policy: { ...Typography.caption, color: Colors.inkMuted, textAlign: 'center' },
  loading: { textAlign: 'center', color: Colors.inkMuted },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  modalSub: { ...Typography.body, color: Colors.inkMuted },
});
