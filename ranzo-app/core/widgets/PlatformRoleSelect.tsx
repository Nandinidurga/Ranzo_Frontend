import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '@/core/theme';
import type { PlatformRole } from '@/data/models';

export type PlatformRoleOption = {
  value: PlatformRole;
  label: string;
};

export type PlatformRoleSelectProps = {
  label: string;
  value: PlatformRole;
  options: PlatformRoleOption[];
  onChange: (value: PlatformRole) => void;
};

export function PlatformRoleSelect({
  label,
  value,
  options,
  onChange,
}: PlatformRoleSelectProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.box}>
        {options.map((opt, index) => {
          const selected = value === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.option,
                index < options.length - 1 && styles.optionBorder,
                selected && styles.optionSelected,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  selected && styles.optionTextSelected,
                ]}
              >
                {opt.label}
              </Text>
              {selected ? (
                <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
              ) : (
                <Ionicons name="ellipse-outline" size={22} color={Colors.inkMuted} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.sm },
  label: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.inkNavy,
  },
  box: {
    borderWidth: 1.5,
    borderColor: Colors.divider,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 52,
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  optionSelected: {
    backgroundColor: Colors.primarySoft,
  },
  optionText: {
    ...Typography.bodyStrong,
    color: Colors.inkBody,
  },
  optionTextSelected: {
    color: Colors.primary,
  },
});
