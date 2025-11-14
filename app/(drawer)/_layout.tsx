import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

export default function DrawerLayout() {
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
          title: 'Profile',
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
