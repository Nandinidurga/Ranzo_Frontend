import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Elevation, Radius, Spacing, Typography } from '@/core/theme';
import { RanzoAppBar, RanzoButton } from '@/core/widgets';
import { useJobsStore } from '@/data/store';

export default function ActiveJobScreen() {
  const router = useRouter();
  const job = useJobsStore((s) => s.acceptedJob);
  const [completing, setCompleting] = useState(false);

  if (!job) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <RanzoAppBar title="Job" showBack />
        <View style={styles.empty}>
          <Text style={Typography.body}>No active job.</Text>
          <RanzoButton
            label="Back to dashboard"
            variant="ghost"
            onPress={() => router.replace('/(worker)/dashboard')}
          />
        </View>
      </SafeAreaView>
    );
  }

  const employerName =
    job.workerName && job.employerName === 'me' ? 'You' : job.employerName;

  const handleCall = () => {
    Haptics.selectionAsync().catch(() => {});
    Linking.openURL(`tel:${job.employerPhone}`);
  };

  const handleNavigate = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${job.lat},${job.lng}`;
    Linking.openURL(url);
  };

  const handleComplete = async () => {
    setCompleting(true);
    await new Promise((r) => setTimeout(r, 400));
    setCompleting(false);
    router.push('/(worker)/job/complete');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <RanzoAppBar
        title="Job Confirmed"
        onBack={() => router.replace('/(worker)/dashboard')}
        showBack
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.successBanner}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={28} color={Colors.white} />
          </View>
          <Text style={[Typography.h1, { color: Colors.success, textAlign: 'center' }]}>
            Job Confirmed!
          </Text>
          <Text style={[Typography.body, { textAlign: 'center', color: Colors.inkMuted }]}>
            Head over to the location.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {employerName.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={Typography.h2}>{employerName}</Text>
              <Text style={[Typography.caption, { color: Colors.inkMuted }]}>
                Employer • ⭐ 4.6
              </Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.callBtn,
              pressed && { backgroundColor: Colors.successSoft },
            ]}
            onPress={handleCall}
          >
            <Ionicons name="call" size={22} color={Colors.success} />
            <Text style={styles.callLabel}>Call {employerName}</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.success} />
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={Typography.h2}>{job.type} Work</Text>
          <View style={styles.summaryRow}>
            <SummaryItem icon="cash-outline" label="Pay" value={`₹${job.pay}`} />
            <SummaryItem icon="time-outline" label="Time" value={job.durationLabel} />
          </View>
          {job.notes && (
            <View style={styles.notesBox}>
              <Ionicons name="chatbubble-ellipses-outline" size={16} color={Colors.primary} />
              <Text style={[Typography.body, { flex: 1 }]} numberOfLines={3}>
                {job.notes}
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.card, { padding: 0, overflow: 'hidden' }]}>
          <View style={styles.mapStub}>
            <Ionicons name="map" size={42} color={Colors.primary} />
            <Text style={Typography.bodyStrong}>{job.address}</Text>
            <Text style={[Typography.caption, { textAlign: 'center' }]}>
              Coordinates: {job.lat.toFixed(4)}, {job.lng.toFixed(4)}
            </Text>
          </View>
          <View style={{ padding: Spacing.lg, paddingTop: 0 }}>
            <RanzoButton
              label="Open in Google Maps"
              onPress={handleNavigate}
              leadingIcon={<Ionicons name="navigate" size={18} color={Colors.white} />}
            />
          </View>
        </View>

        <View style={{ height: Spacing.lg }} />

        <RanzoButton
          label="Mark Completed"
          variant="secondary"
          loading={completing}
          onPress={handleComplete}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryItem({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.summaryItem}>
      <Ionicons name={icon} size={20} color={Colors.primary} />
      <View>
        <Text style={[Typography.caption, { fontSize: 12 }]}>{label}</Text>
        <Text style={Typography.bodyStrong}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceCanvas },
  scroll: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: Spacing.huge,
  },
  successBanner: {
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.successSoft,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  checkCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Elevation.card,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.success,
    borderRadius: Radius.md,
    minHeight: 56,
    paddingHorizontal: Spacing.lg,
  },
  callLabel: {
    flex: 1,
    color: Colors.success,
    fontWeight: '700',
    fontSize: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    backgroundColor: Colors.surfaceCanvas,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  notesBox: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
    backgroundColor: Colors.primarySoft,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  mapStub: {
    backgroundColor: Colors.primarySoft,
    paddingVertical: Spacing.huge,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
});
