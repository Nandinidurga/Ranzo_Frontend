import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, Typography } from '@/core/theme';
import { RanzoAppBar, RanzoButton } from '@/core/widgets';
import {
  checkInAttendee,
  getWalkInDrive,
  logWalkInOutcome,
} from '@/features/job-portal/employerPortal';
import type { WalkInDrive } from '@/features/job-portal/employerPortal';

/** M-E14: Walk-in live dashboard */
export default function WalkInLiveScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [drive, setDrive] = useState<WalkInDrive | null>(null);
  const [selectedAttendee, setSelectedAttendee] = useState<string | null>(null);

  const reload = () => {
    if (!id) return;
    setDrive(getWalkInDrive(id) ?? null);
  };

  useEffect(() => {
    reload();
  }, [id]);

  const scanQr = () => {
    if (!id) return;
    checkInAttendee(id, `Seeker ${Date.now().toString().slice(-4)}`);
    reload();
    Alert.alert('Checked in', 'Seeker QR scanned successfully.');
  };

  const logOutcome = (outcome: 'Hired' | 'Shortlisted' | 'Rejected') => {
    if (!id || !selectedAttendee) {
      Alert.alert('Select attendee', 'Tap an attendee below first.');
      return;
    }
    logWalkInOutcome(id, selectedAttendee, outcome);
    reload();
    Alert.alert('Logged', `Outcome: ${outcome}`);
    setSelectedAttendee(null);
  };

  if (!drive) {
    return (
      <SafeAreaView style={styles.safe}>
        <RanzoAppBar title="Live walk-in" showBack />
        <Text style={styles.loading}>Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <RanzoAppBar title={drive.jobTitle} showBack />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.count}>
          Attendance: {drive.slotsBooked} / {drive.slotsTotal}
        </Text>
        <Text style={styles.qr}>QR: {drive.qrCode}</Text>
        <RanzoButton label="Scan check-in QR" onPress={scanQr} />

        <Text style={Typography.h2}>Attendees</Text>
        <FlatList
          data={drive.attendees}
          keyExtractor={(a) => a.id}
          scrollEnabled={false}
          ListEmptyComponent={<Text style={styles.empty}>No check-ins yet — scan QR to add.</Text>}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.attendee, selectedAttendee === item.id && styles.attendeeOn]}
              onPress={() => setSelectedAttendee(item.id)}
            >
              <Text style={Typography.bodyStrong}>{item.name}</Text>
              <Text style={styles.meta}>
                {new Date(item.checkedInAt).toLocaleTimeString()}
                {item.outcome ? ` · ${item.outcome}` : ''}
              </Text>
            </Pressable>
          )}
        />

        <Text style={Typography.h2}>Log outcome</Text>
        <RanzoButton label="Hired" variant="secondary" onPress={() => logOutcome('Hired')} />
        <RanzoButton label="Shortlisted" variant="secondary" onPress={() => logOutcome('Shortlisted')} />
        <RanzoButton label="Rejected" variant="ghost" onPress={() => logOutcome('Rejected')} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  loading: { padding: Spacing.lg },
  container: { padding: Spacing.lg, gap: Spacing.md },
  count: { fontSize: 28, fontWeight: '800', color: Colors.primary },
  qr: { ...Typography.caption, color: Colors.inkMuted },
  empty: { ...Typography.caption, padding: Spacing.md },
  attendee: {
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: 8,
    marginBottom: Spacing.sm,
  },
  attendeeOn: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
  meta: { ...Typography.caption },
});
