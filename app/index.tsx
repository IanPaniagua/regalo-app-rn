import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // @ts-ignore - Expo Router typed routes don't include nested groups yet
    router.replace('/(drawer)/(tabs)/calendar');
  }, []);

  return <View />;
}
