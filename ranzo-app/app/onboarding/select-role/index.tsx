import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography } from '@/core/theme';
import { MainModeCard } from '@/features/onboarding/components/MainModeCard';
import { GoBackLink, RanzoAppBar, RanzoWordmark } from '@/core/widgets';
import { t } from '@/core/i18n';

/** M-005 step 1: WORK or JOB */
export default function SelectRoleMainScreen() {
  const router = useRouter();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/auth/login' as never);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <RanzoAppBar showBack onBack={goBack} />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <RanzoWordmark size={36} showTagline />
        <Text style={styles.subtitle}>{t('roleSelect.screenSubtitle')}</Text>

        <View style={styles.cards}>
          <MainModeCard
            variant="primary"
            icon="construct"
            title={t('roleSelect.workTitle')}
            subtitle={t('roleSelect.workSub')}
            onPress={() => router.push('/onboarding/select-role/work' as never)}
          />
          <MainModeCard
            variant="secondary"
            icon="briefcase"
            title={t('roleSelect.jobTitle')}
            subtitle={t('roleSelect.jobSub')}
            onPress={() => router.push('/onboarding/select-role/job' as never)}
          />
        </View>

        <GoBackLink onPress={goBack} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
    alignItems: 'center',
  },
  subtitle: {
    ...Typography.body,
    textAlign: 'center',
    color: Colors.inkMuted,
    width: '100%',
  },
  cards: {
    width: '100%',
    gap: Spacing.md,
  },
});
