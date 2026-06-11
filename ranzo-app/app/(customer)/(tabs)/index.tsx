import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '@/core/theme';
import { ServiceCategoryIcon } from '@/core/widgets';
import { getServiceCatalog } from '@/core/api/customer';
import { tCategory } from '@/core/i18n/catalogLabels';
import { useTranslation } from '@/core/i18n';
import { useCustomerStore } from '@/features/customer/stores/customerStore';
import type { ServiceCategory } from '@/features/customer/types';

/** M-C03: Customer Home */
export default function CustomerHomeTab() {
  const { t } = useTranslation();
  const router = useRouter();
  const profile = useCustomerStore((s) => s.profile);
  const addresses = useCustomerStore((s) => s.addresses);
  const selectedAddressId = useCustomerStore((s) => s.selectedAddressId);
  const setSelectedAddressId = useCustomerStore((s) => s.setSelectedAddressId);

  const [catalog, setCatalog] = useState<Awaited<ReturnType<typeof getServiceCatalog>> | null>(null);
  const [showAddresses, setShowAddresses] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const selected = addresses.find((a) => a.id === selectedAddressId) ?? addresses[0];
  const displayName = profile.fullName.trim() || t('customer.greetingDefault');

  const load = useCallback(async () => {
    setCatalog(await getServiceCatalog());
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const onCategory = (cat: ServiceCategory) => {
    router.push(`/(customer)/services/${cat.id}` as never);
  };

  const onBookAgain = (categoryId: string, subcategoryId: string) => {
    router.push({
      pathname: '/(customer)/book',
      params: { categoryId, subcategoryId },
    } as never);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
          />
        }
        contentContainerStyle={styles.container}
      >
        <Text style={styles.greeting}>{t('customer.greeting', { name: displayName })}</Text>

        <Pressable style={styles.addrPicker} onPress={() => setShowAddresses((v) => !v)}>
          <Ionicons name="location" size={18} color={Colors.primary} />
          <Text style={styles.addrText} numberOfLines={1}>
            {selected ? `${selected.label}: ${selected.line1}` : t('customer.addAddress')}
          </Text>
          <Ionicons name="chevron-down" size={18} color={Colors.inkMuted} />
        </Pressable>
        {showAddresses &&
          addresses.map((a) => (
            <Pressable
              key={a.id}
              style={styles.addrOption}
              onPress={() => {
                setSelectedAddressId(a.id);
                setShowAddresses(false);
              }}
            >
              <Text>
                {a.label} — {a.line1}
              </Text>
            </Pressable>
          ))}

        <Text style={styles.section}>{t('customer.services')}</Text>
        <View style={styles.grid}>
          {(catalog?.categories ?? []).map((cat) => (
            <Pressable key={cat.id} style={styles.gridItem} onPress={() => onCategory(cat)}>
              <View style={[styles.iconCircle, { backgroundColor: cat.color ?? Colors.primarySoft }]}>
                <ServiceCategoryIcon
                  icon={cat.icon}
                  iconSet={cat.iconSet}
                  size={28}
                  color={Colors.surfaceWhite}
                />
              </View>
              <Text style={styles.gridLabel}>{tCategory(cat.id, cat.name)}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.section}>{t('customer.recentBookings')}</Text>
        <FlatList
          horizontal
          data={catalog?.recentBookings ?? []}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.recentCard}>
              <Text style={styles.recentTitle}>{item.serviceName}</Text>
              <Text style={styles.recentDate}>{item.bookedAt}</Text>
            </View>
          )}
        />

        <Text style={styles.section}>{t('customer.bookAgain')}</Text>
        {(catalog?.bookAgain ?? []).map((item) => (
          <Pressable
            key={item.id}
            style={styles.bookAgain}
            onPress={() => onBookAgain(item.categoryId, item.subcategoryId)}
          >
            <Text style={styles.bookAgainText}>
              {t('customer.bookAgainCta', { service: item.serviceName })}
            </Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.primary} />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceCanvas },
  container: { paddingBottom: Spacing.xxl },
  greeting: { ...Typography.h1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  addrPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  addrText: { flex: 1, ...Typography.caption },
  addrOption: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  section: { ...Typography.h2, marginHorizontal: Spacing.lg, marginTop: Spacing.xl, marginBottom: Spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.md },
  gridItem: { width: '33.33%', alignItems: 'center', padding: Spacing.sm, marginBottom: Spacing.md },
  iconCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  gridLabel: { ...Typography.caption, textAlign: 'center', marginTop: 4 },
  recentCard: {
    width: 160,
    marginLeft: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  recentTitle: { ...Typography.bodyStrong },
  recentDate: { ...Typography.caption, marginTop: 4 },
  bookAgain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.primarySoft,
    borderRadius: Radius.lg,
  },
  bookAgainText: { ...Typography.bodyStrong, color: Colors.primary },
});
