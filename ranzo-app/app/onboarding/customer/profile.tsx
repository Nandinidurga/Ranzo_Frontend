import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { goBackToRoleSelectWork } from '@/core/navigation/roleFlow';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, Typography } from '@/core/theme';
import { RanzoAppBar, RanzoButton, RanzoTextField } from '@/core/widgets';
import { filterCities } from '@/features/seeker/data/cities';
import { useCustomerStore } from '@/features/customer/stores/customerStore';
import { upsertCustomerProfile } from '@/core/api/profile';
import { useTranslation } from '@/core/i18n';

/** M-C01: Customer profile — one step */
export default function CustomerProfileWizard() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile, patchProfile, markProfileComplete } = useCustomerStore();
  const [cityQuery, setCityQuery] = useState(profile.city);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cities = filterCities(cityQuery);
  const valid = profile.fullName.trim().length >= 2 && profile.city.trim().length >= 2;

  const pickPhoto = async (camera: boolean) => {
    const perm = camera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = camera
      ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      patchProfile({ photoUri: result.assets[0].uri });
    }
  };

  const onContinue = async () => {
    if (!valid) {
      setError(t('customer.profileError'));
      return;
    }
    setLoading(true);
    try {
      await upsertCustomerProfile({
        full_name: profile.fullName.trim(),
        email: profile.email.trim() || undefined,
      });
      markProfileComplete();
      router.push('/onboarding/customer/addresses');
    } catch (e: unknown) {
      setError((e as { message?: string })?.message ?? t('customer.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <RanzoAppBar title={t('customer.profileTitle')} showBack onBack={() => goBackToRoleSelectWork(router)} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={Typography.h1}>{t('customer.profileTitle')}</Text>
        <Text style={styles.sub}>{t('customer.profileSub')}</Text>

        <Pressable style={styles.photoWrap}>
          {profile.photoUri ? (
            <Image source={{ uri: profile.photoUri }} style={styles.photo} />
          ) : (
            <View style={styles.photoPh}>
              <Text style={styles.photoHint}>{t('customer.photo')}</Text>
            </View>
          )}
        </Pressable>
        <View style={styles.photoRow}>
          <RanzoButton label={t('customer.camera')} variant="secondary" onPress={() => pickPhoto(true)} />
          <RanzoButton label={t('customer.gallery')} variant="ghost" onPress={() => pickPhoto(false)} />
        </View>

        <RanzoTextField
          label={t('customer.fullName')}
          value={profile.fullName}
          onChangeText={(fullName) => patchProfile({ fullName })}
        />
        <RanzoTextField
          label={t('customer.emailOptional')}
          value={profile.email}
          onChangeText={(email) => patchProfile({ email })}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <RanzoTextField
          label={t('customer.city')}
          value={cityQuery}
          onChangeText={(v) => {
            setCityQuery(v);
            patchProfile({ city: v });
          }}
          placeholder={t('customer.cityPlaceholder')}
        />
        {cities.map((c) => (
          <Pressable
            key={c}
            onPress={() => {
              setCityQuery(c);
              patchProfile({ city: c });
            }}
            style={styles.cityItem}
          >
            <Text>{c}</Text>
          </Pressable>
        ))}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <RanzoButton label={t('customer.continue')} onPress={onContinue} loading={loading} disabled={!valid} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  container: { padding: Spacing.lg, paddingBottom: Spacing.xxl, gap: Spacing.md },
  sub: { ...Typography.caption, color: Colors.inkMuted },
  photoWrap: { alignSelf: 'center' },
  photo: { width: 100, height: 100, borderRadius: 50 },
  photoPh: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoHint: { color: Colors.primary },
  photoRow: { flexDirection: 'row', gap: Spacing.sm },
  cityItem: { paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  error: { color: Colors.danger },
});
