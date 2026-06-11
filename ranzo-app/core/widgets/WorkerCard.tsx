import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Elevation, Radius, Spacing, Typography } from '@/core/theme';
import { RanzoButton } from './RanzoButton';
import { RanzoChip } from './RanzoChip';

export type WorkerCardProps = {
  name: string;
  rating: number;
  jobsCompleted: number;
  distanceKm: number;
  skills: string[];
  experienceLabel: string;
  selected?: boolean;
  onCall?: () => void;
  onSelect?: () => void;
};

export function WorkerCard({
  name,
  rating,
  jobsCompleted,
  distanceKm,
  skills,
  experienceLabel,
  selected,
  onCall,
  onSelect,
}: WorkerCardProps) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View style={[styles.card, selected && styles.selected]}>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={Typography.h2}>{name}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="star" size={14} color={Colors.warning} />
            <Text style={styles.metaText}>
              {rating.toFixed(1)} • {jobsCompleted} jobs
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={Colors.inkMuted} />
            <Text style={styles.metaText}>
              {distanceKm.toFixed(1)} km away • {experienceLabel}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.chipsRow}>
        {skills.map((s) => (
          <RanzoChip key={s} label={s} size="sm" selected={false} disabled />
        ))}
      </View>

      <View style={styles.actions}>
        <View style={{ flex: 1 }}>
          <RanzoButton label="Call" variant="secondary" onPress={onCall} />
        </View>
        <View style={{ flex: 1.2 }}>
          <RanzoButton label={selected ? 'Selected' : 'Select'} onPress={onSelect} disabled={selected} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
    ...Elevation.card,
  },
  selected: { borderColor: Colors.primary, borderWidth: 1.5 },
  row: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  metaText: { ...Typography.caption, color: Colors.inkMuted },
  chipsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  actions: { flexDirection: 'row', gap: Spacing.sm },
});
