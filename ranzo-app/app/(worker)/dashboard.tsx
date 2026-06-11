import React, { useEffect } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Elevation, Radius, Spacing, Typography } from '@/core/theme';
import {
  BottomNav,
  EmptyState,
  JobCard,
  RanzoToggle,
} from '@/core/widgets';
import { WORKER_BOTTOM_NAV_ITEMS } from '@/core/config/workerBottomNav';
import { getSelectedApp } from '@/core/config/app';
import { updateLocation } from '@/core/api/location';
import { goOffline, goOnline } from '@/core/api/technician';
import { useAuthStore, useJobsStore } from '@/data/store';

export default function WorkerDashboard() {
  const router = useRouter();
  const worker = useAuthStore((s) => s.worker);
  const setOnline = useAuthStore((s) => s.setOnline);
  const alertJob = useJobsStore((s) => s.alertJob);
  const acceptedJob = useJobsStore((s) => s.acceptedJob);
  const startListening = useJobsStore((s) => s.startListening);
  const stopListening = useJobsStore((s) => s.stopListening);
  const acceptAlert = useJobsStore((s) => s.acceptAlert);
  const ignoreAlert = useJobsStore((s) => s.ignoreAlert);
  const expireAlert = useJobsStore((s) => s.expireAlert);

  useEffect(() => {
    if (worker?.online) {
      const stop = startListening(worker.skills ?? []);
      return stop;
    } else {
      stopListening();
    }
  }, [worker?.online, worker?.skills, startListening, stopListening]);

  useEffect(() => {
    if (alertJob) {
      Vibration.vibrate(180);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    }
  }, [alertJob?.id]);

  useEffect(() => {
    if (!alertJob?.expiresAt) return;
    const ms = alertJob.expiresAt - Date.now();
    if (ms <= 0) {
      expireAlert();
      return;
    }
    const id = setTimeout(expireAlert, ms);
    return () => clearTimeout(id);
  }, [alertJob?.id, alertJob?.expiresAt, expireAlert]);

  useEffect(() => {
    if (acceptedJob) {
      router.replace('/(worker)/job/active');
    }
  }, [acceptedJob, router]);

  const online = worker?.online ?? false;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <View>
          <Text style={Typography.caption}>Hi,</Text>
          <Text style={Typography.h2}>{worker?.name ?? 'there'}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.profileBtn, pressed && { opacity: 0.7 }]}
          onPress={() => router.push('/(worker)/profile')}
          accessibilityLabel="Profile"
        >
          <Ionicons name="person" size={20} color={Colors.primary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.toggleCard,
            online ? styles.toggleOn : styles.toggleOff,
          ]}
        >
          <View style={{ flex: 1 }}>
            <View style={styles.toggleStatusRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: online ? Colors.success : Colors.inkMuted },
                ]}
              />
              <Text
                style={[
                  styles.toggleLabel,
                  { color: online ? Colors.white : Colors.inkNavy },
                ]}
              >
                {online ? 'ONLINE' : 'OFFLINE'}
              </Text>
            </View>
            <Text
              style={[
                styles.toggleHelper,
                { color: online ? Colors.primarySoft : Colors.inkMuted },
              ]}
            >
              {online ? "You're visible to jobs" : 'Turn ON to receive jobs'}
            </Text>
          </View>
          <RanzoToggle
            value={online}
            onChange={(next) => {
              setOnline(next);
              Haptics.selectionAsync().catch(() => {});
              if (getSelectedApp() === 'home-services') {
                const sync = next ? goOnline() : goOffline();
                sync.catch(() => {});
                if (next && worker?.lat != null && worker?.lng != null) {
                  updateLocation({ lat: worker.lat, lng: worker.lng }).catch(() => {});
                }
              }
            }}
          />
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionLine} />
          <Text style={styles.sectionLabel}>TODAY</Text>
          <View style={styles.sectionLine} />
        </View>

        {alertJob ? (
          <Animated.View>
            <JobCard
              status="alert"
              jobType={alertJob.type}
              area={alertJob.area}
              distanceKm={alertJob.distanceKm}
              pay={alertJob.pay}
              durationLabel={alertJob.durationLabel}
              expiresAt={alertJob.expiresAt}
              notes={alertJob.notes}
              onAccept={() => {
                const accepted = acceptAlert();
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                if (accepted) router.push('/(worker)/job/active');
              }}
              onIgnore={() => {
                ignoreAlert();
                Haptics.selectionAsync().catch(() => {});
              }}
            />
          </Animated.View>
        ) : online ? (
          <EmptyState
            icon="radio-outline"
            title="Listening for jobs…"
            subtitle="Stay online — we'll buzz when a job is nearby."
          />
        ) : (
          <EmptyState
            icon="moon-outline"
            title="You're offline"
            subtitle="Flip the switch above to start getting jobs."
          />
        )}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      <BottomNav items={WORKER_BOTTOM_NAV_ITEMS} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    justifyContent: 'space-between',
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    minHeight: 88,
    ...Elevation.card,
  },
  toggleOn: {
    backgroundColor: Colors.primary,
  },
  toggleOff: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.divider,
  },
  toggleStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  toggleLabel: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  toggleHelper: {
    marginTop: 4,
    fontSize: 13,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.divider,
  },
  sectionLabel: {
    ...Typography.caption,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
});
