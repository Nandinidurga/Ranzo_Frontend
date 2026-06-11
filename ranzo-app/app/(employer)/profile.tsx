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
import { useProfileMeScreen } from '@/core/hooks/useProfileMeScreen';
import { useAuthStore } from '@/data/store';
import { useJobsStore } from '@/data/store';
import {
  BottomNav,
  EmployerProfileForm,
  ProfileSectionHeader,
  RanzoButton,
} from '@/core/widgets';
import { t } from '@/core/i18n';

const TABS = [
  { label: 'Home', icon: 'home-outline' as const, iconActive: 'home' as const, href: '/(employer)/dashboard' },
  { label: 'Post', icon: 'add-circle-outline' as const, iconActive: 'add-circle' as const, href: '/(employer)/post' },
  { label: 'Profile', icon: 'person-outline' as const, iconActive: 'person' as const, href: '/(employer)/profile' },
];

function field(profile: Record<string, unknown> | null, key: string): string {
  const v = profile?.[key];
  return typeof v === 'string' && v.trim() ? v.trim() : '';
}

export default function EmployerProfileScreen() {
  const router = useRouter();
  const employer = useAuthStore((s) => s.employer);
  const primaryRole = useAuthStore((s) => s.primaryRole);
  const signOut = useAuthStore((s) => s.signOut);
  const jobs = useJobsStore((s) => s.employerJobs);
  const { phase, profileData, refreshing, reload } = useProfileMeScreen();
  const [editing, setEditing] = useState(false);

  const isCustomer = primaryRole === 'customer';
  const apiProfile = profileData?.profile ?? null;
  const showForm = phase === 'form' || editing;
  const formMode = phase === 'form' ? 'add' : 'edit';

  const completed = jobs.filter((j) => j.status === 'completed').length;

  const initials = (employer?.name ?? 'U')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleSaved = async () => {
    setEditing(false);
    await reload();
  };

  const openEditor = () => setEditing(true);

  const companyName = field(apiProfile, 'company_name') || employer?.name || '';
  const industry = field(apiProfile, 'industry');
  const city = field(apiProfile, 'city');
  const address = field(apiProfile, 'address');
  const contactName = field(apiProfile, 'hiring_contact_name');
  const contactPhone = field(apiProfile, 'hiring_contact_phone');
  const fullName = field(apiProfile, 'full_name') || employer?.name || '';
  const email = field(apiProfile, 'email');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {!showForm && employer && (
          <View style={styles.headerCard}>
            {refreshing && (
              <ActivityIndicator
                size="small"
                color={Colors.white}
                style={styles.refreshIndicator}
              />
            )}
            <View style={styles.avatar}>
              <Ionicons name="briefcase" size={28} color={Colors.primary} />
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={[Typography.h1, { color: Colors.white }]}>
              {employer.name}
            </Text>
            <Text style={{ color: Colors.primarySoft }}>{employer.phone}</Text>
            {phase === 'view' && (
              <>
                <View style={styles.statRow}>
                  <Stat label="Jobs Posted" value={String(jobs.length)} />
                  <View style={styles.statDivider} />
                  <Stat label="Completed" value={String(completed)} />
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
            <EmployerProfileForm
              mode={formMode}
              initialProfile={apiProfile}
              onSaved={handleSaved}
              onCancel={editing ? () => setEditing(false) : undefined}
            />
          </View>
        )}

        {phase === 'view' && !showForm && (
          <>
            {isCustomer ? (
              <>
                <View style={styles.section}>
                  <ProfileSectionHeader
                    title={t('auth.namePlaceholder')}
                    hasValue={!!fullName}
                    onAction={openEditor}
                  />
                  <DetailRow value={fullName} />
                </View>
                <View style={styles.section}>
                  <ProfileSectionHeader
                    title="Email"
                    hasValue={!!email}
                    onAction={openEditor}
                  />
                  <DetailRow value={email} />
                </View>
              </>
            ) : (
              <>
                <View style={styles.section}>
                  <ProfileSectionHeader
                    title={t('profile.companyName')}
                    hasValue={!!companyName}
                    onAction={openEditor}
                  />
                  <DetailRow value={companyName} />
                </View>
                <View style={styles.section}>
                  <ProfileSectionHeader
                    title={t('profile.industry')}
                    hasValue={!!industry}
                    onAction={openEditor}
                  />
                  <DetailRow value={industry} />
                </View>
                <View style={styles.section}>
                  <ProfileSectionHeader
                    title={t('profile.city')}
                    hasValue={!!city}
                    onAction={openEditor}
                  />
                  <DetailRow value={city} />
                </View>
                <View style={styles.section}>
                  <ProfileSectionHeader
                    title={t('profile.address')}
                    hasValue={!!address}
                    onAction={openEditor}
                  />
                  <DetailRow value={address} />
                </View>
                <View style={styles.section}>
                  <ProfileSectionHeader
                    title={t('profile.hiringContactName')}
                    hasValue={!!contactName}
                    onAction={openEditor}
                  />
                  <DetailRow value={contactName} />
                </View>
                <View style={styles.section}>
                  <ProfileSectionHeader
                    title={t('profile.hiringContactPhone')}
                    hasValue={!!contactPhone}
                    onAction={openEditor}
                  />
                  <DetailRow value={contactPhone} />
                </View>
              </>
            )}
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
      <BottomNav items={TABS} />
    </SafeAreaView>
  );
}

function DetailRow({ value }: { value: string }) {
  return (
    <Text style={[Typography.body, !value && { color: Colors.inkMuted }]}>
      {value || t('profile.notSetYet')}
    </Text>
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
    position: 'relative',
  },
  avatarText: {
    position: 'absolute',
    bottom: 4,
    fontSize: 11,
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
  loadingBox: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.md,
  },
});
