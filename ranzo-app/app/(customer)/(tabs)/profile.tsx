import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography } from '@/core/theme';
import { RanzoButton } from '@/core/widgets';
import { useTranslation } from '@/core/i18n';
import { useCustomerStore } from '@/features/customer/stores/customerStore';
import { useAuthStore } from '@/data/store';

export default function CustomerProfileTab() {
  const { t } = useTranslation();
  const router = useRouter();
  const profile = useCustomerStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={Typography.h1}>
          {profile.fullName || t('customer.profileFallback')}
        </Text>
        <Text style={styles.muted}>{profile.email || t('customer.noEmail')}</Text>
        <Text style={styles.muted}>{profile.city}</Text>
        <RanzoButton
          label={t('menus.editProfile')}
          variant="secondary"
          onPress={() => router.push('/onboarding/customer/profile' as never)}
        />
        <RanzoButton
          label={t('menus.manageAddresses')}
          onPress={() => router.push('/onboarding/customer/addresses' as never)}
        />
        <RanzoButton
          label={t('menus.language')}
          variant="ghost"
          onPress={() => router.push('/language' as never)}
        />
        <RanzoButton
          label={t('menus.notifications')}
          variant="ghost"
          onPress={() => router.push('/settings/notifications' as never)}
        />
        <RanzoButton
          label={t('menus.privacy')}
          variant="ghost"
          onPress={() => router.push('/settings/privacy' as never)}
        />
        <RanzoButton
          label={t('menus.help')}
          variant="ghost"
          onPress={() => router.push('/settings/help' as never)}
        />
        <RanzoButton
          label={t('menus.about')}
          variant="ghost"
          onPress={() => router.push('/settings/about' as never)}
        />
        <Pressable onPress={() => signOut().then(() => router.replace('/auth/login'))}>
          <Text style={styles.out}>{t('menus.signOut')}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  container: { padding: Spacing.lg, gap: Spacing.md },
  muted: { ...Typography.caption, color: Colors.inkMuted },
  out: { color: Colors.danger, textAlign: 'center', marginTop: Spacing.xl, fontWeight: '700' },
});
