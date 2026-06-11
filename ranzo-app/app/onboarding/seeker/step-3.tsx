import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '@/core/theme';
import { RanzoAppBar, RanzoButton, RanzoTextField } from '@/core/widgets';
import { WizardProgress } from '@/features/seeker/components/WizardProgress';
import { useSeekerWizardStore } from '@/features/seeker/stores/wizardStore';
import type { Education, WorkExperience } from '@/features/seeker/types';

function newId() {
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export default function SeekerWizardStep3() {
  const router = useRouter();
  const { draft, patch } = useSeekerWizardStore();
  const [expModal, setExpModal] = useState(false);
  const [eduModal, setEduModal] = useState(false);
  const [editingExp, setEditingExp] = useState<WorkExperience | null>(null);
  const [editingEdu, setEditingEdu] = useState<Education | null>(null);

  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [degree, setDegree] = useState('');
  const [institution, setInstitution] = useState('');
  const [year, setYear] = useState('');
  const [score, setScore] = useState('');

  const openExp = (item?: WorkExperience) => {
    setEditingExp(item ?? null);
    setCompany(item?.company ?? '');
    setRole(item?.role ?? '');
    setStartDate(item?.startDate ?? '');
    setEndDate(item?.endDate ?? '');
    setDescription(item?.description ?? '');
    setExpModal(true);
  };

  const saveExp = () => {
    const entry: WorkExperience = {
      id: editingExp?.id ?? newId(),
      company: company.trim(),
      role: role.trim(),
      startDate,
      endDate: endDate || undefined,
      description: description.trim() || undefined,
    };
    const list = editingExp
      ? draft.experiences.map((e) => (e.id === entry.id ? entry : e))
      : [...draft.experiences, entry];
    patch({ experiences: list, skippedExperience: false });
    setExpModal(false);
  };

  const openEdu = (item?: Education) => {
    setEditingEdu(item ?? null);
    setDegree(item?.degree ?? '');
    setInstitution(item?.institution ?? '');
    setYear(item?.year ?? '');
    setScore(item?.score ?? '');
    setEduModal(true);
  };

  const saveEdu = () => {
    const entry: Education = {
      id: editingEdu?.id ?? newId(),
      degree: degree.trim(),
      institution: institution.trim(),
      year: year.trim(),
      score: score.trim() || undefined,
    };
    const list = editingEdu
      ? draft.education.map((e) => (e.id === entry.id ? entry : e))
      : [...draft.education, entry];
    patch({ education: list });
    setEduModal(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <RanzoAppBar title="Experience" showBack />
      <ScrollView contentContainerStyle={styles.container}>
        <WizardProgress step={3} title="Experience & education" />

        <View style={styles.sectionHead}>
          <Text style={Typography.h2}>Work experience</Text>
          <Pressable onPress={() => openExp()}>
            <Text style={styles.add}>+ Add</Text>
          </Pressable>
        </View>
        {draft.experiences.map((exp) => (
          <View key={exp.id} style={styles.item}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{exp.role} · {exp.company}</Text>
              <Text style={styles.itemSub}>{exp.startDate} – {exp.endDate ?? 'Present'}</Text>
            </View>
            <Pressable onPress={() => openExp(exp)}><Ionicons name="create-outline" size={20} color={Colors.primary} /></Pressable>
            <Pressable onPress={() => patch({ experiences: draft.experiences.filter((e) => e.id !== exp.id) })}>
              <Ionicons name="trash-outline" size={20} color={Colors.danger} />
            </Pressable>
          </View>
        ))}
        <Pressable onPress={() => patch({ skippedExperience: true, experiences: [] })}>
          <Text style={styles.skip}>Skip — I&apos;m a fresher</Text>
        </Pressable>

        <View style={[styles.sectionHead, { marginTop: Spacing.xl }]}>
          <Text style={Typography.h2}>Education</Text>
          <Pressable onPress={() => openEdu()}>
            <Text style={styles.add}>+ Add</Text>
          </Pressable>
        </View>
        {draft.education.map((edu) => (
          <View key={edu.id} style={styles.item}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{edu.degree}</Text>
              <Text style={styles.itemSub}>{edu.institution} · {edu.year}</Text>
            </View>
            <Pressable onPress={() => openEdu(edu)}><Ionicons name="create-outline" size={20} color={Colors.primary} /></Pressable>
            <Pressable onPress={() => patch({ education: draft.education.filter((e) => e.id !== edu.id) })}>
              <Ionicons name="trash-outline" size={20} color={Colors.danger} />
            </Pressable>
          </View>
        ))}

        <RanzoButton label="Continue" onPress={() => router.push('/onboarding/seeker/step-4')} style={{ marginTop: Spacing.lg }} />
      </ScrollView>

      <Modal visible={expModal} animationType="slide">
        <SafeAreaView style={styles.modal}>
          <Text style={Typography.h2}>Work experience</Text>
          <RanzoTextField label="Company" value={company} onChangeText={setCompany} />
          <RanzoTextField label="Role" value={role} onChangeText={setRole} />
          <RanzoTextField label="Start (YYYY-MM)" value={startDate} onChangeText={setStartDate} />
          <RanzoTextField label="End (optional)" value={endDate} onChangeText={setEndDate} />
          <RanzoTextField label="Description" value={description} onChangeText={setDescription} multiline />
          <RanzoButton label="Save" onPress={saveExp} />
          <RanzoButton label="Cancel" variant="ghost" onPress={() => setExpModal(false)} />
        </SafeAreaView>
      </Modal>

      <Modal visible={eduModal} animationType="slide">
        <SafeAreaView style={styles.modal}>
          <Text style={Typography.h2}>Education</Text>
          <RanzoTextField label="Degree" value={degree} onChangeText={setDegree} />
          <RanzoTextField label="Institution" value={institution} onChangeText={setInstitution} />
          <RanzoTextField label="Year" value={year} onChangeText={setYear} />
          <RanzoTextField label="Score (optional)" value={score} onChangeText={setScore} />
          <RanzoButton label="Save" onPress={saveEdu} />
          <RanzoButton label="Cancel" variant="ghost" onPress={() => setEduModal(false)} />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  container: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  add: { color: Colors.primary, fontWeight: '700' },
  item: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  itemTitle: { ...Typography.bodyStrong },
  itemSub: { ...Typography.caption },
  skip: { color: Colors.inkMuted, textDecorationLine: 'underline', marginTop: Spacing.sm },
  modal: { flex: 1, padding: Spacing.lg, gap: Spacing.md },
});
