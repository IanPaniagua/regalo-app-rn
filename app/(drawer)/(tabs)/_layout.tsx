import { InAppNotification } from '@/src/components/InAppNotification';
import { useConnections } from '@/src/context/ConnectionsContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { useNotifications } from '@/src/context/NotificationsContext';
import { colors } from '@/src/theme';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

export default function TabLayout() {
  const router = useRouter();
  const { notificationCount, pendingInvitations } = useConnections();
  const { groupNotificationCount } = useNotifications();
  const { t } = useLanguage();
  const { theme } = useAppTheme();
  const [showNotification, setShowNotification] = useState(false);
  const [lastNotificationCount, setLastNotificationCount] = useState(0);

  // Detectar nuevas peticiones y mostrar notificación
  useEffect(() => {
    // Solo mostrar si hay nuevas peticiones (el contador aumentó)
    if (pendingInvitations.length > 0 && pendingInvitations.length > lastNotificationCount) {
      setShowNotification(true);
    }
    setLastNotificationCount(pendingInvitations.length);
  }, [pendingInvitations.length]);

  const handleNotificationPress = () => {
    setShowNotification(false);
    // Navegar a la pestaña de Connect
    router.push('/(drawer)/(tabs)/connect');
  };

  const handleNotificationDismiss = () => {
    setShowNotification(false);
  };

  return (
    <>
      <InAppNotification
        visible={showNotification}
        title={t('notification_new_request_title')}
        message={t('notification_new_request_message')}
        onPress={handleNotificationPress}
        onDismiss={handleNotificationDismiss}
        duration={6000}
      />
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Groups',
          tabBarBadge: groupNotificationCount > 0 ? groupNotificationCount : undefined,
          tabBarBadgeStyle: styles.badge,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="gift-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="connect"
        options={{
          title: 'Connect',
          tabBarBadge: notificationCount > 0 ? notificationCount : undefined,
          tabBarBadgeStyle: styles.badge,
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="people-outline" size={size} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#FF3B30',
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    minWidth: 18,
    height: 18,
  },
});
