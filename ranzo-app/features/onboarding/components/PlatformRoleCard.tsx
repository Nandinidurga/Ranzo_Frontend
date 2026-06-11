import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '@/core/theme';
import { t } from '@/core/i18n';
import type { RoleSelectCard } from '@/core/onboarding/constants';

type Props = {
  card: RoleSelectCard;
  onPress: () => void;
  disabled?: boolean;
  selected?: boolean;
};

export function PlatformRoleCard({ card, onPress, disabled, selected }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={t(card.titleKey)}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && !disabled && styles.cardPressed,
        disabled && styles.cardDisabled,
      ]}
    >
      <View style={[styles.iconCircle, selected && styles.iconCircleSelected]}>
        <MaterialCommunityIcons
          name={card.icon}
          size={32}
          color={selected ? Colors.white : Colors.primary}
        />
      </View>
      <View style={styles.textBlock}>
        <Text style={[styles.title, selected && styles.titleSelected]}>
          {t(card.titleKey)}
        </Text>
        <Text style={[styles.subtitle, selected && styles.subtitleSelected]}>
          {t(card.subtitleKey)}
        </Text>
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={28}
        color={selected ? Colors.white : Colors.primary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 88,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.divider,
    backgroundColor: Colors.surfaceWhite,
    gap: Spacing.md,
  },
  cardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  cardPressed: {
    opacity: 0.92,
  },
  cardDisabled: {
    opacity: 0.55,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleSelected: {
    backgroundColor: Colors.primaryDark,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    ...Typography.bodyStrong,
    fontSize: 18,
    color: Colors.inkNavy,
  },
  titleSelected: {
    color: Colors.white,
  },
  subtitle: {
    ...Typography.caption,
    marginTop: 4,
    color: Colors.inkMuted,
  },
  subtitleSelected: {
    color: Colors.primarySoft,
  },
});
