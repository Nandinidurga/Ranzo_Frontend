import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '@/core/theme';
import { RanzoTextField } from '@/core/widgets';
import { PLACE_SUGGESTIONS } from '@/features/employer/constants';

type Props = {
  label: string;
  value: string;
  onChange: (address: string) => void;
  placeholder?: string;
};

/** Google Places–style autocomplete (offline suggestions). */
export function PlacesAutocomplete({ label, value, onChange, placeholder }: Props) {
  const [focused, setFocused] = useState(false);
  const suggestions = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (q.length < 2) return [];
    return PLACE_SUGGESTIONS.filter((p) => p.toLowerCase().includes(q)).slice(0, 5);
  }, [value]);

  return (
    <View style={styles.wrap}>
      <RanzoTextField
        label={label}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder ?? 'Start typing address…'}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 200)}
      />
      {focused && suggestions.length > 0 ? (
        <View style={styles.list}>
          <FlatList
            keyboardShouldPersistTaps="handled"
            data={suggestions}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Pressable
                style={styles.row}
                onPress={() => {
                  onChange(item);
                  setFocused(false);
                }}
              >
                <Text style={styles.rowText}>{item}</Text>
              </Pressable>
            )}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { zIndex: 10 },
  list: {
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceWhite,
    maxHeight: 160,
    marginTop: -Spacing.sm,
  },
  row: { padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  rowText: { ...Typography.caption },
});
