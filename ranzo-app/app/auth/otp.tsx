import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, Typography } from '@/core/theme';
import {
  RanzoAppBar,
  RanzoButton,
  RanzoOtpField,
} from '@/core/widgets';
import {
  loginWithPassword,
  registerAccount,
  requestOtp,
  verifyOtp,
} from '@/core/api/auth';
import { completeAuthSession } from '@/core/api/session';
import { navigatePostAuth } from '@/core/navigation/postAuth';
import {
  clearOtpLoginDraft,
  getOtpLoginDraft,
  setOtpLoginDraft,
} from '@/data/otpLoginDraft';
import {
  clearRegistrationDraft,
  getRegistrationDraft,
  updateRegistrationVerificationId,
} from '@/data/registrationDraft';
import { maskPhone } from '@/core/utils/format';
import { t } from '@/core/i18n';

const RESEND_COOLDOWN = 30;

export default function OtpScreen() {
  const router = useRouter();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/auth/login');
  };

  const params = useLocalSearchParams<{
    phone?: string;
    name?: string;
    flow?: 'register' | 'login';
  }>();
  const phone = params.phone ?? '';
  const name = params.name ?? '';
  const flow = params.flow ?? (getRegistrationDraft()?.phone === phone ? 'register' : 'login');

  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(RESEND_COOLDOWN);

  const isRegistration = flow === 'register';

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const finishSession = async (
    tokens: { access_token: string; refresh_token: string },
    user: Parameters<typeof completeAuthSession>[1],
    displayName?: string
  ) => {
    await completeAuthSession(tokens, user, displayName);
    await navigatePostAuth(router);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  };

  const verify = async (val: string) => {
    try {
      setLoading(true);
      setError(null);

      if (isRegistration) {
        const draft = getRegistrationDraft();
        if (!draft || draft.phone !== phone) {
          setError(t('auth.registerSessionExpired'));
          return;
        }

        const result = await registerAccount({
          name: draft.name,
          phone: draft.phone,
          password: draft.password,
          otp: val,
          verification_id: draft.verification_id,
        });
        clearRegistrationDraft();

        if (result.status !== 201) {
          setError(t('auth.otpVerifyFailed'));
          return;
        }

        const tokens = await loginWithPassword(draft.phone, draft.password);
        await finishSession(
          {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
          },
          tokens.user,
          draft.name
        );
        return;
      }

      const loginDraft = getOtpLoginDraft();
      if (!loginDraft || loginDraft.phone !== phone) {
        setError(t('auth.loginOtpSessionExpired'));
        return;
      }

      const tokens = await verifyOtp(phone, val, loginDraft.verification_id);
      clearOtpLoginDraft();
      await finishSession(
        {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
        },
        tokens.user,
        name.trim() || undefined
      );
    } catch (e: any) {
      setError(e?.message ?? t('auth.otpVerifyFailed'));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (val: string) => {
    setOtp(val);
    if (error) setError(null);
  };

  const handleFilled = (val: string) => {
    verify(val);
  };

  const handleResend = async () => {
    if (seconds > 0) return;
    setSeconds(RESEND_COOLDOWN);
    setOtp('');
    setError(null);
    Haptics.selectionAsync().catch(() => {});

    try {
      const purpose = isRegistration ? 'register' : 'login';
      const res = await requestOtp(phone, purpose);
      if (!res.verification_id) {
        setError(t('auth.registerOtpFailed'));
        return;
      }
      if (isRegistration) {
        updateRegistrationVerificationId(res.verification_id);
      } else {
        setOtpLoginDraft(phone, res.verification_id);
      }
    } catch (e: any) {
      setError(e?.message ?? t('auth.registerOtpFailed'));
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <RanzoAppBar title={t('auth.otpTitle')} showBack onBack={goBack} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={Typography.h1}>{t('auth.otpTitle')}</Text>
          <Text style={[Typography.body, styles.subtitle]}>
            {isRegistration
              ? t('auth.registerOtpSubtitle', { phone: maskPhone(phone) })
              : t('auth.otpSubtitle', { phone: maskPhone(phone) })}
          </Text>
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            style={({ pressed }) => [pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.changeNumber}>Change number</Text>
          </Pressable>

          <View style={styles.otp}>
            <RanzoOtpField
              value={otp}
              onChange={handleChange}
              onFilled={handleFilled}
              error={!!error}
            />
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          {!!name && isRegistration && (
            <Text style={styles.hint}>{t('auth.registerOtpHint', { name })}</Text>
          )}

          <View style={styles.spacer} />

          <RanzoButton
            label={isRegistration ? t('auth.createAccount') : t('auth.verify')}
            onPress={() => verify(otp)}
            disabled={otp.length !== 6}
            loading={loading}
          />

          <Pressable
            onPress={handleResend}
            disabled={seconds > 0}
            style={({ pressed }) => [
              styles.resend,
              pressed && seconds === 0 && { opacity: 0.6 },
            ]}
          >
            <Text
              style={[
                styles.resendText,
                seconds > 0 && { color: Colors.inkMuted },
              ]}
            >
              {seconds > 0 ? `Resend OTP in ${seconds}s` : 'Resend OTP'}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxl,
    flexGrow: 1,
  },
  subtitle: {
    color: Colors.inkMuted,
    marginTop: Spacing.sm,
  },
  changeNumber: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '700',
    marginTop: Spacing.xs,
  },
  otp: { marginTop: Spacing.xxl },
  errorText: {
    color: Colors.danger,
    fontSize: 13,
    fontWeight: '600',
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  hint: {
    ...Typography.caption,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  spacer: { flex: 1, minHeight: Spacing.xxl },
  resend: {
    marginTop: Spacing.lg,
    alignSelf: 'center',
    padding: Spacing.sm,
  },
  resendText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.4,
  },
});
