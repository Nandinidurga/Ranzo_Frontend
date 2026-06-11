import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Elevation, Radius, Spacing, Typography } from '@/core/theme';
import { RanzoButton } from './RanzoButton';

export type JobStatus =
  | 'alert'
  | 'pending'
  | 'accepted'
  | 'completed'
  | 'cancelled'
  | 'expired';

export type JobCardProps = {
  jobType: string;
  area: string;
  distanceKm: number;
  pay: number;
  durationLabel: string;
  status?: JobStatus;
  expiresAt?: number;
  notes?: string;
  postedAtLabel?: string;
  onAccept?: () => void;
  onIgnore?: () => void;
  onPress?: () => void;
};

const ICONS_BY_TYPE: Record<string, keyof typeof Ionicons.glyphMap> = {
  Electrician: 'flash-outline',
  Plumber: 'water-outline',
  'AC Technician': 'snow-outline',
  Carpenter: 'hammer-outline',
  Painter: 'color-palette-outline',
  Driver: 'car-outline',
  Mason: 'construct-outline',
  Helper: 'people-outline',
};

export function JobCard({
  jobType,
  area,
  distanceKm,
  pay,
  durationLabel,
  status = 'pending',
  expiresAt,
  notes,
  postedAtLabel,
  onAccept,
  onIgnore,
  onPress,
}: JobCardProps) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(
    expiresAt ? Math.max(0, Math.round((expiresAt - Date.now()) / 1000)) : null,
  );

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      setSecondsLeft(Math.max(0, Math.round((expiresAt - Date.now()) / 1000)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const isAlert = status === 'alert';
  const expired = secondsLeft !== null && secondsLeft <= 0;

  const Wrapper: any = onPress ? Pressable : View;

  return (
    <Wrapper
      onPress={onPress}
      style={({ pressed }: any) => [
        styles.card,
        isAlert && styles.alert,
        pressed && { opacity: 0.95 },
      ]}
    >
      {isAlert && (
        <View style={styles.alertHeader}>
          <Ionicons name="flash" size={16} color={Colors.white} />
          <Text style={styles.alertHeaderText}>NEW JOB ALERT</Text>
        </View>
      )}

      <View style={styles.row}>
        <View style={styles.iconCircle}>
          <Ionicons
            name={ICONS_BY_TYPE[jobType] ?? 'briefcase-outline'}
            size={22}
            color={Colors.primary}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={Typography.h2}>{jobType}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={Colors.inkMuted} />
            <Text style={styles.metaText}>
              {area} • {distanceKm.toFixed(1)} km
            </Text>
          </View>
        </View>
        <StatusPill status={status} />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Pay</Text>
          <Text style={styles.statValue}>₹{pay}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Duration</Text>
          <Text style={styles.statValue}>{durationLabel}</Text>
        </View>
        {postedAtLabel && (
          <>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Posted</Text>
              <Text style={styles.statValue}>{postedAtLabel}</Text>
            </View>
          </>
        )}
      </View>

      {notes ? (
        <Text style={styles.notes} numberOfLines={2}>
          “{notes}”
        </Text>
      ) : null}

      {isAlert && !expired && (
        <View style={styles.actionsRow}>
          <View style={{ flex: 1 }}>
            <RanzoButton label="Ignore" variant="secondary" onPress={onIgnore} />
          </View>
          <View style={{ flex: 1.4 }}>
            <RanzoButton label="Accept" onPress={onAccept} />
          </View>
        </View>
      )}

      {isAlert && secondsLeft !== null && (
        <View style={[styles.expiryRow, expired && { opacity: 0.6 }]}>
          <Ionicons
            name="time-outline"
            size={14}
            color={expired ? Colors.danger : Colors.warning}
          />
          <Text
            style={[
              styles.expiryText,
              { color: expired ? Colors.danger : Colors.warning },
            ]}
          >
            {expired
              ? 'Job expired'
              : `Expires in 00:${secondsLeft.toString().padStart(2, '0')}`}
          </Text>
        </View>
      )}
    </Wrapper>
  );
}

function StatusPill({ status }: { status: JobStatus }) {
  if (status === 'alert' || status === 'pending') return null;
  const map: Record<JobStatus, { label: string; bg: string; fg: string }> = {
    alert: { label: 'Alert', bg: Colors.warningSoft, fg: Colors.warning },
    pending: { label: 'Pending', bg: Colors.warningSoft, fg: Colors.warning },
    accepted: { label: 'Accepted', bg: Colors.primarySoft, fg: Colors.primary },
    completed: { label: 'Completed', bg: Colors.successSoft, fg: Colors.success },
    cancelled: { label: 'Cancelled', bg: Colors.dangerSoft, fg: Colors.danger },
    expired: { label: 'Expired', bg: Colors.dangerSoft, fg: Colors.danger },
  };
  const s = map[status];
  return (
    <View style={[styles.pill, { backgroundColor: s.bg }]}>
      <Text style={[styles.pillText, { color: s.fg }]}>{s.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Elevation.card,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  alert: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  alertHeaderText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  metaText: {
    ...Typography.caption,
    color: Colors.inkMuted,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceCanvas,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.divider,
    marginVertical: 4,
  },
  statLabel: {
    ...Typography.caption,
    fontSize: 11,
  },
  statValue: {
    ...Typography.bodyStrong,
    color: Colors.inkNavy,
    marginTop: 2,
  },
  notes: {
    ...Typography.body,
    color: Colors.inkMuted,
    fontStyle: 'italic',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'center',
  },
  expiryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
