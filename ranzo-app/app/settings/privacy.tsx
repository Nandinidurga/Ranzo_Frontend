import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography } from '@/core/theme';
import { RanzoAppBar } from '@/core/widgets';
import { useTranslation } from '@/core/i18n';

/** M-X04: Privacy */
export default function PrivacySettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <RanzoAppBar title={t('settings.privacyTitle')} showBack />
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable onPress={() => router.push('/auth/legal?doc=terms' as never)}>
          <Text style={styles.link}>{t('settings.termsOfService')}</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/auth/legal?doc=privacy' as never)}>
          <Text style={styles.link}>{t('settings.privacyPolicy')}</Text>
        </Pressable>
        <Pressable onPress={() => Alert.alert(t('settings.exportData'), t('settings.exportAlert'))}>
          <Text style={styles.link}>{t('settings.exportData')}</Text>
        </Pressable>
        <Pressable onPress={() => Alert.alert(t('settings.deleteAccount'), t('settings.deleteAlert'))}>
          <Text style={styles.danger}>{t('settings.deleteAccount')}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  container: { padding: Spacing.lg, gap: Spacing.md },
  link: { color: Colors.primary, paddingVertical: Spacing.sm },
  danger: { color: Colors.danger, paddingVertical: Spacing.sm },
});
