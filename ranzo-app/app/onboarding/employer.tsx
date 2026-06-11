import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography } from '@/core/theme';
import { RanzoAppBar, EmployerProfileForm } from '@/core/widgets';
import { navigateToPrimaryRoleHome } from '@/core/api/session';
import { t } from '@/core/i18n';
import { useAuthStore } from '@/data/store';

/** Profile wizard for employer / customer (M-005 next step). */
export default function EmployerOnboardingScreen() {
  const router = useRouter();
  const primaryRole = useAuthStore((s) => s.primaryRole);

  const title =
    primaryRole === 'customer'
      ? t('profile.customerFormTitle')
      : t('profile.employerFormTitle');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <RanzoAppBar title={title} showBack />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.hint}>
          {primaryRole === 'customer'
            ? t('profile.customerFormHint')
            : t('profile.employerFormHint')}
        </Text>
        <EmployerProfileForm
          mode="add"
          onSaved={() => navigateToPrimaryRoleHome(router)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  container: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  hint: {
    ...Typography.body,
    color: Colors.inkMuted,
  },
});
