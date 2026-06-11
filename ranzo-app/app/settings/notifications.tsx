import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '@/core/theme';
import { RanzoAppBar, RanzoToggle } from '@/core/widgets';
import { useTranslation } from '@/core/i18n';

/** M-X02: Notification settings */
export default function NotificationSettingsScreen() {
  const { t } = useTranslation();
  const [push, setPush] = useState(true);
  const [sms, setSms] = useState(false);
  const [inApp, setInApp] = useState(true);
  const [cap] = useState(10);

  return (
    <SafeAreaView style={styles.safe}>
      <RanzoAppBar title={t('settings.notificationsTitle')} showBack />
      <ScrollView contentContainerStyle={styles.container}>
        <Row label={t('settings.pushMaster')} value={push} onChange={setPush} />
        <Row label={t('settings.smsMaster')} value={sms} onChange={setSms} />
        <Row label={t('settings.inApp')} value={inApp} onChange={setInApp} />
        <Text style={Typography.caption}>{t('settings.quietHours')}</Text>
        <Text style={Typography.caption}>{t('settings.dailyCap', { cap })}</Text>
        <Text style={styles.lang}>{t('settings.langHint')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={Typography.body}>{label}</Text>
      <RanzoToggle value={value} onChange={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  container: { padding: Spacing.lg, gap: Spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lang: { ...Typography.caption, color: Colors.inkMuted, marginTop: Spacing.lg },
});
