import { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text } from 'react-native';
import 'react-native-reanimated';
import 'react-native-gesture-handler';

import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { UserProvider } from '@/src/context/UserContext';
import { BirthdaysProvider } from '@/src/context/BirthdaysContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { db } from '@/src/database';
import { DATABASE_TYPE } from '@/src/database/database.config';
import { colors } from '@/src/theme';

export const unstable_settings = {
  initialRouteName: '(drawer)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [dbInitialized, setDbInitialized] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeDatabase = async () => {
      try {
        console.log('🔄 Initializing database...');
        
        // Usar el tipo de base de datos configurado
        await db.initialize(DATABASE_TYPE);
        
        if (isMounted) {
          const dbType = db.getCurrentType();
          console.log('✅ Database ready:', dbType);
          setDbInitialized(true);
        }
      } catch (error) {
        console.error('❌ Error initializing database:', error);
        
        if (isMounted) {
          setDbError('Error al inicializar la base de datos');
          
          // Si falla, intentar con Mock como fallback
          try {
            console.log('⚠️ Attempting fallback to Mock...');
            await db.initialize('mock');
            console.log('✅ Fallback to Mock successful');
            setDbInitialized(true);
          } catch (fallbackError) {
            console.error('❌ Fallback also failed:', fallbackError);
            setDbInitialized(true); // Continuar de todos modos
          }
        }
      }
    };

    initializeDatabase();

    // Cleanup: no desconectar la DB, solo marcar como desmontado
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {!dbInitialized ? (
        // Mostrar loading mientras se inicializa la base de datos
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.secondary }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.white, marginTop: 16 }}>Inicializando base de datos...</Text>
        </View>
      ) : (
        // Providers solo se montan después de que la DB esté lista
        <BirthdaysProvider>
          <UserProvider>
            <ThemeProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="welcome" />
                <Stack.Screen name="login" />
                <Stack.Screen name="create-profile" />
                <Stack.Screen name="(drawer)" />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              </Stack>
              <StatusBar style="auto" />
            </ThemeProvider>
          </UserProvider>
        </BirthdaysProvider>
      )}
    </NavigationThemeProvider>
  );
}
