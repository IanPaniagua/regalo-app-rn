import { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { AppContainer } from '@/src/components/ui/AppContainer';
import { AppText } from '@/src/components/ui/AppText';
import { colors } from '@/src/theme';
import { useUser } from '@/src/context/UserContext';
import { authService } from '@/src/services/auth.service';

export default function LogoutScreen() {
  const router = useRouter();
  const { clearUser } = useUser();

  useEffect(() => {
    handleLogout();
  }, []);

  const handleLogout = async () => {
    try {
      // Cerrar sesión en Firebase Auth
      await authService.signOut();
      
      // Limpiar datos del usuario en contexto
      clearUser();
      
      console.log('✅ User logged out successfully');
      
      // Redirigir a welcome
      // @ts-ignore - Expo Router typed routes
      router.replace('/welcome');
    } catch (error: any) {
      console.error('❌ Error logging out:', error);
      Alert.alert('Error', 'No se pudo cerrar sesión');
      router.back();
    }
  };

  return (
    <AppContainer>
      <View style={styles.content}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText style={styles.text}>Cerrando sesión...</AppText>
      </View>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
});
