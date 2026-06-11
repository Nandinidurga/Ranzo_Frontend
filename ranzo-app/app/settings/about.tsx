import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography } from '@/core/theme';
import { RanzoAppBar } from '@/core/widgets';
import { useTranslation } from '@/core/i18n';

/** M-X06: About */
export default function AboutScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const build = Constants.expoConfig?.ios?.buildNumber ?? Constants.expoConfig?.android?.versionCode ?? '1';

  return (
    <SafeAreaView style={styles.safe}>
      <RanzoAppBar title={t('settings.aboutTitle')} showBack />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={Typography.h1}>Ranzo</Text>
        <Text>{t('settings.version', { version, build })}</Text>
        <Pressable onPress={() => router.push('/auth/legal?doc=terms' as never)}>
          <Text style={styles.link}>{t('settings.terms')}</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/auth/legal?doc=privacy' as never)}>
          <Text style={styles.link}>{t('settings.privacyTitle')}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  container: { padding: Spacing.lg, gap: Spacing.md },
  link: { color: Colors.primary },
});
