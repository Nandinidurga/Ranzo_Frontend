import React, { useEffect, useState } from 'react';
import { Alert, Image, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, Typography } from '@/core/theme';
import { RanzoAppBar, RanzoButton, RanzoTextField } from '@/core/widgets';
import { fetchEmployerApplicant, patchEmployerApplicant } from '@/core/api/employer';
import type { EmployerApplicant } from '@/features/job-portal/employerPortal';
import type { ApplicationStatus } from '@/features/seeker/types';

/** M-E11: Applicant detail */
export default function ApplicantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [app, setApp] = useState<EmployerApplicant | null>(null);
  const [notes, setNotes] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [interviewAt, setInterviewAt] = useState(new Date());

  useEffect(() => {
    if (!id) return;
    void fetchEmployerApplicant(id).then((a) => {
      if (a) {
        setApp(a);
        setNotes(a.notes);
        if (a.interviewAt) setInterviewAt(new Date(a.interviewAt));
      }
    });
  }, [id]);

  const updateStatus = async (status: ApplicationStatus, message: string) => {
    if (!id) return;
    const updated = await patchEmployerApplicant(id, { status, notes });
    if (updated) {
      setApp(updated);
      Alert.alert('Updated', message);
    }
  };

  const saveNotes = async () => {
    if (!id) return;
    const updated = await patchEmployerApplicant(id, { notes });
    if (updated) setApp(updated);
  };

  if (!app) {
    return (
      <SafeAreaView style={styles.safe}>
        <RanzoAppBar title="Applicant" showBack />
        <Text style={styles.loading}>Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <RanzoAppBar title="Applicant" showBack />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          {app.photoUri ? (
            <Image source={{ uri: app.photoUri }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoTxt}>{app.name.charAt(0)}</Text>
            </View>
          )}
          <View>
            <Text style={Typography.h1}>{app.name}</Text>
            <Text style={styles.sub}>{app.jobTitle}</Text>
            <Text style={styles.badge}>{app.status}</Text>
          </View>
        </View>

        <Text style={styles.section}>Profile</Text>
        <Text style={styles.line}>Skills: {app.skills.join(', ')}</Text>
        <Text style={styles.line}>Experience: {app.experience}</Text>
        <Text style={styles.line}>Education: {app.education}</Text>
        <Text style={styles.line}>Email: {app.email}</Text>
        <Text style={styles.line}>Phone: {app.phone}</Text>

        <Text style={styles.section}>Cover message</Text>
        <Text style={styles.cover}>{app.coverMessage ?? '—'}</Text>

        <RanzoTextField
          label="Internal notes (employer-only)"
          value={notes}
          onChangeText={setNotes}
          multiline
          onBlur={() => void saveNotes()}
        />

        <RanzoButton
          label="Shortlist"
          variant="secondary"
          onPress={() => updateStatus('shortlisted', 'Applicant shortlisted.')}
        />
        <RanzoButton label="Schedule interview" onPress={() => setShowPicker(true)} />
        {showPicker && (
          <DateTimePicker
            value={interviewAt}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, d) => {
              if (Platform.OS !== 'ios') setShowPicker(false);
              if (d) {
                setInterviewAt(d);
                void patchEmployerApplicant(id!, {
                  status: 'interview',
                  interviewAt: d.toISOString(),
                  notes,
                }).then((u) => u && setApp(u));
                Alert.alert('Scheduled', `Interview: ${d.toLocaleString()}`);
              }
            }}
          />
        )}
        <RanzoButton label="Hire" onPress={() => updateStatus('hired', 'Marked as hired.')} />
        <RanzoButton
          label="Reject"
          variant="ghost"
          onPress={() => updateStatus('rejected', 'Applicant rejected.')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  loading: { padding: Spacing.lg },
  container: { padding: Spacing.lg, gap: Spacing.sm },
  header: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  photo: { width: 64, height: 64, borderRadius: 32 },
  photoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoTxt: { fontSize: 24, color: Colors.primary, fontWeight: '700' },
  sub: { ...Typography.caption, color: Colors.inkMuted },
  badge: { color: Colors.primary, fontWeight: '700', marginTop: 4 },
  section: { ...Typography.bodyStrong, marginTop: Spacing.md },
  line: { ...Typography.caption, marginBottom: 4 },
  cover: { ...Typography.body, marginBottom: Spacing.md },
});
