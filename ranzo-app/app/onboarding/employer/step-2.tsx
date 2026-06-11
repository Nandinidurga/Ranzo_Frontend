import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { verifyEmployerGst } from '@/core/api/employer';
import { Colors, Spacing, Typography } from '@/core/theme';
import { RanzoAppBar, RanzoButton, RanzoTextField } from '@/core/widgets';
import { useEmployerWizardStore } from '@/features/employer/stores/wizardStore';

const GST_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

/** M-E02: Verification */
export default function EmployerWizardStep2() {
  const router = useRouter();
  const { draft, patch, setStep } = useEmployerWizardStore();
  const [loading, setLoading] = useState(false);
  const gstOk = GST_RE.test(draft.gstin.trim().toUpperCase());

  const verifyGst = async () => {
    if (!gstOk) return;
    setLoading(true);
    try {
      const status = await verifyEmployerGst(draft.gstin.trim().toUpperCase());
      patch({ gstStatus: status });
      if (status === 'verified') {
        Alert.alert('Verified ✓', 'GSTIN matched successfully.');
      } else {
        Alert.alert('Pending review', 'GSTIN submitted for manual review.');
      }
    } finally {
      setLoading(false);
    }
  };

  const next = () => {
    setStep(3);
    router.push('/onboarding/employer/step-3' as never);
  };

  const canContinue = draft.gstStatus === 'verified' || draft.gstStatus === 'pending';

  return (
    <SafeAreaView style={styles.safe}>
      <RanzoAppBar title="Verification (2/3)" showBack />
      <ScrollView contentContainerStyle={styles.container}>
        <RanzoTextField
          label="GSTIN (15 chars)"
          value={draft.gstin}
          onChangeText={(gstin) => patch({ gstin: gstin.toUpperCase(), gstStatus: 'none' })}
          autoCapitalize="characters"
          maxLength={15}
        />
        <RanzoButton
          label="Verify GST"
          variant="secondary"
          onPress={verifyGst}
          loading={loading}
          disabled={!gstOk}
        />
        {draft.gstStatus === 'verified' ? (
          <Text style={styles.ok}>Verified ✓</Text>
        ) : draft.gstStatus === 'pending' ? (
          <Text style={styles.pending}>Pending review</Text>
        ) : (
          <Text style={styles.pending}>Verify GST to continue</Text>
        )}
        <RanzoTextField
          label="PAN (optional)"
          value={draft.pan}
          onChangeText={(pan) => patch({ pan: pan.toUpperCase() })}
          maxLength={10}
        />
        <RanzoTextField label="MSME (optional)" value={draft.msme} onChangeText={(msme) => patch({ msme })} />
        <RanzoButton label="Continue" onPress={next} disabled={!canContinue} />
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
