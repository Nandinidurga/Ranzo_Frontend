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

import {

  confirmPasswordItem,

  isRegisterFormValid,

  passwordValidationItems,

  phoneValidationItems,

} from '@/core/auth/validationHints';

import { RanzoAppBar, RanzoButton, RanzoTextField, ValidationChecklist } from '@/core/widgets';

import { requestOtp } from '@/core/api/auth';

import { clearOtpLoginDraft } from '@/data/otpLoginDraft';

import { setRegistrationDraft } from '@/data/registrationDraft';

import { digitsOnlyPhone, formatIndianMobile, isValidIndianMobile } from '@/core/utils/phone';

import { t, useI18nStore } from '@/core/i18n';



/** Role is chosen later on M-005 (not during account creation). */

export default function RegisterScreen() {

  const router = useRouter();

  const locale = useI18nStore((s) => s.locale);



  const goBack = () => {

    if (router.canGoBack()) router.back();

    else router.replace('/auth/login');

  };



  const nameRef = useRef<TextInput>(null);



  const [name, setName] = useState('');

  const [phone, setPhone] = useState('');

  const [password, setPassword] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitError, setSubmitError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);



  const phoneDigits = digitsOnlyPhone(phone);

  const phoneValid = isValidIndianMobile(phoneDigits);

  const isValid = isRegisterFormValid(name, phoneDigits, password, confirmPassword);



  const phoneHints = useMemo(() => phoneValidationItems(phoneDigits), [phoneDigits]);

  const passwordHints = useMemo(() => passwordValidationItems(password), [password]);

  const confirmHint = useMemo(

    () => [confirmPasswordItem(password, confirmPassword)],

    [password, confirmPassword]

  );



  const handlePhone = (val: string) => {

    setPhone(digitsOnlyPhone(val));

    if (submitError) setSubmitError(null);

  };



  const phoneFieldError =

    phoneDigits.length > 0 && !phoneValid && phoneDigits.length >= 10

      ? t('auth.phoneOnlyValidationError')

      : null;



  const onRequestOtp = async () => {

    if (!isValid) {

      setSubmitError(t('auth.registerValidationError'));

      return;

    }

    try {

      setLoading(true);

      setSubmitError(null);

      clearOtpLoginDraft();

      const otpRes = await requestOtp(phoneDigits, 'register');

      if (!otpRes.verification_id) {

        throw new Error('Missing verification id from server');

      }

      setRegistrationDraft({

        name: name.trim(),

        phone: phoneDigits,

        password,

        verification_id: otpRes.verification_id,

      });

      router.push({

        pathname: '/auth/otp',

        params: {

          phone: phoneDigits,

          name: name.trim(),

          flow: 'register',

        },

      });

    } catch (e: unknown) {

      setSubmitError((e as { message?: string })?.message ?? t('auth.registerOtpFailed'));

    } finally {

      setLoading(false);

    }

  };



  const passwordToggle = (visible: boolean, onToggle: () => void) => (

    <Pressable

      onPress={onToggle}

      hitSlop={8}

      accessibilityRole="button"

      accessibilityLabel={visible ? 'Hide password' : 'Show password'}

      style={({ pressed }) => [pressed && { opacity: 0.7 }]}

    >

      <Ionicons

        name={visible ? 'eye-off-outline' : 'eye-outline'}

        size={20}

        color={Colors.inkMuted}

      />

    </Pressable>

  );



  return (

    <SafeAreaView key={locale} style={styles.safe} edges={['top', 'bottom']}>

      <RanzoAppBar title={t('auth.registerTitle')} showBack onBack={goBack} />

      <KeyboardAvoidingView

        behavior={Platform.OS === 'ios' ? 'padding' : undefined}

        style={styles.flex}

      >

        <ScrollView

          contentContainerStyle={styles.container}

          keyboardShouldPersistTaps="handled"

          showsVerticalScrollIndicator={false}

        >

          <Text style={[Typography.body, styles.caption]}>

            {t('auth.registerSubtitle')}

          </Text>



          <View style={styles.field}>

            <RanzoTextField

              ref={nameRef}

              label={t('auth.namePlaceholder')}

              value={name}

              onChangeText={(v) => {

                setName(v);

                if (submitError) setSubmitError(null);

              }}

              placeholder={t('auth.namePlaceholder')}

              autoCapitalize="words"

              returnKeyType="next"

            />

          </View>



          <View style={styles.field}>

            <RanzoTextField

              label={t('auth.phoneLabel')}

              prefix="+91"

              value={formatIndianMobile(phoneDigits)}

              onChangeText={handlePhone}

              keyboardType="number-pad"

              placeholder="98765 43210"

              maxLength={11}

              error={phoneFieldError}

              returnKeyType="next"

            />

            <ValidationChecklist items={phoneHints} visible={phoneDigits.length > 0} />

          </View>



          <View style={styles.field}>

            <RanzoTextField

              label={t('auth.passwordLabel')}

              value={password}

              onChangeText={(v) => {

                setPassword(v);

                if (submitError) setSubmitError(null);

              }}

              placeholder={t('auth.passwordPlaceholder')}

              secureTextEntry={!showPassword}

              suffix={passwordToggle(showPassword, () => setShowPassword((p) => !p))}

              returnKeyType="next"

            />

            <ValidationChecklist items={passwordHints} visible={password.length > 0} />

          </View>



          <View style={styles.field}>

            <RanzoTextField

              label={t('auth.confirmPasswordPlaceholder')}

              value={confirmPassword}

              onChangeText={(v) => {

                setConfirmPassword(v);

                if (submitError) setSubmitError(null);

              }}

              placeholder={t('auth.confirmPasswordPlaceholder')}

              secureTextEntry={!showConfirmPassword}

              suffix={passwordToggle(showConfirmPassword, () =>

                setShowConfirmPassword((p) => !p)

              )}

              returnKeyType="done"

              onSubmitEditing={onRequestOtp}

            />

            <ValidationChecklist items={confirmHint} visible={confirmPassword.length > 0} />

          </View>



          {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}



          <RanzoButton

            label={t('auth.sendOtp')}

            onPress={onRequestOtp}

            disabled={!isValid}

            loading={loading}

          />

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

    paddingTop: Spacing.xxl,

    paddingBottom: Spacing.xxl,

    flexGrow: 1,

    gap: Spacing.lg,

  },

  caption: { color: Colors.inkMuted, marginTop: Spacing.xs },

  field: { marginTop: Spacing.sm },

  submitError: {

    ...Typography.caption,

    color: Colors.danger,

    textAlign: 'center',

  },

});


