import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/core/theme';
import { useTranslation } from '@/core/i18n';

export default function EmployerTabsLayout() {
  const { t, locale } = useTranslation();

  return (
    <Tabs key={locale} screenOptions={{ headerShown: false, tabBarActiveTintColor: Colors.primary }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: t('employer.myJobs'),
          tabBarIcon: ({ color, size }) => <Ionicons name="briefcase" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="applicants"
        options={{
          title: t('tabs.applicants'),
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="walk-ins"
        options={{
          title: t('tabs.walkIns'),
          tabBarIcon: ({ color, size }) => <Ionicons name="qr-code" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
