import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing, Typography } from '@/core/theme';

type Props = {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
};

/** Experience range 0–10+ years */
export function ExperienceRange({ min, max, onChange }: Props) {
  const setMin = (v: number) => onChange(Math.min(v, max), max);
  const setMax = (v: number) => onChange(min, Math.max(v, min));

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Experience required</Text>
      <Text style={styles.value}>
        {min}–{max >= 10 ? '10+' : max} years
      </Text>
      <View style={styles.row}>
        <Text style={styles.side}>Min</Text>
        <View style={styles.stepper}>
          <Pressable onPress={() => setMin(Math.max(0, min - 1))} style={styles.btn}>
            <Text style={styles.btnTxt}>−</Text>
          </Pressable>
          <Text style={styles.num}>{min}</Text>
          <Pressable onPress={() => setMin(Math.min(10, min + 1))} style={styles.btn}>
            <Text style={styles.btnTxt}>+</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.row}>
        <Text style={styles.side}>Max</Text>
        <View style={styles.stepper}>
          <Pressable onPress={() => setMax(Math.max(min, max - 1))} style={styles.btn}>
            <Text style={styles.btnTxt}>−</Text>
          </Pressable>
          <Text style={styles.num}>{max >= 10 ? '10+' : max}</Text>
          <Pressable onPress={() => setMax(Math.min(10, max + 1))} style={styles.btn}>
            <Text style={styles.btnTxt}>+</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.sm },
  label: { ...Typography.bodyStrong },
  value: { ...Typography.caption, color: Colors.primary, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  side: { width: 36, ...Typography.caption },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTxt: { fontSize: 20, color: Colors.primary, fontWeight: '700' },
  num: { ...Typography.h2, minWidth: 32, textAlign: 'center' },
});
