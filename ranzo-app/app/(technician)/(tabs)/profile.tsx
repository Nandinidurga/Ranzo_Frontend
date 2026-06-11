import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography } from '@/core/theme';
import { useTranslation } from '@/core/i18n';
import { useAuthStore } from '@/data/store';

/** M-X01: Technician profile */
export default function TechnicianProfileTab() {
  const { t } = useTranslation();
  const router = useRouter();
  const signOut = useAuthStore((s) => s.signOut);

  const MENU = [
    { labelKey: 'menus.editProfile', path: '/onboarding/technician/step-1' },
    { labelKey: 'menus.payoutSettings', path: '/onboarding/technician/payouts' },
    { labelKey: 'menus.notifications', path: '/settings/notifications' },
    { labelKey: 'menus.language', path: '/language' },
    { labelKey: 'menus.privacy', path: '/settings/privacy' },
    { labelKey: 'menus.help', path: '/settings/help' },
    { labelKey: 'menus.about', path: '/settings/about' },
  ] as const;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={Typography.h1}>{t('menus.technician')}</Text>
        <Text style={styles.badge}>{t('menus.provideServices')}</Text>
        {MENU.map((m) => (
          <Pressable key={m.path} style={styles.item} onPress={() => router.push(m.path as never)}>
            <Text>{t(m.labelKey)}</Text>
          </Pressable>
        ))}
        <Pressable onPress={() => signOut().then(() => router.replace('/auth/login'))}>
          <Text style={styles.out}>{t('menus.logout')}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  container: { padding: Spacing.lg },
  badge: { color: Colors.primary, marginBottom: Spacing.lg },
  item: { paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  out: { color: Colors.danger, textAlign: 'center', marginTop: Spacing.xl, fontWeight: '700' },
});
