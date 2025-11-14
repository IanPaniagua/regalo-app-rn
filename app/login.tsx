import { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { AppContainer } from '@/src/components/ui/AppContainer';
import { AppTitle } from '@/src/components/ui/AppTitle';
import { AppText } from '@/src/components/ui/AppText';
import { colors, fonts } from '@/src/theme';

// Mock user data
const MOCK_USER = {
  email: 'usuario@ejemplo.com',
  name: 'Usuario Demo',
};

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleLogin = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu email');
      return;
    }

    if (email.toLowerCase() === MOCK_USER.email) {
      // Usuario existe, redirigir al drawer/home
      // @ts-ignore - Expo Router typed routes
      router.replace('/(drawer)/(tabs)/calendar');
    } else {
      Alert.alert('Error', 'Usuario no encontrado. Por favor crea un perfil primero.');
    }
  };

  return (
    <AppContainer>
      <View style={styles.content}>
        <AppTitle style={styles.title}>Iniciar Sesión</AppTitle>
        
        <AppText style={styles.label}>Email</AppText>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Ingresa tu email"
          placeholderTextColor="#666"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <AppText style={styles.hint}>
          Usuario de prueba: {MOCK_USER.email}
        </AppText>

        <Pressable style={styles.button} onPress={handleLogin}>
          <AppText style={styles.buttonText}>Entrar</AppText>
        </Pressable>

        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <AppText style={styles.backButtonText}>Volver</AppText>
        </Pressable>
      </View>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 40,
    textAlign: 'center',
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    color: colors.white,
    fontFamily: fonts.text,
    fontSize: 16,
    marginBottom: 12,
  },
  hint: {
    fontSize: 14,
    color: '#999',
    marginBottom: 32,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.secondary,
  },
  backButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary,
  },
});
