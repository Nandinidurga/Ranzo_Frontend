import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors, Spacing, Typography } from '@/core/theme';
import { RanzoAppBar, RanzoButton, RanzoChip, RanzoTextField } from '@/core/widgets';
import {
  bookService,
  buildBookPayload,
  estimateTotal,
} from '@/core/api/customer';
import { categoryById, subcategoryById } from '@/features/customer/mock/catalog';
import { useBookingDraftStore } from '@/features/customer/stores/bookingDraftStore';
import { useCustomerStore } from '@/features/customer/stores/customerStore';
import { resetBookingPoll } from '@/core/api/customer';
import { tCategory, tSubcategory } from '@/core/i18n/catalogLabels';
import { useTranslation } from '@/core/i18n';

/** M-C05: Booking composer */
export default function BookingComposerScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ categoryId: string; subcategoryId: string }>();
  const { draft, init, patch } = useBookingDraftStore();
  const addresses = useCustomerStore((s) => s.addresses);
  const selectedAddressId = useCustomerStore((s) => s.selectedAddressId);
  const setSelectedAddressId = useCustomerStore((s) => s.setSelectedAddressId);

  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cat = categoryById(params.categoryId ?? '');
    const sub = subcategoryById(params.subcategoryId ?? '');
    if (cat && sub) {
      init({
        categoryId: cat.id,
        categoryName: cat.name,
        subcategoryId: sub.id,
        subcategoryName: sub.name,
        priceMin: sub.priceMin,
        priceMax: sub.priceMax,
        addressId: selectedAddressId,
      });
    }
  }, [params.categoryId, params.subcategoryId, init, selectedAddressId]);

  const total = estimateTotal(draft);
  const canBook = Boolean(draft.addressId);

  const onBookNow = async () => {
    if (!draft.addressId) return;
    setLoading(true);
    try {
      if (__DEV__) {
        Alert.alert('Payment', t('customer.paymentSimulated'), [{ text: t('common.ok') }]);
      }
      const { id } = await bookService(buildBookPayload(draft, draft.addressId));
      resetBookingPoll(id);
      useBookingDraftStore.getState().reset();
      router.replace(`/(customer)/booking/${id}` as never);
    } catch (e: unknown) {
      Alert.alert(
        t('customer.bookingFailed'),
        (e as { message?: string })?.message ?? t('customer.tryAgain')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <RanzoAppBar title={t('customer.bookService')} showBack onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={Typography.h2}>
          {tSubcategory(draft.subcategoryId, draft.subcategoryName)}
        </Text>
        <Text style={styles.sub}>{tCategory(draft.categoryId, draft.categoryName)}</Text>

        <Text style={styles.label}>{t('customer.when')}</Text>
        <View style={styles.chips}>
          <RanzoChip label={t('customer.now')} selected={draft.timeMode === 'now'} onPress={() => patch({ timeMode: 'now', scheduledAt: null })} />
          <RanzoChip label={t('customer.schedule')} selected={draft.timeMode === 'schedule'} onPress={() => patch({ timeMode: 'schedule' })} />
        </View>
        {draft.timeMode === 'schedule' && (
          <>
            <Pressable onPress={() => setShowPicker(true)} style={styles.scheduleBtn}>
              <Text>{draft.scheduledAt ? new Date(draft.scheduledAt).toLocaleString() : t('customer.pickDateTime')}</Text>
            </Pressable>
            {showPicker && (
              <DateTimePicker
                value={draft.scheduledAt ? new Date(draft.scheduledAt) : new Date()}
                mode="datetime"
                minimumDate={new Date()}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_, date) => {
                  if (Platform.OS !== 'ios') setShowPicker(false);
                  if (date) patch({ scheduledAt: date.toISOString() });
                }}
              />
            )}
          </>
        )}

        <Text style={styles.label}>{t('profile.address')}</Text>
        {addresses.map((a) => (
          <Pressable
            key={a.id}
            style={[styles.addr, draft.addressId === a.id && styles.addrOn]}
            onPress={() => {
              patch({ addressId: a.id });
              setSelectedAddressId(a.id);
            }}
          >
            <Text style={Typography.bodyStrong}>{a.label}</Text>
            <Text style={styles.addrLine}>{a.line1}, {a.city}</Text>
          </Pressable>
        ))}
        <RanzoButton label={t('customer.addNewAddress')} variant="ghost" onPress={() => router.push('/onboarding/customer/addresses')} />

        <RanzoTextField
          label={t('customer.specialInstructions')}
          value={draft.instructions}
          onChangeText={(instructions) => patch({ instructions })}
          multiline
          placeholder={t('customer.gatePlaceholder')}
        />

        <View style={styles.breakdown}>
          <Text style={styles.label}>{t('customer.estimatedPrice')}</Text>
          <Text style={styles.line}>
            {t('customer.serviceRange', { min: draft.priceMin, max: draft.priceMax })}
          </Text>
          <Text style={styles.total}>{t('customer.totalEstimate', { total })}</Text>
        </View>

        <RanzoButton label={t('customer.bookNow')} onPress={onBookNow} loading={loading} disabled={!canBook} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  container: { padding: Spacing.lg, paddingBottom: Spacing.xxl, gap: Spacing.md },
  sub: { ...Typography.caption, color: Colors.inkMuted },
  label: { ...Typography.bodyStrong, marginTop: Spacing.sm },
  chips: { flexDirection: 'row', gap: Spacing.sm },
  scheduleBtn: { padding: Spacing.md, backgroundColor: Colors.surfaceCanvas, borderRadius: 8 },
  addr: { padding: Spacing.md, borderWidth: 1, borderColor: Colors.divider, borderRadius: 8, marginBottom: Spacing.sm },
  addrOn: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
  addrLine: { ...Typography.caption },
  breakdown: { marginTop: Spacing.md, padding: Spacing.md, backgroundColor: Colors.surfaceCanvas, borderRadius: 8 },
  line: { ...Typography.caption },
  total: { ...Typography.h2, color: Colors.primary, marginTop: Spacing.sm },
});
