import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography } from '@/core/theme';
import { RanzoAppBar, RanzoButton, RanzoTextField } from '@/core/widgets';
import { saveTechnicianPayout } from '@/core/api/technician';
import { useTechnicianStore } from '@/features/technician/stores/technicianStore';

/** M-T04: Bank / Razorpay payout setup */
export default function TechnicianPayoutsScreen() {
  const router = useRouter();
  const { payout, patchPayout, markPayoutComplete } = useTechnicianStore();
  const [loading, setLoading] = useState(false);

  const valid =
    payout.accountNumber.length >= 8 &&
    payout.ifsc.length === 11 &&
    payout.holderName.length >= 2;

  const save = async () => {
    setLoading(true);
    try {
      const res = await saveTechnicianPayout(payout);
      if (res.verified) {
        markPayoutComplete();
        Alert.alert(
          'Verified',
          'Razorpay contact + fund account created. Test deposit of ₹1 sent.'
        );
        router.replace('/(technician)/(tabs)' as never);
      } else {
        Alert.alert('Verification failed', 'Check account details and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <RanzoAppBar title="Payout account (4/4)" showBack />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={Typography.h1}>Bank details</Text>
        <Text style={styles.sub}>
          Razorpay creates contact + fund account. A small test deposit confirms your account.
        </Text>
        <RanzoTextField
          label="Account holder name"
          value={payout.holderName}
          onChangeText={(holderName) => patchPayout({ holderName })}
        />
        <RanzoTextField
          label="Account number"
          value={payout.accountNumber}
          onChangeText={(accountNumber) => patchPayout({ accountNumber })}
          keyboardType="number-pad"
        />
        <RanzoTextField
          label="IFSC"
          value={payout.ifsc}
          onChangeText={(ifsc) => patchPayout({ ifsc: ifsc.toUpperCase() })}
          autoCapitalize="characters"
          maxLength={11}
        />
        <RanzoButton label="Save & verify" onPress={save} loading={loading} disabled={!valid} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  container: { padding: Spacing.lg, gap: Spacing.md },
  sub: { ...Typography.caption, color: Colors.inkMuted },
});
