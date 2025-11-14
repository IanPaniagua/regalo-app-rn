import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { View, StyleSheet } from 'react-native';
import { AppText } from '@/src/components/ui/AppText';
import { useUser } from '@/src/context/UserContext';
import { colors } from '@/src/theme';

export default function DrawerLayout() {
  const { user } = useUser();

  return (
    <Drawer
      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: '#D4AF37',
        drawerInactiveTintColor: '#FFFFFF',
        drawerStyle: {
          backgroundColor: '#1C1C1C',
        },
        headerStyle: {
          backgroundColor: '#1C1C1C',
        },
        headerTintColor: '#FFFFFF',
        headerRight: () => (
          user ? (
            <View style={styles.userContainer}>
              <AppText style={styles.userName}>{user.name}</AppText>
            </View>
          ) : null
        ),
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: 'Home',
          title: '',
          headerTitle: () => (
            <Image
              source={require('@/assets/logo.svg')}
              style={{ width: 32, height: 32, tintColor: '#FFFFFF' }}
              contentFit="contain"
            />
          ),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          drawerLabel: 'Profile',
          title: 'Mi Perfil',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="calendar"
        options={{
          drawerLabel: 'Calendar',
          title: 'Calendar',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          drawerLabel: 'Settings',
          title: 'Settings',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="privacy"
        options={{
          drawerLabel: 'Privacy Policy',
          title: 'Privacy Policy',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="shield-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="logout"
        options={{
          drawerLabel: 'Logout',
          title: 'Logout',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="log-out-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  userContainer: {
    marginRight: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: colors.primary,
    borderRadius: 16,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
  },
});
