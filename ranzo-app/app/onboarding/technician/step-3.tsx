import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography } from '@/core/theme';
import { RanzoAppBar, RanzoButton, RanzoChip, RanzoTextField } from '@/core/widgets';
import { SUBCATEGORIES } from '@/features/customer/mock/catalog';
import { ServiceRadiusSlider } from '@/features/technician/components/ServiceRadiusSlider';
import { saveTechnicianServices } from '@/core/api/technician';
import { useTechnicianStore } from '@/features/technician/stores/technicianStore';
import { useTechnicianWizardStore } from '@/features/technician/stores/wizardStore';
import type { TechnicianServiceRate } from '@/features/technician/stores/wizardStore';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** M-T03: Services & rates */
export default function TechnicianWizardStep3() {
  const router = useRouter();
  const { draft, patch } = useTechnicianWizardStore();
  const markProfileComplete = useTechnicianStore((s) => s.markProfileComplete);
  const [loading, setLoading] = useState(false);

  const toggleService = (sub: (typeof SUBCATEGORIES)[0]) => {
    const exists = draft.services.find((s) => s.subcategoryId === sub.id);
    if (exists) {
      patch({ services: draft.services.filter((s) => s.subcategoryId !== sub.id) });
      return;
    }
    const entry: TechnicianServiceRate = {
      subcategoryId: sub.id,
      name: sub.name,
      hourlyRate: String(sub.priceMin),
      experienceYears: '2',
    };
    patch({ services: [...draft.services, entry] });
  };

  const updateService = (id: string, field: keyof TechnicianServiceRate, value: string) => {
    patch({
      services: draft.services.map((s) =>
        s.subcategoryId === id ? { ...s, [field]: value } : s
      ),
    });
  };

  const toggleDay = (day: string) => {
    const days = draft.workingDays.includes(day)
      ? draft.workingDays.filter((d) => d !== day)
      : [...draft.workingDays, day];
    patch({ workingDays: days });
  };

  const finish = async () => {
    setLoading(true);
    try {
      await saveTechnicianServices(draft);
      markProfileComplete();
      router.push('/onboarding/technician/payouts' as never);
    } finally {
      setLoading(false);
    }
  };

  const valid = draft.services.length > 0 && draft.workingDays.length > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <RanzoAppBar title="Services (3/4)" showBack />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Select services you offer</Text>
        <View style={styles.chips}>
          {SUBCATEGORIES.map((sub) => (
            <RanzoChip
              key={sub.id}
              label={sub.name}
              selected={draft.services.some((s) => s.subcategoryId === sub.id)}
              onPress={() => toggleService(sub)}
            />
          ))}
        </View>

        {draft.services.map((svc) => (
          <View key={svc.subcategoryId} style={styles.rateCard}>
            <Text style={Typography.bodyStrong}>{svc.name}</Text>
            <RanzoTextField
              label="Hourly rate (₹)"
              value={svc.hourlyRate}
              onChangeText={(v) => updateService(svc.subcategoryId, 'hourlyRate', v)}
              keyboardType="number-pad"
            />
            <RanzoTextField
              label="Experience (years)"
              value={svc.experienceYears}
              onChangeText={(v) => updateService(svc.subcategoryId, 'experienceYears', v)}
              keyboardType="number-pad"
            />
          </View>
        ))}

        <RanzoTextField
          label="Working hours start"
          value={draft.workingHoursStart}
          onChangeText={(workingHoursStart) => patch({ workingHoursStart })}
        />
        <RanzoTextField
          label="Working hours end"
          value={draft.workingHoursEnd}
          onChangeText={(workingHoursEnd) => patch({ workingHoursEnd })}
        />

        <Text style={styles.label}>Working days</Text>
        <View style={styles.chips}>
          {DAYS.map((d) => (
            <RanzoChip
              key={d}
              label={d}
              selected={draft.workingDays.includes(d)}
              onPress={() => toggleDay(d)}
            />
          ))}
        </View>

        <ServiceRadiusSlider
          value={draft.serviceRadiusKm}
          onChange={(serviceRadiusKm) => patch({ serviceRadiusKm })}
        />

        <RanzoButton label="Continue to payouts" onPress={finish} loading={loading} disabled={!valid} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  container: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxl },
  label: { ...Typography.bodyStrong },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  rateCard: {
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: 12,
    gap: Spacing.sm,
  },
});
