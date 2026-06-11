import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography } from '@/core/theme';
import { RanzoButton } from '@/core/widgets';
import { useTranslation } from '@/core/i18n';
import { useAuthStore } from '@/data/store';
import { useSeekerWizardStore } from '@/features/seeker/stores/wizardStore';

export default function SeekerProfileTab() {
  const { t } = useTranslation();
  const router = useRouter();
  const signOut = useAuthStore((s) => s.signOut);
  const draft = useSeekerWizardStore((s) => s.draft);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={Typography.h1}>{draft.fullName || t('seeker.yourProfile')}</Text>
        <Text style={styles.muted}>{draft.city}</Text>
        <Text style={styles.muted}>
          {t('seeker.skillsListed', { count: draft.skills.length })}
        </Text>

        <RanzoButton
          label={t('seeker.editProfileWizard')}
          variant="secondary"
          onPress={() => router.push('/onboarding/seeker/preview')}
        />
        <RanzoButton
          label={t('seeker.myApplications')}
          onPress={() => router.push('/(seeker)/applications' as never)}
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
          <Text style={styles.signOut}>{t('menus.signOut')}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  container: { padding: Spacing.lg, gap: Spacing.md },
  muted: { ...Typography.caption, color: Colors.inkMuted },
  signOut: { color: Colors.danger, textAlign: 'center', marginTop: Spacing.xl, fontWeight: '700' },
});
