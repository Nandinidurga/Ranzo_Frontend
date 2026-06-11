import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, Radius, Spacing, Typography } from '@/core/theme';
import {
  RanzoAppBar,
  RanzoButton,
  RanzoTextField,
  StarRating,
} from '@/core/widgets';
import { useJobsStore } from '@/data/store';

export default function WorkerCompleteScreen() {
  const router = useRouter();
  const completeAcceptedJob = useJobsStore((s) => s.completeAcceptedJob);
  const job = useJobsStore((s) => s.acceptedJob);

  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    completeAcceptedJob();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setSubmitting(false);
    router.replace('/(worker)/dashboard');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <RanzoAppBar title="Rate the job" showBack />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.heroBox}>
            <Text style={[Typography.h1, { textAlign: 'center' }]}>
              How was the job?
            </Text>
            <Text style={[Typography.body, styles.subtitle]}>
              Tap the stars to rate {job?.employerName ?? 'the employer'}.
            </Text>
            <View style={{ height: Spacing.xl }} />
            <StarRating value={rating} onChange={setRating} size={42} />
          </View>

          <View style={{ height: Spacing.xl }} />

          <Text style={Typography.h2}>Anything to share?</Text>
          <RanzoTextField
            value={feedback}
            onChangeText={(t) => setFeedback(t.slice(0, 200))}
            placeholder="Optional feedback…"
            multiline
            helper={`${feedback.length}/200`}
          />

          <View style={{ flex: 1, minHeight: Spacing.xxl }} />

          <RanzoButton
            label="Submit"
            onPress={submit}
            disabled={rating === 0}
            loading={submitting}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  scroll: {
    padding: Spacing.lg,
    gap: Spacing.md,
    flexGrow: 1,
    paddingBottom: Spacing.xxl,
  },
  heroBox: {
    alignItems: 'center',
    backgroundColor: Colors.primarySoft,
    paddingVertical: Spacing.xxl,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
  },
  subtitle: {
    textAlign: 'center',
    color: Colors.inkMuted,
    marginTop: Spacing.sm,
  },
});
