import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { AppText } from '@/src/components/ui/AppText';
import { HeaderLogo } from '@/src/components/HeaderLogo';
import { useUser } from '@/src/context/UserContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { colors } from '@/src/theme';
import { useAppTheme } from '@/src/theme/ThemeProvider';

export default function DrawerLayout() {
  const { user } = useUser();
  const { t } = useLanguage();
  const { theme } = useAppTheme();
  
  console.log('🔍 DEBUG - User avatar:', user?.avatar);
  console.log('🔍 DEBUG - User name:', user?.name);

  return (
    <Drawer
      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: theme.text,
        drawerStyle: {
          backgroundColor: theme.surface,
        },
        headerStyle: {
          backgroundColor: theme.surface,
        },
        headerTintColor: theme.text,
        headerRight: () => (
          user ? (
            <View style={styles.userContainer}>
              <AppText style={styles.userAvatar}>{user.avatar}</AppText>
            </View>
          ) : null
        ),
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: t('drawer_home'),
          title: '',
          headerTitle: () => <HeaderLogo />,
          headerTitleAlign: 'center',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          drawerLabel: t('drawer_profile'),
          title: t('drawer_profile_title'),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="calendar"
        options={{
          drawerLabel: t('drawer_calendar'),
          title: t('drawer_calendar_title'),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          drawerLabel: t('drawer_settings'),
          title: t('drawer_settings_title'),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="privacy"
        options={{
          drawerLabel: t('drawer_privacy'),
          title: t('drawer_privacy_title'),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="shield-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="account"
        options={{
          drawerLabel: t('drawer_account'),
          title: t('drawer_account_title'),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="logout"
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  userContainer: {
    marginRight: 16,
  },
  userAvatar: {
    fontSize: 20,
    color: '#1A1A1A',
  },
});
