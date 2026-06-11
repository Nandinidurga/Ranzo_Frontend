import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Radius, Spacing, Typography } from '@/core/theme';
import { markLanguageIntroComplete } from '@/core/bootstrap/languageIntro';
import { saveLanguagePreference } from '@/storage/languagePreference';
import { useI18nStore, useTranslation } from '@/core/i18n';
import { useAuthStore } from '@/data/store';

const LANGUAGES = [
  { code: 'en' as const, label: 'English' },
  { code: 'hi' as const, label: 'हिंदी' },
  { code: 'te' as const, label: 'తెలుగు' },
];

/** M-002: Language select on first launch. */
export default function LanguageSelectScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const setLocale = useI18nStore((s) => s.setLocale);
  const [busy, setBusy] = useState<string | null>(null);

  const onSelect = async (code: (typeof LANGUAGES)[number]['code']) => {
    if (busy) return;
    setBusy(code);
    try {
      await saveLanguagePreference(code);
      await setLocale(code);
      const authed = Boolean(useAuthStore.getState().token);
      if (authed) {
        router.back();
      } else {
        await markLanguageIntroComplete();
        router.replace('/auth/login');
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.titleLine}>{t('language.titleEn')}</Text>
        <Text style={styles.titleLine}>{t('language.titleHi')}</Text>
        <Text style={styles.titleLine}>{t('language.titleTe')}</Text>
        <Text style={styles.subtitle}>{t('language.subtitle')}</Text>
      </View>

      <View style={styles.buttons}>
        {LANGUAGES.map((lang) => (
          <Pressable
            key={lang.code}
            onPress={() => onSelect(lang.code)}
            disabled={busy !== null}
            style={({ pressed }) => [
              styles.langButton,
              pressed && styles.langButtonPressed,
              busy === lang.code && styles.langButtonBusy,
            ]}
          >
            <Text style={styles.langButtonText}>{lang.label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.surfaceWhite,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  titleLine: {
    ...Typography.h2,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.caption,
    textAlign: 'center',
    color: Colors.inkMuted,
    marginTop: Spacing.md,
  },
  buttons: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  langButton: {
    minHeight: 64,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  langButtonPressed: {
    opacity: 0.88,
  },
  langButtonBusy: {
    opacity: 0.65,
  },
  langButtonText: {
    ...Typography.button,
    color: Colors.white,
    fontSize: 20,
  },
});
