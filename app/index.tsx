import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useUser } from '@/src/context/UserContext';
import { colors } from '@/src/theme';

export default function Index() {
  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // Usuario ya autenticado, ir directamente a la app
        console.log('✅ User already logged in, redirecting to app');
        // @ts-ignore - Expo Router typed routes
        router.replace('/(drawer)/(tabs)/calendar');
      } else {
        // No hay usuario, ir a bienvenida
        console.log('ℹ️ No user found, redirecting to welcome');
        // @ts-ignore - Expo Router typed routes
        router.replace('/welcome');
      }
    }
  }, [isLoading, user]);

  // Mostrar loading mientras se carga el usuario
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.secondary }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
