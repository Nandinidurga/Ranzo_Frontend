import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '@/core/theme';
import { RanzoAppBar, RanzoButton } from '@/core/widgets';
import { useJobsStore } from '@/data/store';

export default function NoWorkersScreen() {
  const router = useRouter();
  const job = useJobsStore((s) => s.pendingJob);
  const startMatching = useJobsStore((s) => s.startMatching);
  const cancelMatching = useJobsStore((s) => s.cancelMatching);
  const [loading, setLoading] = useState<'retry' | 'wide' | null>(null);

  const handleRetry = async (radius: 'normal' | 'wide') => {
    if (!job) return;
    setLoading(radius === 'wide' ? 'wide' : 'retry');
    startMatching(job, { radius });
    await new Promise((r) => setTimeout(r, 400));
    setLoading(null);
    router.replace('/(employer)/matching');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <RanzoAppBar title="No workers found" showBack />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.iconWrap}>
          <Ionicons name="sad-outline" size={64} color={Colors.primary} />
        </View>
        <Text style={[Typography.h1, styles.title]}>
          No workers nearby right now.
        </Text>
        <Text style={[Typography.body, styles.subtitle]}>
          Workers might be busy. Try again, or expand your search area.
        </Text>

        <View style={styles.tipsCard}>
          <Tip text="Most jobs match in 30–60 seconds during peak hours" />
          <Tip text="Try increasing pay slightly to attract more workers" />
          <Tip text="Posting again is free" />
        </View>

        <View style={{ flex: 1 }} />

        <View style={{ gap: Spacing.md }}>
          <RanzoButton
            label="Try Again"
            onPress={() => handleRetry('normal')}
            loading={loading === 'retry'}
          />
          <RanzoButton
            label="Expand area to 5 km"
            variant="secondary"
            onPress={() => handleRetry('wide')}
            loading={loading === 'wide'}
          />
          <RanzoButton
            label="Cancel job"
            variant="ghost"
            onPress={() => {
              cancelMatching();
              router.replace('/(employer)/dashboard');
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Tip({ text }: { text: string }) {
  return (
    <View style={styles.tipRow}>
      <Ionicons name="bulb-outline" size={18} color={Colors.warning} />
      <Text style={[Typography.body, { flex: 1 }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  scroll: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: Spacing.huge,
    flexGrow: 1,
  },
  iconWrap: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.lg,
  },
  title: { textAlign: 'center' },
  subtitle: {
    textAlign: 'center',
    color: Colors.inkMuted,
  },
  tipsCard: {
    backgroundColor: Colors.surfaceCanvas,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  tipRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
});
