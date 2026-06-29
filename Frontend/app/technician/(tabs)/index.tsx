import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Switch,
  ScrollView,
  Image,
  Pressable,
  DeviceEventEmitter,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Elevation } from '@/core/theme';
import { RanzoAppBar, RanzoButton } from '@/core/widgets';
import { getProfileMe, updateProfileMe, TechnicianProfile } from '@/core/api/profiles';
import { apiUrl } from '@/core/config/api';
import { useAuthStore } from '@/data/store';
import { getActiveBookings, Booking } from '@/core/api/bookings';

function formatSkill(str: string) {
  return str.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default function TechnicianDashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [profile, setProfile] = useState<TechnicianProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [online, setOnline] = useState(false);
  const [togglingOnline, setTogglingOnline] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const fetchData = async () => {
    try {
      const [profData, bookData] = await Promise.all([
        getProfileMe('technician'),
        getActiveBookings('technician')
      ]);
      setProfile(profData as TechnicianProfile);
      setOnline((profData as TechnicianProfile).online_status);
      setBookings(bookData);
    } catch (err: any) {
      if (loading) setError(err?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const sub = DeviceEventEmitter.addListener('refresh_bookings', () => {
      fetchData();
    });
    return () => sub.remove();
  }, []);

  const handleToggleOnline = async (val: boolean) => {
    if (!profile || togglingOnline) return;
    setOnline(val);
    setTogglingOnline(true);
    try {
      const updated = await updateProfileMe('technician', {
        skills: profile.skills,
        online_status: val,
      }) as TechnicianProfile;
      setProfile(updated);
    } catch (err: any) {
      // Revert on error
      setOnline(!val);
      alert(err?.message || 'Failed to update status.');
    } finally {
      setTogglingOnline(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <RanzoAppBar 
        title="Technician Dashboard" 
        trailing={
          <Pressable onPress={() => router.push('/profile-details?role=technician' as any)}>
            {profile?.photo_url ? (
              <Image 
                source={{ uri: apiUrl(profile.photo_url) }} 
                style={styles.avatar} 
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={20} color={Colors.inkMuted} />
              </View>
            )}
          </Pressable>
        }
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={44} color={Colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

          {/* Welcome */}
          <View style={styles.welcomeCard}>
            <Ionicons name="hammer-outline" size={36} color={Colors.primary} />
            <View style={styles.welcomeText}>
              <Text style={styles.welcomeName}>Hello, {user?.name || 'Technician'} 👋</Text>
              <Text style={styles.welcomeSub}>Manage your availability below</Text>
            </View>
          </View>

          {!profile?.is_approved && (
            <View style={styles.pendingBanner}>
              <Ionicons name="time-outline" size={24} color={Colors.warning} />
              <View style={{ flex: 1 }}>
                <Text style={styles.pendingTitle}>Pending Admin Approval</Text>
                <Text style={styles.pendingDesc}>
                  Your profile is being reviewed by an administrator. You cannot accept bookings until approved.
                </Text>
              </View>
            </View>
          )}

          {/* Online Status Toggle — backed by PUT /profiles/me?role=technician */}
          <View style={[styles.statusCard, online ? styles.onlineCard : styles.offlineCard]}>
            <View style={styles.statusInfo}>
              <Ionicons
                name={online ? 'radio-outline' : 'power-outline'}
                size={28}
                color={online ? Colors.success : Colors.inkMuted}
              />
              <View>
                <Text style={styles.statusTitle}>{online ? 'You are Online' : 'You are Offline'}</Text>
                <Text style={styles.statusDesc}>
                  {!profile?.is_approved
                    ? 'You must be approved by an admin to go online.'
                    : online
                    ? 'Visible to customers for service requests.'
                    : 'Toggle to go online and receive requests.'}
                </Text>
              </View>
            </View>
            <Switch
              value={online}
              onValueChange={handleToggleOnline}
              trackColor={{ false: Colors.divider, true: Colors.successSoft }}
              thumbColor={online ? Colors.success : Colors.inkMuted}
              disabled={togglingOnline || !profile?.is_approved}
            />
          </View>

          
          {/* Active Bookings Section */}
          <View style={styles.section}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md }}>
              <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Active & Incoming Jobs</Text>
              <Pressable onPress={fetchData} style={{ padding: Spacing.xs }}>
                <Ionicons name="reload" size={22} color={Colors.primary} />
              </Pressable>
            </View>
            {bookings.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={36} color={Colors.inkMuted} />
                <Text style={styles.emptyDesc}>No active requests. Stay online to receive jobs.</Text>
              </View>
            ) : (
              bookings.map((b) => (
                <Pressable 
                  key={b.id} 
                  style={styles.jobCard} 
                  onPress={() => router.push({ pathname: '/technician/booking-details', params: { id: b.id } } as any)}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.jobCategory}>{b.category}</Text>
                    <Ionicons name="chevron-forward" size={20} color={Colors.inkMuted} />
                  </View>
                  <Text style={styles.jobStatusLabel}>{b.status.replace(/_/g, ' ')}</Text>
                  <Text style={styles.jobDesc} numberOfLines={2}>{b.problem_description}</Text>
                  
                  {b.status === 'BROADCASTING' && (
                    <Text style={{color: Colors.warning, marginTop: Spacing.xs, fontWeight: '600'}}>New Job Request!</Text>
                  )}
                  {b.status === 'TECH_ACCEPTED' && (
                    <Text style={{color: Colors.warning, marginTop: Spacing.xs, fontWeight: '600'}}>Waiting for customer to confirm...</Text>
                  )}
                  {['CUSTOMER_CONFIRMED', 'IN_TRANSIT', 'IN_PROGRESS'].includes(b.status) && (
                     <Text style={styles.jobAddress}>
                        Tap to manage job & OTPs
                     </Text>
                  )}
                </Pressable>
              ))
            )}
          </View>

          {/* Registered Skills */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Registered Skills</Text>
            {profile?.skills && profile.skills.length > 0 ? (
              <View style={styles.skillsList}>
                {profile.skills.map((skill) => (
                  <View key={skill} style={styles.skillItem}>
                    <Ionicons name="ribbon-outline" size={16} color={Colors.primary} />
                    <Text style={styles.skillText}>{formatSkill(skill)}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="ribbon-outline" size={36} color={Colors.inkMuted} />
                <Text style={styles.emptyDesc}>No skills registered. Update your profile.</Text>
              </View>
            )}
          </View>



        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  container: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.xl,
  },
  welcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.primarySoft,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    ...Elevation.card,
  },
  welcomeText: { flex: 1 },
  welcomeName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.inkNavy,
  },
  welcomeSub: {
    fontSize: 13,
    color: Colors.inkMuted,
    marginTop: 2,
  },
  jobCard: {
    padding: Spacing.lg,
    backgroundColor: Colors.surfaceCanvas,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.divider,
    gap: Spacing.xs,
    ...Elevation.card,
  },
  jobCategory: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.inkNavy,
  },
  jobStatusLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  jobDesc: {
    fontSize: 14,
    color: Colors.inkBody,
  },
  jobAddress: {
    fontSize: 13,
    color: Colors.inkMuted,
    marginTop: 4,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    ...Elevation.card,
  },
  onlineCard: {
    backgroundColor: Colors.successSoft,
    borderColor: Colors.success,
  },
  offlineCard: {
    backgroundColor: Colors.surfaceCanvas,
    borderColor: Colors.divider,
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    borderColor: '#ffeeba',
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  pendingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#856404',
  },
  pendingDesc: {
    fontSize: 12,
    color: '#856404',
    marginTop: 2,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.inkNavy,
  },
  statusDesc: {
    fontSize: 12,
    color: Colors.inkMuted,
    marginTop: 2,
  },
  section: { gap: Spacing.md },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.inkNavy,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  skillText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xxl,
    backgroundColor: Colors.surfaceCanvas,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.divider,
    gap: Spacing.md,
  },
  emptyDesc: {
    fontSize: 13,
    color: Colors.inkMuted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: Spacing.md,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceCanvas,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceCanvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletNavCard: {
    backgroundColor: Colors.surfaceCanvas,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primarySoft,
    ...Elevation.card,
  },
  walletNavContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  walletNavTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.inkNavy,
  },
  walletNavDesc: {
    fontSize: 12,
    color: Colors.inkMuted,
    marginTop: 2,
  },
});
