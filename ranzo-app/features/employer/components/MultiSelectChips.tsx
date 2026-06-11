import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing, Typography } from '@/core/theme';
import { RanzoChip } from '@/core/widgets';

type Props = {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  max?: number;
};

export function MultiSelectChips({ label, options, selected, onChange, max }: Props) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt));
      return;
    }
    if (max != null && selected.length >= max) return;
    onChange([...selected, opt]);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chips}>
        {options.map((opt) => (
          <RanzoChip
            key={opt}
            label={opt}
            selected={selected.includes(opt)}
            onPress={() => toggle(opt)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.sm },
  label: { ...Typography.bodyStrong },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
});
