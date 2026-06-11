import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '@/core/theme';
import { RanzoAppBar, RanzoButton } from '@/core/widgets';
import {
  getBillingHistory,
  getSubscriptionTier,
  upgradeSubscription,
} from '@/core/api/employer';
import type { SubscriptionTier } from '@/features/job-portal/employerPortal';

const PLANS: {
  id: SubscriptionTier;
  name: string;
  price: string;
  features: string[];
}[] = [
  { id: 'free', name: 'Free', price: '₹0', features: ['2 active jobs', 'Basic listing'] },
  {
    id: 'standard',
    name: 'Standard',
    price: '₹999/mo',
    features: ['10 jobs', 'Priority support', 'Applicant filters'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '₹2999/mo',
    features: ['Unlimited jobs', 'Boost credits', 'Analytics', 'Walk-in drives'],
  },
];

/** M-E15: Subscription */
export default function SubscriptionScreen() {
  const [tier, setTier] = useState(getSubscriptionTier());
  const [billing, setBilling] = useState(getBillingHistory());

  const onUpgrade = (plan: SubscriptionTier) => {
    if (plan === 'free') return;
    upgradeSubscription(plan);
    setTier(getSubscriptionTier());
    setBilling(getBillingHistory());
    Alert.alert('Upgraded', `You are now on the ${plan} plan.`);
  };

  const updatePayment = () => {
    Alert.alert('Payment method', 'Card ending 4242 updated (demo).');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <RanzoAppBar title="Subscription" showBack />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.currentCard}>
          <Text style={styles.currentLabel}>Current plan</Text>
          <Text style={styles.currentName}>
            {tier.charAt(0).toUpperCase() + tier.slice(1)}
          </Text>
        </View>

        {PLANS.map((p) => (
          <View key={p.id} style={[styles.card, tier === p.id && styles.cardActive]}>
            <Text style={Typography.h2}>{p.name}</Text>
            <Text style={styles.price}>{p.price}</Text>
            <Text style={styles.feat}>{p.features.join(' · ')}</Text>
            {p.id !== tier && p.id !== 'free' ? (
              <RanzoButton label={`Upgrade to ${p.name}`} onPress={() => onUpgrade(p.id)} />
            ) : tier === p.id ? (
              <Text style={styles.activeTag}>Current plan</Text>
            ) : null}
          </View>
        ))}

        <Text style={Typography.h2}>Billing history</Text>
        {billing.length === 0 ? (
          <Text style={styles.row}>— No charges yet</Text>
        ) : (
          billing.map((b) => (
            <View key={b.id} style={styles.billRow}>
              <Text style={styles.row}>{b.date}</Text>
              <Text style={styles.row}>{b.description}</Text>
              <Text style={styles.amount}>{b.amount}</Text>
            </View>
          ))
        )}
        <RanzoButton label="Update payment method" variant="secondary" onPress={updatePayment} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  container: { padding: Spacing.lg, gap: Spacing.md },
  currentCard: {
    backgroundColor: Colors.primarySoft,
    padding: Spacing.md,
    borderRadius: 12,
  },
  currentLabel: { ...Typography.caption },
  currentName: { ...Typography.h1, color: Colors.primary },
  card: { backgroundColor: Colors.surfaceCanvas, padding: Spacing.md, borderRadius: 8, gap: Spacing.sm },
  cardActive: { borderWidth: 2, borderColor: Colors.primary },
  price: { fontWeight: '700' },
  feat: { ...Typography.caption },
  activeTag: { color: Colors.success, fontWeight: '700' },
  row: { ...Typography.caption },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  amount: { fontWeight: '700' },
});
