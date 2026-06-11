import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '@/core/theme';
import { RanzoAppBar, RanzoButton } from '@/core/widgets';
import {
  approveBookingCompletion,
  getBookingCompletion,
  submitBookingDispute,
  submitBookingRating,
} from '@/core/api/customer';
import type { CompletionSummary } from '@/features/customer/types';
import { useTranslation } from '@/core/i18n';

const RATING_TAG_KEYS = ['punctual', 'professional', 'skilled', 'friendly', 'cleanWork'] as const;

/** M-C08: Service completion */
export default function ServiceCompletionScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [summary, setSummary] = useState<CompletionSummary | null>(null);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [showRating, setShowRating] = useState(false);
  const [stars, setStars] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    void getBookingCompletion(id).then(setSummary);
  }, [id]);

  const toggleTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const onApprove = async () => {
    if (!id) return;
    setLoading(true);
    try {
      await approveBookingCompletion(id);
      setShowRating(true);
    } finally {
      setLoading(false);
    }
  };

  const onDispute = async () => {
    if (!id || !disputeReason.trim()) return;
    await submitBookingDispute(id, disputeReason.trim());
    setDisputeOpen(false);
    Alert.alert(t('customer.disputeSubmitted'), t('customer.disputeReview'));
  };

  const onSubmitRating = async () => {
    if (!id || stars < 1) return;
    await submitBookingRating(id, stars, tags, review.trim() || undefined);
    router.replace('/(customer)/(tabs)' as never);
  };

  if (!summary) {
    return (
      <SafeAreaView style={styles.safe}>
        <RanzoAppBar title={t('customer.completionTitle')} showBack />
        <Text style={styles.loading}>{t('customer.loadingBill')}</Text>
      </SafeAreaView>
    );
  }

  if (showRating) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={Typography.h1}>{t('customer.rateExperience')}</Text>
          <Text style={styles.sub}>{t('customer.rateSub', { name: summary.technicianName })}</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} onPress={() => setStars(n)}>
                <Ionicons
                  name={n <= stars ? 'star' : 'star-outline'}
                  size={36}
                  color={Colors.warning}
                />
              </Pressable>
            ))}
          </View>
          <View style={styles.tagRow}>
            {RATING_TAG_KEYS.map((key) => {
              const label = t(`customer.ratingTags.${key}`);
              return (
              <Pressable
                key={key}
                style={[styles.tag, tags.includes(label) && styles.tagOn]}
                onPress={() => toggleTag(label)}
              >
                <Text style={[styles.tagTxt, tags.includes(label) && styles.tagTxtOn]}>{label}</Text>
              </Pressable>
            );})}
          </View>
          <TextInput
            style={styles.review}
            placeholder={t('customer.optionalReview')}
            value={review}
            onChangeText={setReview}
            multiline
          />
          <RanzoButton label={t('customer.submit')} onPress={onSubmitRating} disabled={stars < 1} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <RanzoAppBar title={t('customer.completionTitle')} showBack onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={Typography.h1}>{summary.serviceName}</Text>
        <Text style={styles.sub}>{t('customer.technician', { name: summary.technicianName })}</Text>

        <Text style={styles.section}>{t('customer.photoProof')}</Text>
        <View style={styles.gallery}>
          {summary.photosBefore.map((_, i) => (
            <View key={`b${i}`} style={styles.photoPh}>
              <Text style={styles.photoLabel}>{t('customer.before')}</Text>
            </View>
          ))}
          {summary.photosAfter.map((_, i) => (
            <View key={`a${i}`} style={[styles.photoPh, styles.photoAfter]}>
              <Text style={styles.photoLabel}>{t('customer.after')}</Text>
            </View>
          ))}
        </View>

        {summary.materials.length > 0 && (
          <>
            <Text style={styles.section}>{t('customer.materialsUsed')}</Text>
            {summary.materials.map((m) => (
              <View key={m.name} style={styles.lineRow}>
                <Text>{m.name}</Text>
                <Text>₹{m.price}</Text>
              </View>
            ))}
          </>
        )}

        <Text style={styles.section}>{t('customer.billBreakdown')}</Text>
        <View style={styles.lineRow}>
          <Text>{t('customer.serviceCharge')}</Text>
          <Text>₹{summary.serviceCharge}</Text>
        </View>
        <View style={styles.lineRow}>
          <Text>{t('customer.materials')}</Text>
          <Text>₹{summary.materialsTotal}</Text>
        </View>
        <View style={styles.lineRow}>
          <Text>{t('customer.tax')}</Text>
          <Text>₹{summary.tax}</Text>
        </View>
        <View style={[styles.lineRow, styles.totalRow]}>
          <Text style={Typography.bodyStrong}>{t('customer.total')}</Text>
          <Text style={Typography.bodyStrong}>₹{summary.total}</Text>
        </View>

        {!summary.approved && (
          <>
            {summary.prepaid ? (
              <RanzoButton label={t('customer.approveService')} onPress={onApprove} loading={loading} />
            ) : (
              <RanzoButton label={t('customer.approvePay')} onPress={onApprove} loading={loading} />
            )}
            <RanzoButton label={t('customer.dispute')} variant="ghost" onPress={() => setDisputeOpen(true)} />
          </>
        )}
        {summary.approved && (
          <RanzoButton label={t('customer.rateTech')} onPress={() => setShowRating(true)} />
        )}
      </ScrollView>

      <Modal visible={disputeOpen} animationType="slide">
        <SafeAreaView style={styles.disputeModal}>
          <Text style={Typography.h2}>{t('customer.openDispute')}</Text>
          <TextInput
            style={styles.disputeInput}
            placeholder={t('customer.disputePlaceholder')}
            value={disputeReason}
            onChangeText={setDisputeReason}
            multiline
          />
          <RanzoButton label={t('customer.submitDispute')} onPress={onDispute} />
          <RanzoButton label={t('common.cancel')} variant="ghost" onPress={() => setDisputeOpen(false)} />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  container: { padding: Spacing.lg, paddingBottom: Spacing.xxl, gap: Spacing.md },
  loading: { padding: Spacing.xl, textAlign: 'center' },
  sub: { ...Typography.caption, color: Colors.inkMuted },
  section: { ...Typography.h2, marginTop: Spacing.md },
  gallery: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  photoPh: {
    width: 100,
    height: 100,
    borderRadius: Radius.md,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoAfter: { backgroundColor: '#e8f5e9' },
  photoLabel: { ...Typography.caption, color: Colors.primary },
  lineRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.xs },
  totalRow: { borderTopWidth: 1, borderTopColor: Colors.divider, marginTop: Spacing.sm, paddingTop: Spacing.sm },
  stars: { flexDirection: 'row', gap: Spacing.sm, marginVertical: Spacing.lg },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  tag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  tagOn: { backgroundColor: Colors.primarySoft, borderColor: Colors.primary },
  tagTxt: { ...Typography.caption },
  tagTxtOn: { color: Colors.primary, fontWeight: '600' },
  review: {
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: Radius.md,
    padding: Spacing.md,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  disputeModal: { flex: 1, padding: Spacing.lg, gap: Spacing.md },
  disputeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: Radius.md,
    padding: Spacing.md,
    textAlignVertical: 'top',
  },
});
