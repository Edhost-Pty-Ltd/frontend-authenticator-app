import { Tabs } from 'expo-router';

import { Icon, type IconName } from '@/components/ui/Icon';
import { useTheme } from '@/theme';

function TabIcon({ name, color, focused }: { name: IconName; color: string; focused: boolean }) {
  return <Icon name={name} color={color} size={22} strokeWidth={focused ? 2.15 : 1.7} />;
}

export default function TabLayout() {
  const { colors, fonts } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.medium,
          fontSize: 11,
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Codes',
          tabBarIcon: ({ color, focused }) => <TabIcon name="home" color={String(color)} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="security"
        options={{
          title: 'Security',
          tabBarIcon: ({ color, focused }) => <TabIcon name="shield" color={String(color)} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => <TabIcon name="settings" color={String(color)} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
