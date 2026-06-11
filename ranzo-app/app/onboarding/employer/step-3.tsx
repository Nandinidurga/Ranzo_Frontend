import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { saveEmployerWizard } from '@/core/api/employer';
import { Colors, Spacing } from '@/core/theme';
import { RanzoAppBar, RanzoButton, RanzoTextField } from '@/core/widgets';
import { PlacesAutocomplete } from '@/features/employer/components/PlacesAutocomplete';
import { useEmployerWizardStore } from '@/features/employer/stores/wizardStore';

/** M-E03: Address & contact */
export default function EmployerWizardStep3() {
  const router = useRouter();
  const { draft, patch, markComplete } = useEmployerWizardStore();
  const [loading, setLoading] = useState(false);
  const valid =
    draft.address.trim().length > 5 &&
    draft.contactName.length >= 2 &&
    draft.contactEmail.includes('@');

  const finish = async () => {
    setLoading(true);
    try {
      await saveEmployerWizard(draft);
      markComplete();
      router.replace('/(employer)/(tabs)' as never);
    } catch (e: unknown) {
      Alert.alert('Save failed', (e as { message?: string })?.message ?? 'Try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <RanzoAppBar title="Address & contact (3/3)" showBack />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <PlacesAutocomplete
          label="Office address"
          value={draft.address}
          onChange={(address) => patch({ address })}
        />
        <RanzoTextField
          label="Hiring contact name"
          value={draft.contactName}
          onChangeText={(contactName) => patch({ contactName })}
        />
        <RanzoTextField
          label="Email"
          value={draft.contactEmail}
          onChangeText={(contactEmail) => patch({ contactEmail })}
          keyboardType="email-address"
        />
        <RanzoTextField
          label="Phone"
          value={draft.contactPhone}
          onChangeText={(contactPhone) => patch({ contactPhone })}
          keyboardType="phone-pad"
          prefix="+91"
        />
        <RanzoButton label="Finish setup" onPress={finish} loading={loading} disabled={!valid} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  container: { padding: Spacing.lg, gap: Spacing.md },
});
