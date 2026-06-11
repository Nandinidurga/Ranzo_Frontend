import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/core/theme';

export type BottomNavItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  href: string;
};

export type BottomNavProps = {
  items: BottomNavItem[];
};

export function BottomNav({ items }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.bar}>
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Pressable
            key={item.href}
            onPress={() => router.replace(item.href as never)}
            style={({ pressed }) => [
              styles.item,
              pressed && { opacity: 0.6 },
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Ionicons
              name={active ? item.iconActive : item.icon}
              size={24}
              color={active ? Colors.primary : Colors.inkMuted}
            />
            <Text
              style={[
                styles.label,
                { color: active ? Colors.primary : Colors.inkMuted },
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    gap: 2,
    minHeight: 44,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
