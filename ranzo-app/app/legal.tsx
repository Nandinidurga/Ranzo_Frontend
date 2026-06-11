import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { Colors } from '@/core/theme';
import { RanzoAppBar } from '@/core/widgets';
import { LEGAL_URLS, type LegalDoc } from '@/core/config/legal';
import { t } from '@/core/i18n';

export default function LegalWebViewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ doc?: string }>();
  const doc = (params.doc === 'privacy' ? 'privacy' : 'terms') as LegalDoc;
  const url = LEGAL_URLS[doc];
  const title = doc === 'privacy' ? t('auth.privacyPolicy') : t('auth.termsOfService');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <RanzoAppBar
        title={title}
        showBack
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/auth/login'))}
      />
      <WebView
        source={{ uri: url }}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
