import { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { AppContainer } from '@/src/components/ui/AppContainer';
import { AppText } from '@/src/components/ui/AppText';
import { colors } from '@/src/theme';
import { useUser } from '@/src/context/UserContext';
import { authService } from '@/src/services/auth.service';
import { useCallback } from 'react';

export default function LogoutScreen() {
  const router = useRouter();
  const { clearUser } = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [dialogShown, setDialogShown] = useState(false);

  // Mostrar diálogo cada vez que la pantalla recibe foco
  useFocusEffect(
    useCallback(() => {
      setDialogShown(false);
      setIsLoggingOut(false);
      showLogoutConfirmation();
      
      return () => {
        // Cleanup cuando la pantalla pierde foco
        setDialogShown(false);
      };
    }, [])
  );

  const showLogoutConfirmation = () => {
    if (dialogShown) return;
    
    setDialogShown(true);
    
    Alert.alert(
      '¿Cerrar sesión?',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => {
            console.log('Logout cancelled');
            setDialogShown(false);
            router.back();
          },
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: handleLogout,
        },
      ],
      { cancelable: false }
    );
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
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
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!isLoggingOut) {
    return null; // No mostrar nada mientras se muestra el diálogo
  }

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
