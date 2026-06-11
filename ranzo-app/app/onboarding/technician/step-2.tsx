import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography } from '@/core/theme';
import { RanzoAppBar, RanzoButton, RanzoTextField } from '@/core/widgets';
import { verifyTechnicianAadhaar } from '@/core/api/technician';
import { useTechnicianWizardStore } from '@/features/technician/stores/wizardStore';

/** M-T02: Aadhaar verification */
export default function TechnicianWizardStep2() {
  const router = useRouter();
  const { draft, patch, setStep } = useTechnicianWizardStore();
  const [loading, setLoading] = useState(false);

  const aadhaarOk = /^\d{12}$/.test(draft.aadhaar);

  const verifyNumber = async () => {
    if (!aadhaarOk) return;
    setLoading(true);
    try {
      const res = await verifyTechnicianAadhaar(draft.aadhaar);
      if (res.verified) patch({ aadhaarVerified: true });
    } finally {
      setLoading(false);
    }
  };

  const openDigiLocker = () => {
    router.push('/onboarding/technician/digilocker' as never);
  };

  const next = () => {
    setStep(3);
    router.push('/onboarding/technician/step-3' as never);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <RanzoAppBar title="Aadhaar (2/4)" showBack />
      <ScrollView contentContainerStyle={styles.container}>
        <RanzoTextField
          label="Aadhaar number"
          value={draft.aadhaar}
          onChangeText={(aadhaar) => patch({ aadhaar: aadhaar.replace(/\D/g, '').slice(0, 12), aadhaarVerified: false })}
          keyboardType="number-pad"
          maxLength={12}
        />
        <RanzoButton label="Verify number" variant="secondary" onPress={verifyNumber} loading={loading} disabled={!aadhaarOk} />
        {draft.aadhaarVerified ? (
          <Text style={styles.ok}>Verified ✓</Text>
        ) : (
          <Text style={styles.pending}>Complete DigiLocker authorization below</Text>
        )}
        <RanzoButton label="Authorize with DigiLocker" onPress={openDigiLocker} />
        <RanzoButton label="Continue" onPress={next} disabled={!draft.aadhaarVerified} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  container: { padding: Spacing.lg, gap: Spacing.md },
  ok: { color: Colors.success, fontWeight: '700' },
  pending: { ...Typography.caption, color: Colors.inkMuted },
});
