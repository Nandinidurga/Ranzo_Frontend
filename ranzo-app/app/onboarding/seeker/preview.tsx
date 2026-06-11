import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography } from '@/core/theme';
import { RanzoAppBar, RanzoButton } from '@/core/widgets';
import { WizardProgress } from '@/features/seeker/components/WizardProgress';
import { useSeekerWizardStore } from '@/features/seeker/stores/wizardStore';
import { useAuthStore } from '@/data/store';

export default function SeekerWizardPreview() {
  const router = useRouter();
  const { draft } = useSeekerWizardStore();
  const worker = useAuthStore((s) => s.worker);

  const finish = async () => {
    await useAuthStore.getState().setUserMeta({
      userId: useAuthStore.getState().userId,
      isDetailsFilled: true,
    });
    if (worker) {
      await useAuthStore.getState().setWorker({
        ...worker,
        name: draft.fullName,
        isDetailsFilled: true,
      });
    }
    router.replace('/(seeker)/(tabs)' as never);
  };

  const Section = ({
    title,
    onEdit,
    children,
  }: {
    title: string;
    onEdit: () => void;
    children: React.ReactNode;
  }) => (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Pressable onPress={onEdit}><Text style={styles.edit}>Edit</Text></Pressable>
      </View>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <RanzoAppBar title="Preview" showBack />
      <ScrollView contentContainerStyle={styles.container}>
        <WizardProgress step={5} title="Review your profile" />

        <Section title="Basic info" onEdit={() => router.push('/onboarding/seeker/step-1')}>
          {draft.photoUri ? <Image source={{ uri: draft.photoUri }} style={styles.photo} /> : null}
          <Text>{draft.fullName}</Text>
          <Text style={styles.muted}>{draft.city} · {draft.gender}</Text>
          {draft.email ? <Text style={styles.muted}>{draft.email}</Text> : null}
        </Section>

        <Section title="Skills" onEdit={() => router.push('/onboarding/seeker/step-2')}>
          {draft.skills.map((s) => (
            <Text key={s.name}>• {s.name} ({s.level})</Text>
          ))}
        </Section>

        <Section title="Experience" onEdit={() => router.push('/onboarding/seeker/step-3')}>
          {draft.skippedExperience ? (
            <Text style={styles.muted}>Fresher</Text>
          ) : (
            draft.experiences.map((e) => (
              <Text key={e.id}>{e.role} at {e.company}</Text>
            ))
          )}
        </Section>

        <Section title="Preferences" onEdit={() => router.push('/onboarding/seeker/step-4')}>
          <Text>₹{draft.salaryMin}–{draft.salaryMax} per {draft.salaryPeriod}</Text>
          <Text style={styles.muted}>Availability: {draft.availability}</Text>
          <Text style={styles.muted}>Relocate: {draft.openToRelocate ? 'Yes' : 'No'}</Text>
        </Section>

        <RanzoButton label="Save & Continue" onPress={finish} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  container: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  section: { marginBottom: Spacing.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.divider, borderRadius: 12 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  sectionTitle: { ...Typography.bodyStrong },
  edit: { color: Colors.primary, fontWeight: '700' },
  muted: { ...Typography.caption, color: Colors.inkMuted },
  photo: { width: 64, height: 64, borderRadius: 32, marginBottom: Spacing.sm },
});
