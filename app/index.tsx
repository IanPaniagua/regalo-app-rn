import { useUser } from '@/src/context/UserContext';
import { colors } from '@/src/theme';
import { ensureLanguageInitialized } from '@/src/utils/languageDetector';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    const checkOnboardingAndRedirect = async () => {
      if (!isLoading) {
        // 🌍 Ensure language is initialized BEFORE redirecting
        // This prevents onboarding from showing in English when device is in Spanish/German
        await ensureLanguageInitialized();

        if (user) {
          // Usuario autenticado, verificar si completó onboarding
          const onboardingCompleted = await AsyncStorage.getItem('ONBOARDING_COMPLETED');

          if (onboardingCompleted === 'true') {
            console.log('✅ User already logged in, redirecting to app');
            // @ts-ignore - Expo Router typed routes
            router.replace('/(drawer)/(tabs)/calendar');
          } else {
            console.log('ℹ️ User logged in but onboarding not completed, redirecting to onboarding');
            // @ts-ignore - Expo Router typed routes
            router.replace('/onboarding');
          }
        } else {
          // No hay usuario, ir a bienvenida
          console.log('ℹ️ No user found, redirecting to welcome');
          // @ts-ignore - Expo Router typed routes
          router.replace('/welcome');
        }
        setCheckingOnboarding(false);
      }
    };

    checkOnboardingAndRedirect();
  }, [isLoading, user]);

  // Mostrar loading mientras se carga el usuario
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.secondary }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
