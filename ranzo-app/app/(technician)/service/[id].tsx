import React, { useEffect, useState } from 'react';
import { Alert, Image, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, Typography } from '@/core/theme';
import { RanzoAppBar, RanzoButton, RanzoTextField } from '@/core/widgets';
import {
  bookingArrived,
  bookingCompleted,
  bookingStarted,
  getTechnicianBooking,
} from '@/core/api/technician';
import { useTranslation } from '@/core/i18n';

const STEP_KEYS = [
  'iHaveArrived',
  'startedWork',
  'photoBefore',
  'materialsUsed',
  'photoAfter',
  'markComplete',
] as const;

/** M-T06: Active service detail */
export default function TechnicianServiceDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [step, setStep] = useState(0);
  const [materials, setMaterials] = useState('');
  const [job, setJob] = useState<Awaited<ReturnType<typeof getTechnicianBooking>> | null>(null);

  useEffect(() => {
    if (!id) return;
    void getTechnicianBooking(id)
      .then(setJob)
      .catch(() => setJob(null));
  }, [id]);

  if (!job) {
    return (
      <SafeAreaView style={styles.safe}>
        <RanzoAppBar title={t('technician.activeJob')} showBack />
        <Text style={styles.loading}>{t('technician.noActiveJob')}</Text>
      </SafeAreaView>
    );
  }

  const currentLabel = t(`technician.${STEP_KEYS[step]}`);

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    await ImagePicker.launchCameraAsync({ quality: 0.7 });
  };

  const onAction = async () => {
    if (STEP_KEYS[step].includes('photo')) {
      await pickPhoto();
    }
    if (!id) return;
    if (STEP_KEYS[step] === 'iHaveArrived') {
      await bookingArrived(id);
    }
    if (STEP_KEYS[step] === 'startedWork') {
      await bookingStarted(id);
    }
    if (STEP_KEYS[step] === 'materialsUsed') {
      // Backend does not define materials endpoint yet; keep local UI only.
      void materials;
    }
    if (step < STEP_KEYS.length - 1) {
      const next = step + 1;
      setStep(next);
      return;
    }
    await bookingCompleted(id);
    Alert.alert(
      t('technician.jobComplete'),
      t('technician.customerWillApprove'),
      [{ text: t('common.ok'), onPress: () => router.replace('/(technician)/(tabs)' as never) }]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <RanzoAppBar title="Active job" showBack />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.customerRow}>
          {job.customerPhotoUri ? (
            <Image source={{ uri: job.customerPhotoUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPh}>
              <Text style={styles.avatarTxt}>{job.customerName.charAt(0)}</Text>
            </View>
          )}
          <View>
            <Text style={Typography.h1}>{job.customerName}</Text>
            <Text style={styles.masked}>{job.customerPhoneMasked}</Text>
          </View>
        </View>

        <Text style={Typography.h2}>{job.serviceName}</Text>
        <Text style={styles.muted}>
          {job.address}
        </Text>
        <RanzoButton
          label={t('technician.navigate')}
          variant="secondary"
          onPress={() =>
            Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(job.address)}`)
          }
        />
        {job.instructions ? <Text style={styles.instructions}>{job.instructions}</Text> : null}

        {currentLabel === 'Materials used' && (
          <RanzoTextField
            label={t('technician.materialsLabel')}
            value={materials}
            onChangeText={setMaterials}
            multiline
            placeholder="Copper wire, sealant, etc."
          />
        )}

        <RanzoButton label={currentLabel} onPress={onAction} />
        <Text style={styles.progress}>
          Step {step + 1} of {STEP_KEYS.length}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  loading: { padding: Spacing.lg },
  container: { padding: Spacing.lg, gap: Spacing.md },
  customerRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  avatarPh: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: { fontSize: 22, color: Colors.primary, fontWeight: '700' },
  masked: { ...Typography.caption },
  muted: { color: Colors.inkMuted },
  instructions: {
    ...Typography.body,
    backgroundColor: Colors.surfaceCanvas,
    padding: Spacing.md,
    borderRadius: 8,
  },
  progress: { ...Typography.caption, textAlign: 'center' },
});
