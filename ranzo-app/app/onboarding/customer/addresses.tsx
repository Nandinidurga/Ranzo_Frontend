import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '@/core/theme';
import { RanzoAppBar, RanzoButton, RanzoTextField } from '@/core/widgets';
import {
  createEmptyAddress,
  useCustomerStore,
} from '@/features/customer/stores/customerStore';
import type { CustomerAddress } from '@/features/customer/types';
import { useAuthStore } from '@/data/store';
import { useTranslation } from '@/core/i18n';

/** M-C02: Saved addresses */
export default function CustomerAddressesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const addresses = useCustomerStore((s) => s.addresses);
  const addAddress = useCustomerStore((s) => s.addAddress);
  const updateAddress = useCustomerStore((s) => s.updateAddress);
  const removeAddress = useCustomerStore((s) => s.removeAddress);
  const setDefaultAddress = useCustomerStore((s) => s.setDefaultAddress);
  const markAddressesComplete = useCustomerStore((s) => s.markAddressesComplete);

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<CustomerAddress | null>(null);
  const [form, setForm] = useState(createEmptyAddress());

  const openAdd = () => {
    setEditing(null);
    setForm(createEmptyAddress());
    setModal(true);
  };

  const openEdit = (addr: CustomerAddress) => {
    setEditing(addr);
    setForm({ ...addr });
    setModal(true);
  };

  const saveForm = () => {
    if (!form.line1.trim() || !form.city.trim()) return;
    if (editing) updateAddress(editing.id, form);
    else addAddress(form);
    setModal(false);
  };

  const finish = async () => {
    if (addresses.length < 1) return;
    markAddressesComplete();
    await useAuthStore.getState().setUserMeta({
      userId: useAuthStore.getState().userId,
      isDetailsFilled: true,
    });
    router.replace('/(customer)/(tabs)' as never);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <RanzoAppBar title={t('customer.addressesTitle')} showBack />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.head}>
          <Text style={Typography.h2}>{t('customer.addressesHead')}</Text>
          <Pressable onPress={openAdd}>
            <Text style={styles.add}>{t('customer.add')}</Text>
          </Pressable>
        </View>

        {addresses.map((addr) => (
          <View key={addr.id} style={styles.card}>
            <Pressable onPress={() => setDefaultAddress(addr.id)} style={styles.defaultRow}>
              <Ionicons
                name={addr.isDefault ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={Colors.primary}
              />
              <Text style={styles.defaultLabel}>
                {addr.isDefault ? t('customer.default') : t('customer.setDefault')}
              </Text>
            </Pressable>
            <Text style={styles.label}>{addr.label}</Text>
            <Text style={styles.line}>{addr.line1}</Text>
            <Text style={styles.line}>
              {addr.city} — {addr.pincode}
            </Text>
            <View style={styles.actions}>
              <Pressable onPress={() => openEdit(addr)}>
                <Ionicons name="create-outline" size={20} color={Colors.primary} />
              </Pressable>
              <Pressable onPress={() => removeAddress(addr.id)}>
                <Ionicons name="trash-outline" size={20} color={Colors.danger} />
              </Pressable>
            </View>
          </View>
        ))}

        <RanzoButton
          label={t('customer.continueHome')}
          onPress={finish}
          disabled={addresses.length < 1}
        />
      </ScrollView>

      <Modal visible={modal} animationType="slide">
        <SafeAreaView style={styles.modal}>
          <Text style={Typography.h2}>
            {editing ? t('customer.editAddress') : t('customer.addAddressForm')}
          </Text>
          <RanzoTextField
            label={t('customer.label')}
            value={form.label}
            onChangeText={(label) => setForm({ ...form, label })}
            placeholder={t('customer.labelPlaceholder')}
          />
          <RanzoTextField
            label={t('customer.addressLine')}
            value={form.line1}
            onChangeText={(line1) => setForm({ ...form, line1 })}
          />
          <RanzoTextField
            label={t('customer.city')}
            value={form.city}
            onChangeText={(city) => setForm({ ...form, city })}
          />
          <RanzoTextField
            label={t('customer.pincode')}
            value={form.pincode}
            onChangeText={(pincode) => setForm({ ...form, pincode })}
            keyboardType="number-pad"
            maxLength={6}
          />
          <RanzoButton label={t('customer.save')} onPress={saveForm} />
          <RanzoButton label={t('common.cancel')} variant="ghost" onPress={() => setModal(false)} />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  container: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  head: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.lg },
  add: { color: Colors.primary, fontWeight: '700' },
  card: {
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  defaultRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  defaultLabel: { ...Typography.caption, color: Colors.primary },
  label: { ...Typography.bodyStrong },
  line: { ...Typography.caption },
  actions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  modal: { flex: 1, padding: Spacing.lg, gap: Spacing.md },
});
