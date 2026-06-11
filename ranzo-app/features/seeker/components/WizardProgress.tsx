import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing, Typography } from '@/core/theme';

type Props = { step: number; total?: number; title: string };

export function WizardProgress({ step, total = 5, title }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.step}>
        Step {step} of {total}
      </Text>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.bar}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i < step && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.xs, marginBottom: Spacing.lg },
  step: { ...Typography.caption, color: Colors.inkMuted },
  title: { ...Typography.h2 },
  bar: { flexDirection: 'row', gap: 6, marginTop: Spacing.xs },
  dot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.divider,
  },
  dotActive: { backgroundColor: Colors.primary },
});
