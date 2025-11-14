import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir a la pantalla de bienvenida
    // @ts-ignore - Expo Router typed routes
    router.replace('/welcome');
  }, []);

  return <View />;
}
