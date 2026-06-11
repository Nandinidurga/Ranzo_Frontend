import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Elevation, Radius, Spacing, Typography } from '@/core/theme';

type Props = {
  variant: 'primary' | 'secondary';
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  disabled?: boolean;
};

export function MainModeCard({
  variant,
  icon,
  title,
  subtitle,
  onPress,
  disabled,
}: Props) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.card,
        isPrimary ? styles.cardPrimary : styles.cardSecondary,
        pressed && !disabled && (isPrimary ? styles.cardPrimaryPressed : styles.cardSecondaryPressed),
        disabled && styles.disabled,
      ]}
    >
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: isPrimary ? Colors.primaryDark : Colors.primarySoft },
        ]}
      >
        <Ionicons
          name={icon}
          size={28}
          color={isPrimary ? Colors.white : Colors.primary}
        />
      </View>
      <View style={styles.textBlock}>
        <Text style={[styles.title, { color: isPrimary ? Colors.white : Colors.primary }]}>
          {title}
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: isPrimary ? Colors.primarySoft : Colors.inkBody },
          ]}
        >
          {subtitle}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={22}
        color={isPrimary ? Colors.white : Colors.primary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 112,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    ...Elevation.card,
  },
  cardPrimary: {
    backgroundColor: Colors.primary,
  },
  cardPrimaryPressed: {
    backgroundColor: Colors.primaryDark,
  },
  cardSecondary: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  cardSecondaryPressed: {
    backgroundColor: Colors.primarySoft,
  },
  disabled: {
    opacity: 0.55,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    ...Typography.caption,
    marginTop: 2,
  },
});
