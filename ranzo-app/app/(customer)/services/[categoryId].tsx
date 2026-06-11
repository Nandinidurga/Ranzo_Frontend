import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '@/core/theme';
import { RanzoAppBar, ServiceCategoryIcon } from '@/core/widgets';
import { getSubcategories } from '@/core/api/customer';
import { tCategory, tSubcategory } from '@/core/i18n/catalogLabels';
import { useTranslation } from '@/core/i18n';
import { categoryById } from '@/features/customer/mock/catalog';
import type { ServiceSubcategory } from '@/features/customer/types';

/** M-C04: Subcategory selection */
export default function SubcategoryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const cat = categoryById(categoryId ?? '');
  const [items, setItems] = useState<ServiceSubcategory[]>([]);

  useEffect(() => {
    if (categoryId) void getSubcategories(categoryId).then(setItems);
  }, [categoryId]);

  const title = cat ? tCategory(cat.id, cat.name) : t('customer.services');

  return (
    <SafeAreaView style={styles.safe}>
      <RanzoAppBar title={title} showBack onBack={() => router.back()} />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.header}>{t('customer.chooseService')}</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() =>
              router.push({
                pathname: '/(customer)/book',
                params: { categoryId, subcategoryId: item.id },
              } as never)
            }
          >
            <View style={styles.iconWrap}>
              <ServiceCategoryIcon icon={item.icon} iconSet={item.iconSet} size={24} color={Colors.primary} />
            </View>
            <View style={styles.text}>
              <Text style={Typography.bodyStrong}>{tSubcategory(item.id, item.name)}</Text>
              <Text style={styles.price}>
                ₹{item.priceMin} – ₹{item.priceMax}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={Colors.inkMuted} />
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  list: { padding: Spacing.lg },
  header: { ...Typography.h2, marginBottom: Spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
  price: { ...Typography.caption, color: Colors.primary, marginTop: 4 },
});
