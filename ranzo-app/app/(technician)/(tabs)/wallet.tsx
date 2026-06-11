import React, { useCallback, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Colors, Spacing, Typography } from '@/core/theme';
import { RanzoButton, RanzoTextField } from '@/core/widgets';
import {
  getPendingPayouts,
  getTransactions,
  getWalletBalance,
  withdrawAmount,
} from '@/core/api/technician';

/** M-T07: Wallet */
export default function TechnicianWalletTab() {
  const [balance, setBalance] = useState(0);
  const [txns, setTxns] = useState<
    Array<{ id: string; type: 'credit' | 'debit'; amount: number; label: string; date: string }>
  >([]);
  const [pending, setPending] = useState<Array<{ id: string; amount: number; date: string }>>([]);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');

  const refresh = useCallback(() => {
    void getWalletBalance()
      .then((r) => setBalance(r.balance ?? 0))
      .catch(() => setBalance(0));
    void getTransactions()
      .then((r) => setTxns(r.items ?? []))
      .catch(() => setTxns([]));
    void getPendingPayouts()
      .then((r) => setPending(r.items ?? []))
      .catch(() => setPending([]));
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const withdraw = async () => {
    const n = Number(amount);
    if (!n || n > balance) {
      Alert.alert('Invalid amount', 'Enter an amount up to your balance.');
      return;
    }
    const res = await withdrawAmount(n);
    if (res.success) {
      setShowWithdraw(false);
      setAmount('');
      refresh();
      Alert.alert('Withdrawal initiated', `₹${n} requested.`);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.balance}>₹{balance.toLocaleString('en-IN')}</Text>
        <Text style={styles.lbl}>Available balance</Text>
        <RanzoButton label="Withdraw" onPress={() => setShowWithdraw(true)} />

        <Text style={styles.section}>Pending payouts</Text>
        {pending.length === 0 ? (
          <Text style={styles.row}>— None</Text>
        ) : (
          pending.map((p) => (
            <Text key={p.id} style={styles.row}>
              ₹{p.amount} · Processing · {p.date}
            </Text>
          ))
        )}

        <Text style={styles.section}>Transaction history</Text>
        {txns.map((t) => (
          <Text
            key={t.id}
            style={t.type === 'credit' ? styles.credit : styles.debit}
          >
            {t.type === 'credit' ? '+' : '−'} ₹{t.amount} · {t.label} · {t.date}
          </Text>
        ))}

        <RanzoButton
          label="Download GST summary"
          variant="ghost"
          onPress={() => Alert.alert('GST summary', 'Not available yet.')}
        />
      </ScrollView>

      <Modal visible={showWithdraw} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Text style={Typography.h2}>Withdraw</Text>
            <RanzoTextField
              label="Amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="number-pad"
              prefix="₹"
            />
            <RanzoButton label="Confirm withdrawal" onPress={withdraw} />
            <RanzoButton label="Cancel" variant="ghost" onPress={() => setShowWithdraw(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  container: { padding: Spacing.lg },
  balance: { fontSize: 36, fontWeight: '800', color: Colors.primary },
  lbl: { ...Typography.caption, marginBottom: Spacing.lg },
  section: { ...Typography.h2, marginTop: Spacing.xl, marginBottom: Spacing.sm },
  row: { ...Typography.caption },
  credit: { color: Colors.success, marginBottom: 4 },
  debit: { color: Colors.danger, marginBottom: 4 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: Colors.surfaceWhite,
    padding: Spacing.lg,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    gap: Spacing.md,
  },
});
