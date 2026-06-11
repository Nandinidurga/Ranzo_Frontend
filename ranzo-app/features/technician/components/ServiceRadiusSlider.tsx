import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing, Typography } from '@/core/theme';

type Props = {
  value: number;
  min?: number;
  max?: number;
  onChange: (km: number) => void;
};

export function ServiceRadiusSlider({ value, min = 1, max = 25, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Service radius</Text>
      <Text style={styles.value}>{value} km</Text>
      <View style={styles.row}>
        <Pressable
          style={styles.btn}
          onPress={() => onChange(Math.max(min, value - 1))}
        >
          <Text style={styles.btnTxt}>−</Text>
        </Pressable>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${((value - min) / (max - min)) * 100}%` }]} />
        </View>
        <Pressable
          style={styles.btn}
          onPress={() => onChange(Math.min(max, value + 1))}
        >
          <Text style={styles.btnTxt}>+</Text>
        </Pressable>
      </View>
      <Text style={styles.hint}>{min}–{max} km from your location</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.sm },
  label: { ...Typography.bodyStrong },
  value: { ...Typography.caption, color: Colors.primary, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTxt: { fontSize: 20, color: Colors.primary, fontWeight: '700' },
  track: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.divider,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: Colors.primary },
  hint: { ...Typography.caption, color: Colors.inkMuted },
});
