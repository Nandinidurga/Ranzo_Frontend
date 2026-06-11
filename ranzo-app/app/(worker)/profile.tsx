import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Elevation, Radius, Spacing, Typography } from '@/core/theme';
import { WORKER_BOTTOM_NAV_ITEMS } from '@/core/config/workerBottomNav';
import { useProfileMeScreen } from '@/core/hooks/useProfileMeScreen';
import {
  BottomNav,
  ProfileSectionHeader,
  RanzoButton,
  RanzoChip,
  WorkerProfileForm,
} from '@/core/widgets';
import { useAuthStore } from '@/data/store';
import { t } from '@/core/i18n';

export default function WorkerProfileScreen() {
  const worker = useAuthStore((s) => s.worker);
  const signOut = useAuthStore((s) => s.signOut);
  const router = useRouter();
  const { phase, profileData, refreshing, reload } = useProfileMeScreen();
  const [editing, setEditing] = useState(false);

  const apiProfile = profileData?.profile ?? null;
  const showForm = phase === 'form' || editing;
  const formMode = phase === 'form' ? 'add' : 'edit';

  const handleSaved = async () => {
    setEditing(false);
    await reload();
  };

  if (!worker && phase === 'view' && !editing) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Text style={[Typography.body, { padding: Spacing.lg }]}>No profile</Text>
        <BottomNav items={WORKER_BOTTOM_NAV_ITEMS} />
      </SafeAreaView>
    );
  }

  const initials = (worker?.name ?? 'U')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const skills = worker?.skills ?? [];
  const openEditor = () => setEditing(true);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {!showForm && (
          <View style={styles.headerCard}>
            {refreshing && (
              <ActivityIndicator
                size="small"
                color={Colors.white}
                style={styles.refreshIndicator}
              />
            )}
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={[Typography.h1, { color: Colors.white }]}>
              {worker?.name ?? '—'}
            </Text>
            <Text style={{ color: Colors.primarySoft }}>{worker?.phone}</Text>
            {phase === 'view' && worker && (
              <>
                <View style={styles.statRow}>
                  <Stat
                    label="Rating"
                    value={worker.rating ? worker.rating.toFixed(1) : '—'}
                  />
                  <View style={styles.statDivider} />
                  <Stat label="Jobs" value={String(worker.jobsCompleted ?? 0)} />
                  <View style={styles.statDivider} />
                  <Stat label="Status" value={worker.online ? 'Online' : 'Offline'} />
                </View>
                <RanzoButton
                  label={t('profile.editProfile')}
                  variant="secondary"
                  onPress={openEditor}
                  leadingIcon={
                    <Ionicons name="pencil" size={16} color={Colors.primary} />
                  }
                  style={styles.headerActionBtn}
                />
              </>
            )}
          </View>
        )}

        {phase === 'loading' && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={[Typography.body, { color: Colors.inkMuted }]}>
              {t('profile.loading')}
            </Text>
          </View>
        )}

        {showForm && phase !== 'loading' && (
          <View style={styles.section}>
            <WorkerProfileForm
              mode={formMode}
              initialProfile={apiProfile}
              onSaved={handleSaved}
              onCancel={editing ? () => setEditing(false) : undefined}
            />
          </View>
        )}

        {phase === 'view' && !showForm && worker && (
          <>
            <View style={styles.section}>
              <ProfileSectionHeader
                title="Skills"
                hasValue={skills.length > 0}
                onAction={openEditor}
              />
              <View style={styles.chips}>
                {skills.length ? (
                  skills.map((s) => <RanzoChip key={s} label={s} selected />)
                ) : (
                  <Text style={styles.emptyHint}>{t('profile.notSetYet')}</Text>
                )}
              </View>
            </View>

            <View style={styles.section}>
              <ProfileSectionHeader
                title="Experience"
                hasValue={!!worker.experience}
                onAction={openEditor}
              />
              <View style={styles.chips}>
                {worker.experience ? (
                  <RanzoChip label={worker.experience} selected />
                ) : (
                  <Text style={styles.emptyHint}>{t('profile.notSetYet')}</Text>
                )}
              </View>
            </View>

            <View style={styles.section}>
              <ProfileSectionHeader
                title="Location"
                hasValue={!!worker.address}
                onAction={openEditor}
              />
              <View style={styles.locRow}>
                <Ionicons name="location" size={20} color={Colors.primary} />
                <Text style={[Typography.body, { flex: 1 }]} numberOfLines={3}>
                  {worker.address ?? t('profile.notSetYet')}
                </Text>
              </View>
            </View>
          </>
        )}

        {phase === 'view' && !showForm && (
          <View style={[styles.section, { marginTop: Spacing.xl }]}>
            <RanzoButton
              label="Sign out"
              variant="ghost"
              onPress={async () => {
                await signOut();
                router.replace('/role');
              }}
            />
          </View>
        )}
      </ScrollView>
      <BottomNav items={WORKER_BOTTOM_NAV_ITEMS} />
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ color: Colors.white, fontSize: 18, fontWeight: '800' }}>
        {value}
      </Text>
      <Text style={{ color: Colors.primarySoft, fontSize: 12, marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  scroll: { paddingBottom: Spacing.xxl },
  headerCard: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.sm,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
    ...Elevation.card,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.primary,
  },
  statRow: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryDark,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.lg,
    alignSelf: 'stretch',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.primarySoft,
    opacity: 0.3,
  },
  refreshIndicator: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.lg,
  },
  headerActionBtn: {
    marginTop: Spacing.md,
    alignSelf: 'stretch',
  },
  section: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    gap: Spacing.sm,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyHint: {
    ...Typography.body,
    color: Colors.inkMuted,
  },
  loadingBox: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.md,
  },
});
