import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '@/core/theme';

const ITEMS = [
  { id: '1', title: 'New job match', body: 'Field Sales Executive matches your profile' },
  { id: '2', title: 'Application viewed', body: 'Bright Retail viewed your application' },
];

export default function SeekerNotificationsTab() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>Notifications</Text>
      <FlatList
        data={ITEMS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={Typography.bodyStrong}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  title: { ...Typography.h1, padding: Spacing.lg },
  list: { paddingHorizontal: Spacing.lg },
  item: { paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  body: { ...Typography.caption, marginTop: 4 },
});
