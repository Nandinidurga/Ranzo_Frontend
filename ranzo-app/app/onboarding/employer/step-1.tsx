import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { goBackToRoleSelectJob } from '@/core/navigation/roleFlow';
import { saveEmployerWizard } from '@/core/api/employer';
import { Colors, Spacing, Typography } from '@/core/theme';
import { RanzoAppBar, RanzoButton, RanzoChip, RanzoTextField } from '@/core/widgets';
import { COMPANY_SIZES, INDUSTRIES } from '@/features/employer/constants';
import { useEmployerWizardStore } from '@/features/employer/stores/wizardStore';

/** M-E01: Company info */
export default function EmployerWizardStep1() {
  const router = useRouter();
  const { draft, patch, setStep } = useEmployerWizardStore();
  const [loading, setLoading] = useState(false);
  const valid = draft.companyName.trim().length >= 2 && draft.industry.length > 0;

  const pickLogo = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo access to upload a company logo.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!res.canceled && res.assets[0]?.uri) {
      patch({ logoUri: res.assets[0].uri });
    }
  };

  const next = async () => {
    setLoading(true);
    try {
      await saveEmployerWizard(draft);
      setStep(2);
      router.push('/onboarding/employer/step-2' as never);
    } catch (e: unknown) {
      Alert.alert('Save failed', (e as { message?: string })?.message ?? 'Try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <RanzoAppBar title="Company profile (1/3)" showBack onBack={() => goBackToRoleSelectJob(router)} />
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable onPress={pickLogo} style={styles.logoBox}>
          {draft.logoUri ? (
            <Image source={{ uri: draft.logoUri }} style={styles.logo} />
          ) : (
            <Text style={styles.logoPlaceholder}>+ Company logo</Text>
          )}
        </Pressable>
        <RanzoTextField
          label="Company name"
          value={draft.companyName}
          onChangeText={(companyName) => patch({ companyName })}
        />
        <Text style={styles.sectionLabel}>Industry</Text>
        <View style={styles.chips}>
          {INDUSTRIES.map((ind) => (
            <RanzoChip
              key={ind}
              label={ind}
              selected={draft.industry === ind}
              onPress={() => patch({ industry: ind })}
            />
          ))}
        </View>
        <RanzoTextField
          label="Sub-industry"
          value={draft.subIndustry}
          onChangeText={(subIndustry) => patch({ subIndustry })}
        />
        <Text style={styles.sectionLabel}>Company size</Text>
        <View style={styles.chips}>
          {COMPANY_SIZES.map((sz) => (
            <RanzoChip
              key={sz}
              label={sz}
              selected={draft.companySize === sz}
              onPress={() => patch({ companySize: sz })}
            />
          ))}
        </View>
        <RanzoTextField
          label="Year established"
          value={draft.yearEstablished}
          onChangeText={(yearEstablished) => patch({ yearEstablished })}
          keyboardType="number-pad"
        />
        <RanzoButton label="Continue" onPress={next} loading={loading} disabled={!valid} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  container: { padding: Spacing.lg, gap: Spacing.md },
  logoBox: {
    alignSelf: 'center',
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: { width: 100, height: 100 },
  logoPlaceholder: { ...Typography.caption, color: Colors.inkMuted, textAlign: 'center' },
  sectionLabel: { ...Typography.bodyStrong },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
});
