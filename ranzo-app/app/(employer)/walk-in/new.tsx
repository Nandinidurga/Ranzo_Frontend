import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import { Colors, Spacing, Typography } from '@/core/theme';
import { RanzoAppBar, RanzoButton, RanzoChip, RanzoTextField } from '@/core/widgets';
import { createWalkInDrive } from '@/core/api/employer';
import { PlacesAutocomplete } from '@/features/employer/components/PlacesAutocomplete';
import { getEmployerJobRecords } from '@/features/job-portal/employerPortal';

/** M-E12: Walk-in composer */
export default function WalkInNewScreen() {
  const router = useRouter();
  const activeJobs = useMemo(
    () => getEmployerJobRecords('Active'),
    []
  );
  const [jobId, setJobId] = useState(activeJobs[0]?.id ?? '');
  const [driveDate, setDriveDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [slotsText, setSlotsText] = useState('9–10 AM, 10–11 AM, 11–12 PM');
  const [address, setAddress] = useState('');
  const [capacity, setCapacity] = useState('10');
  const [instructions, setInstructions] = useState('');

  const selectedJob = activeJobs.find((j) => j.id === jobId);

  const create = async () => {
    if (!jobId || !selectedJob) {
      Alert.alert('Select a job', 'Post an active job first to link a walk-in drive.');
      return;
    }
    const timeSlots = slotsText.split(',').map((s) => s.trim()).filter(Boolean);
    const cap = Number(capacity) || 10;
    const drive = await createWalkInDrive({
      jobId,
      jobTitle: selectedJob.listItem.title,
      driveDate: driveDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      timeSlots,
      address: address || selectedJob.listItem.location,
      capacityPerSlot: cap,
      instructions,
      slotsTotal: timeSlots.length * cap,
    });
    const code = drive.qrCode ?? (drive as any).qr_code ?? '';
    Alert.alert('Drive created', `QR code: ${code || '—'}`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <RanzoAppBar title="New walk-in drive" showBack />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Linked job</Text>
        <View style={styles.chips}>
          {activeJobs.length === 0 ? (
            <Text style={styles.hint}>No active jobs — publish a job first.</Text>
          ) : (
            activeJobs.map((j) => (
              <RanzoChip
                key={j.id}
                label={j.listItem.title}
                selected={jobId === j.id}
                onPress={() => setJobId(j.id)}
              />
            ))
          )}
        </View>

        <RanzoButton
          label={`Drive date: ${driveDate.toLocaleDateString()}`}
          variant="secondary"
          onPress={() => setShowDate(true)}
        />
        {showDate && (
          <DateTimePicker
            value={driveDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, d) => {
              if (Platform.OS !== 'ios') setShowDate(false);
              if (d) setDriveDate(d);
            }}
          />
        )}

        <RanzoTextField
          label="Time slots (comma-separated)"
          value={slotsText}
          onChangeText={setSlotsText}
          placeholder="9–10 AM, 10–11 AM"
        />
        <PlacesAutocomplete label="Address" value={address} onChange={setAddress} />
        <RanzoTextField
          label="Capacity per slot"
          value={capacity}
          onChangeText={setCapacity}
          keyboardType="number-pad"
        />
        <RanzoTextField
          label="Special instructions"
          value={instructions}
          onChangeText={setInstructions}
          multiline
        />
        <RanzoButton label="Create & show QR" onPress={create} disabled={!jobId} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  container: { padding: Spacing.lg, gap: Spacing.md },
  label: { ...Typography.bodyStrong },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  hint: { ...Typography.caption, color: Colors.inkMuted },
});
