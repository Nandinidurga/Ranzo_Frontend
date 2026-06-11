import React, { useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import { Colors, Spacing, Typography } from '@/core/theme';
import { RanzoAppBar, RanzoButton, RanzoChip, RanzoTextField } from '@/core/widgets';
import { saveTechnicianWizardStep1 } from '@/core/api/technician';
import { useTechnicianWizardStore } from '@/features/technician/stores/wizardStore';

const GENDERS = [
  { id: 'male' as const, label: 'Male' },
  { id: 'female' as const, label: 'Female' },
  { id: 'other' as const, label: 'Other' },
];

/** M-T01: Personal info */
export default function TechnicianWizardStep1() {
  const router = useRouter();
  const { draft, patch, setStep } = useTechnicianWizardStore();
  const [showDob, setShowDob] = useState(false);
  const [loading, setLoading] = useState(false);

  const dobDate = draft.dateOfBirth ? new Date(draft.dateOfBirth) : new Date(1995, 0, 1);

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!res.canceled && res.assets[0]?.uri) patch({ photoUri: res.assets[0].uri });
  };

  const detectLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    const pos = await Location.getCurrentPositionAsync({});
    const [geo] = await Location.reverseGeocodeAsync(pos.coords);
    const line = [geo?.street, geo?.city, geo?.region].filter(Boolean).join(', ');
    patch({ location: line || `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}` });
  };

  const valid =
    draft.fullName.trim().length >= 2 &&
    draft.dateOfBirth &&
    draft.gender &&
    draft.location.trim().length > 3;

  const next = async () => {
    setLoading(true);
    try {
      await saveTechnicianWizardStep1(draft);
      setStep(2);
      router.push('/onboarding/technician/step-2' as never);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <RanzoAppBar title="Personal info (1/4)" showBack />
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable onPress={pickPhoto} style={styles.photoBox}>
          {draft.photoUri ? (
            <Image source={{ uri: draft.photoUri }} style={styles.photo} />
          ) : (
            <Text style={styles.photoPh}>+ Photo</Text>
          )}
        </Pressable>
        <RanzoTextField label="Full name" value={draft.fullName} onChangeText={(fullName) => patch({ fullName })} />
        <RanzoButton label={`DOB: ${draft.dateOfBirth ?? 'Select'}`} variant="secondary" onPress={() => setShowDob(true)} />
        {showDob && (
          <DateTimePicker
            value={dobDate}
            mode="date"
            maximumDate={new Date()}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, d) => {
              if (Platform.OS !== 'ios') setShowDob(false);
              if (d) patch({ dateOfBirth: d.toISOString().slice(0, 10) });
            }}
          />
        )}
        <Text style={styles.label}>Gender</Text>
        <View style={styles.chips}>
          {GENDERS.map((g) => (
            <RanzoChip key={g.id} label={g.label} selected={draft.gender === g.id} onPress={() => patch({ gender: g.id })} />
          ))}
        </View>
        <RanzoTextField label="Current location" value={draft.location} onChangeText={(location) => patch({ location })} />
        <RanzoButton label="Use current location" variant="ghost" onPress={detectLocation} />
        <RanzoButton label="Continue" onPress={next} loading={loading} disabled={!valid} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  container: { padding: Spacing.lg, gap: Spacing.md },
  photoBox: {
    alignSelf: 'center',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: { width: 96, height: 96 },
  photoPh: { ...Typography.caption, color: Colors.inkMuted },
  label: { ...Typography.bodyStrong },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
});
