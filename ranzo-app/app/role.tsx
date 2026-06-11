import React from 'react';
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Elevation, Radius, Spacing, Typography } from '@/core/theme';
import { RanzoWordmark } from '@/core/widgets';
import { useAuthStore } from '@/data/store';
import { Role } from '@/data/models';
import { appModeForUiRole } from '@/core/config/app';
import { t, useI18nStore } from '@/core/i18n';
import { API_BASE_URL } from '@/core/config/api';
import { health } from '@/core/api/health';

const HERO_SLIDES: { id: string; source: ImageSourcePropType }[] = [
  { id: 'h1', source: require('@/assets/hero/hero01.png') },
  { id: 'h2', source: require('@/assets/hero/hero02.png') },
  { id: 'h3', source: require('@/assets/hero/hero03.png') },
  { id: 'h4', source: require('@/assets/hero/hero04.png') },
  { id: 'h5', source: require('@/assets/hero/hero05.png') },
  { id: 'h6', source: require('@/assets/hero/hero06.png') },
  { id: 'h7', source: require('@/assets/hero/hero07.png') },
];

const HERO_ROTATE_MS = 3200;

export default function RoleSelectionScreen() {
  const router = useRouter();
  const setRole = useAuthStore((s) => s.setRole);
  const setAppModule = useAuthStore((s) => s.setAppModule);
  const locale = useI18nStore((s) => s.locale);
  const setLocale = useI18nStore((s) => s.setLocale);
  const [heroIndex, setHeroIndex] = React.useState(0);

  const choose = async (role: Role) => {
    await setAppModule(appModeForUiRole(role));
    await setRole(role);
    router.push({ pathname: '/auth/login', params: { role } } as const);
  };

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'te', label: 'తెలుగు' },
  ];

  const currentLang = languages.find((l) => l.code === locale)?.label ?? locale;
  const [backendOk, setBackendOk] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    let mounted = true;
    health()
      .then(() => mounted && setBackendOk(true))
      .catch(() => mounted && setBackendOk(false));
    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    const n = HERO_SLIDES.length;
    const timer = setInterval(() => {
      setHeroIndex((i) => (i + 1) % n);
    }, HERO_ROTATE_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <RanzoWordmark size={40} />
        </View>

        <View style={styles.showcase}>
          <LinearGradient
            colors={[Colors.surfaceWhite, Colors.primarySoft, Colors.surfaceWhite]}
            locations={[0, 0.48, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientLayer}
          />
          <View style={styles.heroChrome}>
            <View style={styles.heroClip}>
              <Image
                key={HERO_SLIDES[heroIndex].id}
                source={HERO_SLIDES[heroIndex].source}
                style={styles.heroImage}
                resizeMode="cover"
              />
              <LinearGradient
                pointerEvents="none"
                colors={[
                  'rgba(255,255,255,0.55)',
                  'rgba(107,44,140,0.14)',
                  'rgba(78,31,104,0.32)',
                ]}
                locations={[0, 0.42, 1]}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={styles.heroBrandWash}
              />
              <LinearGradient
                pointerEvents="none"
                colors={['rgba(255,255,255,0.35)', 'rgba(255,255,255,0)']}
                locations={[0, 1]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 0.35 }}
                style={styles.heroTopLight}
              />
            </View>
          </View>
          <View style={styles.heroDots} accessibilityLabel="Hero slides">
            {HERO_SLIDES.map((s, i) => (
              <View
                key={s.id}
                style={[
                  styles.heroDot,
                  i === heroIndex ? styles.heroDotActive : styles.heroDotIdle,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.cards}>
          <RoleCard
            variant="primary"
            icon="construct"
            title={t('landing.wantWork')}
            subtitle={`(${t('landing.workSubtitle')})`}
            onPress={() => choose('worker')}
          />
          <RoleCard
            variant="secondary"
            icon="briefcase"
            title={t('landing.wantHire')}
            subtitle={`(${t('landing.hireSubtitle')})`}
            onPress={() => choose('employer')}
          />
        </View>

        <View style={styles.footerWrap}>
          <View style={styles.backendRow}>
            <View
              style={[
                styles.backendDot,
                backendOk == null
                  ? { backgroundColor: Colors.inkMuted, opacity: 0.35 }
                  : backendOk
                    ? { backgroundColor: Colors.success }
                    : { backgroundColor: Colors.danger },
              ]}
            />
            <Text style={styles.backendText} numberOfLines={1}>
              {backendOk == null
                ? 'Checking backend…'
                : backendOk
                  ? `Backend connected • ${API_BASE_URL}`
                  : `Backend not reachable • ${API_BASE_URL}`}
            </Text>
          </View>
          <Pressable
            onPress={() => {
              const idx = languages.findIndex((l) => l.code === locale);
              const next = languages[(idx + 1 + languages.length) % languages.length];
              setLocale(next.code);
            }}
            hitSlop={8}
            style={({ pressed }) => [styles.langPill, pressed && { opacity: 0.75 }]}
          >
            <Ionicons name="language" size={16} color={Colors.primary} />
            <Text style={styles.langText}>{currentLang}</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
          </Pressable>
          <Text style={styles.footer}>{t('landing.footer')}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function RoleCard({
  variant,
  icon,
  title,
  subtitle,
  onPress,
}: {
  variant: 'primary' | 'secondary';
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.card,
        isPrimary ? styles.cardPrimary : styles.cardSecondary,
        pressed && (isPrimary ? styles.cardPrimaryPressed : styles.cardSecondaryPressed),
      ]}
    >
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: isPrimary ? Colors.primaryDark : Colors.primarySoft },
        ]}
      >
        <Ionicons
          name={icon}
          size={28}
          color={isPrimary ? Colors.white : Colors.primary}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.cardTitle,
            { color: isPrimary ? Colors.white : Colors.primary },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.cardSubtitle,
            { color: isPrimary ? Colors.primarySoft : Colors.inkBody },
          ]}
        >
          {subtitle}
        </Text>
      </View>
      <Ionicons
        name="arrow-forward"
        size={22}
        color={isPrimary ? Colors.white : Colors.primary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceWhite },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  header: { alignItems: 'center', marginBottom: Spacing.lg },
  showcase: {
    marginTop: Spacing.md,
    minHeight: 228,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surfaceWhite,
    borderWidth: 1,
    borderColor: Colors.divider,
    overflow: 'hidden',
    paddingBottom: Spacing.md,
    ...Elevation.card,
  },
  gradientLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  heroChrome: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: Radius.lg,
    padding: 3,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  heroClip: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    height: 168,
    width: '100%',
    backgroundColor: Colors.surfaceCanvas,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroBrandWash: {
    ...StyleSheet.absoluteFillObject,
  },
  heroTopLight: {
    ...StyleSheet.absoluteFillObject,
  },
  heroDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
  },
  heroDot: {
    height: 6,
    borderRadius: 999,
  },
  heroDotIdle: {
    width: 6,
    backgroundColor: Colors.primaryTint,
    opacity: 0.55,
  },
  heroDotActive: {
    width: 22,
    backgroundColor: Colors.primary,
  },
  cards: { gap: Spacing.md, marginTop: Spacing.md },
  card: {
    minHeight: 112,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    ...Elevation.card,
  },
  cardPrimary: {
    backgroundColor: Colors.primary,
  },
  cardPrimaryPressed: { backgroundColor: Colors.primaryDark },
  cardSecondary: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  cardSecondaryPressed: { backgroundColor: Colors.primarySoft },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  cardSubtitle: { fontSize: 14, marginTop: 2 },
  footer: {
    ...Typography.caption,
    textAlign: 'center',
    color: Colors.inkMuted,
  },
  footerWrap: {
    marginTop: 'auto',
    paddingTop: Spacing.lg,
    gap: Spacing.md,
    alignItems: 'center',
  },
  backendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.md,
  },
  backendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  backendText: {
    ...Typography.caption,
    color: Colors.inkMuted,
    maxWidth: '92%',
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primarySoft,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 999,
    ...Elevation.card,
  },
  langText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.primary,
  },
});
