import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Typography } from '@/core/theme';
import { RanzoButton, SuccessCheckmark } from '@/core/widgets';
import { t, useI18nStore } from '@/core/i18n';

export default function RegisterSuccessScreen() {
  const router = useRouter();
  const locale = useI18nStore((s) => s.locale);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, []);

  const goToLogin = () => {
    router.replace('/auth/login');
  };

  return (
    <SafeAreaView key={locale} style={styles.safe} edges={['top', 'bottom']}>
      <LinearGradient
        colors={[Colors.surfaceWhite, Colors.successSoft, Colors.surfaceWhite]}
        locations={[0, 0.45, 1]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <SuccessCheckmark />
          <Text style={Typography.h1}>{t('auth.registerSuccessTitle')}</Text>
          <Text style={[Typography.body, styles.subtitle]}>
            {t('auth.registerSuccessSubtitle')}
          </Text>
        </View>
        <View style={styles.footer}>
          <RanzoButton label={t('auth.goToLogin')} onPress={goToLogin} />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  gradient: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  subtitle: {
    color: Colors.inkMuted,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
});
