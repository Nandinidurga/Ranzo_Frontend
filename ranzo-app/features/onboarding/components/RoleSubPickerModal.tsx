import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '@/core/theme';
import type { PlatformRole } from '@/data/models';

export type RoleSubOption = {
  id: PlatformRole;
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
};

type Props = {
  visible: boolean;
  title: string;
  options: RoleSubOption[];
  loading?: boolean;
  selected?: PlatformRole | null;
  onClose: () => void;
  onSelect: (role: PlatformRole) => void;
};

export function RoleSubPickerModal({
  visible,
  title,
  options,
  loading,
  selected,
  onClose,
  onSelect,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.sheetTitle}>{title}</Text>
          <View style={styles.options}>
            {options.map((opt) => (
              <Pressable
                key={opt.id}
                disabled={loading}
                onPress={() => onSelect(opt.id)}
                style={({ pressed }) => [
                  styles.option,
                  selected === opt.id && styles.optionSelected,
                  pressed && !loading && styles.optionPressed,
                ]}
              >
                <View style={styles.optionIcon}>
                  <MaterialCommunityIcons name={opt.icon} size={28} color={Colors.primary} />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>{opt.title}</Text>
                  <Text style={styles.optionSub}>{opt.subtitle}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.primary} />
              </Pressable>
            ))}
          </View>
          <Pressable onPress={onClose} hitSlop={12} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(30, 20, 40, 0.55)',
    justifyContent: 'flex-end',
    padding: Spacing.lg,
  },
  sheet: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  sheetTitle: {
    ...Typography.h2,
    textAlign: 'center',
    color: Colors.inkNavy,
  },
  options: {
    gap: Spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.divider,
    backgroundColor: Colors.surfaceWhite,
  },
  optionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySoft,
  },
  optionPressed: {
    opacity: 0.9,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    ...Typography.bodyStrong,
    color: Colors.inkNavy,
  },
  optionSub: {
    ...Typography.caption,
    color: Colors.inkMuted,
    marginTop: 2,
  },
  cancelBtn: {
    alignSelf: 'center',
    paddingVertical: Spacing.sm,
  },
  cancelText: {
    ...Typography.caption,
    color: Colors.inkMuted,
    fontWeight: '700',
  },
});
