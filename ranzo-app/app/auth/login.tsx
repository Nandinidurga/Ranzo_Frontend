import React, { useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '@/core/theme';
import { phoneValidationItems } from '@/core/auth/validationHints';
import { LoginFloatingShowcase, RanzoAppBar, RanzoButton, RanzoTextField, ValidationChecklist } from '@/core/widgets';
import { requestOtp } from '@/core/api/auth';
import { loginErrorMessage } from '@/core/auth/performLogin';
import { clearRegistrationDraft } from '@/data/registrationDraft';
import { setOtpLoginDraft } from '@/data/otpLoginDraft';
import {
  digitsOnlyPhone,
  formatIndianMobile,
  isValidIndianMobile,
} from '@/core/utils/phone';
import { t, useI18nStore } from '@/core/i18n';

/** M-003: Phone + OTP entry; proceeds to M-004. */
export default function LoginScreen() {
  const router = useRouter();
  const locale = useI18nStore((s) => s.locale);

  const [phoneDigits, setPhoneDigits] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const submittingRef = useRef(false);

  const phoneValid = isValidIndianMobile(phoneDigits);
  const canSubmit = phoneValid && agreed;
  const phoneHints = useMemo(() => phoneValidationItems(phoneDigits), [phoneDigits]);
  const phoneFieldError =
    phoneDigits.length > 0 && !phoneValid && phoneDigits.length >= 10
      ? t('auth.phoneOnlyValidationError')
      : null;

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/language');
  };

  const handlePhoneChange = (val: string) => {
    setPhoneDigits(digitsOnlyPhone(val));
    if (error) setError(null);
  };

  const onGetOtp = async () => {
    if (!canSubmit) {
      if (!phoneValid) setError(t('auth.phoneOnlyValidationError'));
      return;
    }
    if (submittingRef.current) return;
    submittingRef.current = true;
    setError(null);
    setLoading(true);
    try {
      clearRegistrationDraft();
      const otpRes = await requestOtp(phoneDigits, 'login');
      if (!otpRes.verification_id) {
        throw new Error('Missing verification id from server');
      }
      setOtpLoginDraft(phoneDigits, otpRes.verification_id);
      router.push({
        pathname: '/auth/otp',
        params: { phone: phoneDigits, flow: 'login' },
      });
    } catch (e: unknown) {
      setError(loginErrorMessage(e, t('auth.loginFailed')));
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <SafeAreaView key={locale} style={styles.safe} edges={['top', 'bottom']}>
      <RanzoAppBar title="" showBack onBack={goBack} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={Typography.h1}>{t('auth.welcomeTitle')}</Text>
          <LoginFloatingShowcase />
          <Text style={[Typography.body, styles.caption]}>
            {t('auth.phoneSubtitle')}
          </Text>

          <View style={styles.field}>
            <RanzoTextField
              ref={inputRef}
              label={t('auth.phoneLabel')}
              prefix="+91"
              value={formatIndianMobile(phoneDigits)}
              onChangeText={handlePhoneChange}
              keyboardType="number-pad"
              autoFocus
              placeholder={t('auth.phonePlaceholder')}
              maxLength={11}
              error={phoneFieldError ?? error}
              returnKeyType="done"
              onSubmitEditing={onGetOtp}
            />
            <ValidationChecklist items={phoneHints} visible={phoneDigits.length > 0} />
          </View>

          <View style={styles.termsRow}>
            <Pressable
              onPress={() => setAgreed((v) => !v)}
              hitSlop={8}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: agreed }}
            >
              <Ionicons
                name={agreed ? 'checkbox' : 'square-outline'}
                size={22}
                color={agreed ? Colors.primary : Colors.inkMuted}
              />
            </Pressable>
            <Text style={styles.termsText}>
              {t('auth.termsPrefix')}{' '}
              <Text
                style={styles.termsLink}
                onPress={() => router.push({ pathname: '/legal', params: { doc: 'terms' } })}
              >
                {t('auth.termsOfService')}
              </Text>
              {' '}
              {t('auth.termsAnd')}{' '}
              <Text
                style={styles.termsLink}
                onPress={() => router.push({ pathname: '/legal', params: { doc: 'privacy' } })}
              >
                {t('auth.privacyPolicy')}
              </Text>
            </Text>
          </View>

          <RanzoButton
            label={t('auth.getOtp')}
            onPress={onGetOtp}
            disabled={!canSubmit}
            loading={loading}
          />

          <Pressable
            onPress={() => router.push('/auth/register')}
            hitSlop={8}
            style={({ pressed }) => [styles.registerWrap, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.registerLink}>{t('auth.registerLink')}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  flex: { flex: 1 },
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
    flexGrow: 1,
    gap: Spacing.lg,
  },
  caption: {
    color: Colors.inkMuted,
    marginTop: Spacing.xs,
  },
  field: { marginTop: Spacing.sm },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  termsText: {
    ...Typography.caption,
    flex: 1,
    color: Colors.inkBody,
    lineHeight: 20,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  registerWrap: { marginTop: Spacing.sm, alignSelf: 'center' },
  registerLink: {
    ...Typography.caption,
    textAlign: 'center',
    color: Colors.primary,
    fontWeight: '700',
  },
});
