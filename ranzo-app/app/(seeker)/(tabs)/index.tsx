import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '@/core/theme';
import { RanzoChip } from '@/core/widgets';
import { SeekerJobCard } from '@/features/seeker/components/SeekerJobCard';
import { getSeekerFeed } from '@/core/api/seeker';
import { useAuthStore } from '@/data/store';
import { useSeekerWizardStore } from '@/features/seeker/stores/wizardStore';
import { useTranslation } from '@/core/i18n';

/** M-S06: Seeker Home Tab */
export default function SeekerHomeTab() {
  const { t } = useTranslation();
  const router = useRouter();
  const worker = useAuthStore((s) => s.worker);
  const draft = useSeekerWizardStore((s) => s.draft);
  const city = draft.city || worker?.address?.split(',')[0] || 'Hyderabad';
  const name = draft.fullName || worker?.name || 'there';
  const photoUri = draft.photoUri;

  const [feed, setFeed] = useState<Awaited<ReturnType<typeof getSeekerFeed>> | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await getSeekerFeed(city);
    setFeed(data);
  }, [city]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const completeness = feed?.completeness_pct ?? 60;
  const recommended = feed?.recommended ?? [];
  const latest = (feed?.latest ?? []).slice(0, 10);
  const hasEmployerPosts = [...recommended, ...latest].some((j) => j.postedByEmployer);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.container}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>{t('seeker.greeting', { name })}</Text>
            <Text style={styles.city}>{city}</Text>
          </View>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.avatar} accessibilityLabel="Profile photo" />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={28} color={Colors.primary} />
            </View>
          )}
        </View>

        {completeness < 80 ? (
          <Pressable
            style={styles.banner}
            onPress={() => router.push('/onboarding/seeker/preview')}
          >
            <Text style={styles.bannerTitle}>
              {t('seeker.completeProfileBanner', { pct: completeness })}
            </Text>
            <Text style={styles.bannerSub}>{t('seeker.completeProfileSub')}</Text>
          </Pressable>
        ) : null}

        <Text style={styles.section}>{t('seeker.recommended')}</Text>
        {hasEmployerPosts ? (
          <Text style={styles.hint}>{t('seeker.includesEmployer')}</Text>
        ) : null}
        <FlatList
          horizontal
          data={recommended}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => (
            <SeekerJobCard
              job={item}
              onPress={() => router.push(`/(seeker)/job/${item.id}` as never)}
            />
          )}
          ListEmptyComponent={<Text style={styles.empty}>{t('seeker.noRecommendations')}</Text>}
        />

        <Text style={styles.section}>{t('seeker.latestIn', { city })}</Text>
        {latest.length === 0 ? (
          <Text style={styles.empty}>{t('seeker.noJobsInCity', { city })}</Text>
        ) : (
          latest.map((job) => (
            <View key={job.id} style={styles.latestCard}>
              <SeekerJobCard
                job={job}
                compact
                onPress={() => router.push(`/(seeker)/job/${job.id}` as never)}
              />
            </View>
          ))
        )}

        <Text style={styles.section}>{t('seeker.trendingSectors')}</Text>
        <View style={styles.chips}>
          {(feed?.sectors ?? []).map((s, i) => (
            <RanzoChip
              key={`sector-${s}-${i}`}
              label={s}
              onPress={() =>
                router.push({ pathname: '/(seeker)/(tabs)/search', params: { sector: s } })
              }
            />
          ))}
        </View>

        <Pressable onPress={() => router.push('/(seeker)/applications' as never)}>
          <Text style={styles.link}>View my applications →</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceCanvas },
  container: { paddingBottom: Spacing.xxl },
  header: {
    padding: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: { flex: 1 },
  greeting: { ...Typography.h1 },
  city: { ...Typography.caption, color: Colors.inkMuted },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.divider,
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.primarySoft,
    borderRadius: 12,
  },
  bannerTitle: { ...Typography.bodyStrong, color: Colors.primary },
  bannerSub: { ...Typography.caption },
  section: {
    ...Typography.h2,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  hint: {
    ...Typography.caption,
    color: Colors.inkMuted,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  horizontalList: { paddingLeft: Spacing.lg, paddingRight: Spacing.sm },
  latestCard: { paddingHorizontal: Spacing.lg },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  empty: { ...Typography.caption, padding: Spacing.lg, color: Colors.inkMuted },
  link: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
