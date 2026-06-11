import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '@/core/theme';
import { useJobsStore } from '@/data/store';

const NO_WORKERS_TIMEOUT = 90_000;

export default function MatchingScreen() {
  const router = useRouter();
  const pingedCount = useJobsStore((s) => s.pingedCount);
  const acceptedCount = useJobsStore((s) => s.acceptedCount);
  const cancelMatching = useJobsStore((s) => s.cancelMatching);
  const job = useJobsStore((s) => s.pendingJob);

  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;
  const ripple3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, {
            toValue: 1,
            duration: 2000,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      );
    const a = loop(ripple1, 0);
    const b = loop(ripple2, 700);
    const c = loop(ripple3, 1400);
    a.start();
    b.start();
    c.start();
    return () => {
      a.stop();
      b.stop();
      c.stop();
    };
  }, [ripple1, ripple2, ripple3]);

  useEffect(() => {
    if (acceptedCount >= 1) {
      const t = setTimeout(() => {
        router.replace('/(employer)/workers');
      }, 800);
      return () => clearTimeout(t);
    }
  }, [acceptedCount, router]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (acceptedCount === 0) {
        router.replace('/(employer)/no-workers');
      }
    }, NO_WORKERS_TIMEOUT);
    return () => clearTimeout(t);
  }, [router, acceptedCount]);

  const handleCancel = () => {
    cancelMatching();
    router.replace('/(employer)/dashboard');
  };

  if (!job) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text>No job pending.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.radarBox}>
          <Ripple anim={ripple1} />
          <Ripple anim={ripple2} />
          <Ripple anim={ripple3} />
          <View style={styles.center}>
            <View style={styles.coreCircle}>
              <Ionicons name="radio" size={40} color={Colors.white} />
            </View>
          </View>
        </View>

        <Text style={[Typography.h1, { textAlign: 'center' }]}>
          Finding workers nearby…
        </Text>
        <Text style={[Typography.body, styles.helper]}>
          We're pinging workers in your area for {job.type} jobs.
        </Text>

        <View style={styles.statsCard}>
          <Stat
            icon="wifi"
            label="Pinged"
            value={pingedCount}
            color={Colors.primary}
          />
          <View style={styles.divider} />
          <Stat
            icon="checkmark-circle"
            label="Accepted"
            value={acceptedCount}
            color={Colors.success}
          />
        </View>

        {acceptedCount > 0 && (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={[Typography.bodyStrong, { color: Colors.success, flex: 1 }]}>
              Worker accepted. Loading list…
            </Text>
          </View>
        )}

        <Pressable
          onPress={handleCancel}
          style={({ pressed }) => [styles.cancel, pressed && { opacity: 0.6 }]}
          hitSlop={8}
        >
          <Text style={styles.cancelText}>Cancel job</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Stat({
  icon,
  label,
  value,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={{ fontSize: 26, fontWeight: '800', color }}>{value}</Text>
      <Text style={Typography.caption}>{label}</Text>
    </View>
  );
}

function Ripple({ anim }: { anim: Animated.Value }) {
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 2.5] });
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });
  return (
    <Animated.View
      style={[
        styles.ripple,
        { opacity, transform: [{ scale }] },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  container: {
    flex: 1,
    padding: Spacing.lg,
    gap: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarBox: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
  },
  center: { alignItems: 'center', justifyContent: 'center' },
  coreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helper: {
    color: Colors.inkMuted,
    textAlign: 'center',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceCanvas,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignSelf: 'stretch',
  },
  divider: { width: 1, backgroundColor: Colors.divider },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.successSoft,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignSelf: 'stretch',
  },
  cancel: {
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  cancelText: {
    color: Colors.danger,
    fontWeight: '700',
    fontSize: 14,
  },
});
