import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { Colors } from '@/core/theme';
import { RanzoAppBar } from '@/core/widgets';
import { useTechnicianWizardStore } from '@/features/technician/stores/wizardStore';

const DEMO_HTML = `
<!DOCTYPE html>
<html><head><meta name="viewport" content="width=device-width, initial-scale=1">
<style>body{font-family:sans-serif;padding:24px;text-align:center;background:#f8fafc}
button{background:#6B2C8C;color:#fff;border:none;padding:16px 32px;font-size:16px;border-radius:8px;margin-top:24px}
h2{color:#1e293b}</style></head>
<body>
<h2>DigiLocker Authorization</h2>
<p>Demo OAuth flow — tap below to simulate successful Aadhaar verification.</p>
<button onclick="window.ReactNativeWebView.postMessage('verified')">Authorize & Verify</button>
</body></html>`;

/** DigiLocker OAuth (demo WebView) */
export default function DigiLockerScreen() {
  const router = useRouter();
  const patch = useTechnicianWizardStore((s) => s.patch);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <RanzoAppBar title="DigiLocker" showBack />
      <WebView
        source={{ html: DEMO_HTML }}
        style={styles.web}
        onMessage={(e) => {
          if (e.nativeEvent.data === 'verified') {
            patch({ aadhaarVerified: true });
            router.back();
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  web: { flex: 1 },
});
