import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Elevation, Radius, Spacing, Typography } from '@/core/theme';
import { RanzoButton } from '@/core/widgets/RanzoButton';
import { useAuthStore } from '@/data/store';
import { t } from '@/core/i18n';

type Props = {
  profileHref: '/(worker)/profile' | '/(employer)/profile';
};

export function CompleteProfileBanner({ profileHref }: Props) {
  const router = useRouter();
  const isDetailsFilled = useAuthStore((s) => s.isDetailsFilled);

  if (isDetailsFilled) return null;

  return (
    <View style={styles.card}>
      <Text style={Typography.h2}>{t('profile.completeBannerTitle')}</Text>
      <Text style={[Typography.body, styles.subtitle]}>
        {t('profile.completeBannerSubtitle')}
      </Text>
      <RanzoButton
        label={t('profile.completeProfileCta')}
        onPress={() => router.push(profileHref)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.primarySoft,
    gap: Spacing.sm,
    ...Elevation.card,
  },
  subtitle: { color: Colors.inkMuted },
});
