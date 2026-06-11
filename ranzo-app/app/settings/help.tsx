import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Linking } from 'react-native';
import { Colors, Spacing, Typography } from '@/core/theme';
import { RanzoAppBar, RanzoButton, RanzoTextField } from '@/core/widgets';
import { useTranslation } from '@/core/i18n';

/** M-X05: Help & support */
export default function HelpScreen() {
  const { t } = useTranslation();
  const [q, setQ] = useState('');

  const faqs = useMemo(
    () => [
      { cat: t('settings.faqJobsCat'), q: t('settings.faqJobsQ'), a: t('settings.faqJobsA') },
      {
        cat: t('settings.faqBookingsCat'),
        q: t('settings.faqBookingsQ'),
        a: t('settings.faqBookingsA'),
      },
    ],
    [t]
  );

  const filtered = faqs.filter((f) => f.q.toLowerCase().includes(q.toLowerCase()));

  return (
    <SafeAreaView style={styles.safe}>
      <RanzoAppBar title={t('settings.helpTitle')} showBack />
      <ScrollView contentContainerStyle={styles.container}>
        <RanzoTextField label={t('settings.searchFaqs')} value={q} onChangeText={setQ} />
        {filtered.map((f) => (
          <View key={f.q} style={styles.faq}>
            <Text style={Typography.bodyStrong}>{f.q}</Text>
            <Text style={styles.a}>{f.a}</Text>
          </View>
        ))}
        <RanzoButton
          label={t('settings.contactSupport')}
          onPress={() => Linking.openURL('mailto:support@ranzo.app')}
        />
        <Text style={styles.hours}>{t('settings.supportHours')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  container: { padding: Spacing.lg },
  faq: { marginVertical: Spacing.sm },
  a: { ...Typography.caption },
  hours: { ...Typography.caption, textAlign: 'center', marginTop: Spacing.md },
});
