import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography } from '@/core/theme';
import { choosePlatformRole } from '@/core/onboarding/chooseRole';
import type { RoleSubOption } from '@/features/onboarding/components/RoleSubPickerModal';
import { RoleSubRoleCard } from '@/features/onboarding/components/RoleSubRoleCard';
import { GoBackLink, RanzoAppBar } from '@/core/widgets';
import type { PlatformRole } from '@/data/models';

type Props = {
  title?: string;
  subtitle: string;
  options: RoleSubOption[];
  /** Defaults to router.back() */
  onBack?: () => void;
};

export function RoleSubRoleScreen({ title, subtitle, options, onBack }: Props) {
  const router = useRouter();
  const handleBack = onBack ?? (() => router.back());
  const [selected, setSelected] = useState<PlatformRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onChoose = async (role: PlatformRole) => {
    if (loading) return;
    setSelected(role);
    setError(null);
    setLoading(true);
    try {
      await choosePlatformRole(router, role);
    } catch (e: unknown) {
      setSelected(null);
      setError((e as { message?: string })?.message ?? 'Could not save your role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <RanzoAppBar title={title} showBack onBack={handleBack} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <View style={styles.cards}>
          {options.map((opt) => (
            <RoleSubRoleCard
              key={opt.id}
              option={opt}
              selected={selected === opt.id}
              disabled={loading}
              onPress={() => onChoose(opt.id)}
            />
          ))}
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <GoBackLink onPress={handleBack} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.inkMuted,
    textAlign: 'center',
  },
  cards: { gap: Spacing.md },
  error: {
    ...Typography.caption,
    color: Colors.danger,
    textAlign: 'center',
  },
});
