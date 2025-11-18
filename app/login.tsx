import { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppContainer } from '@/src/components/ui/AppContainer';
import { AppTitle } from '@/src/components/ui/AppTitle';
import { AppText } from '@/src/components/ui/AppText';
import { colors, fonts } from '@/src/theme';
import { useUser } from '@/src/context/UserContext';
import { useBirthdays } from '@/src/context/BirthdaysContext';
import { authService } from '@/src/services/auth.service';
import { db } from '@/src/database';

export default function LoginScreen() {
  const router = useRouter();
  const { setUser, saveCredentials } = useUser();
  const { refreshUsers } = useBirthdays();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu email');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu contraseña');
      return;
    }

    try {
      setIsLoading(true);

      // Iniciar sesión con Firebase Auth
      const authUser = await authService.signIn(email, password);
      
      // Obtener perfil del usuario desde Firestore
      const dbUser = await db.getAdapter().getUserByEmail(email);
      
      if (!dbUser) {
        Alert.alert('Error', 'No se encontró el perfil del usuario');
        return;
      }

      // Guardar credenciales para auto-login
      await saveCredentials(email, password);

      // Guardar en contexto
      setUser({
        id: dbUser.id,
        authUid: authUser.uid,
        name: dbUser.name,
        email: dbUser.email,
        birthdate: dbUser.birthdate,
        hobbies: dbUser.hobbies,
        avatar: dbUser.avatar || '👤',
      });

      // Refrescar calendario
      await refreshUsers();

      console.log('✅ User logged in:', authUser.uid);

      // @ts-ignore - Expo Router typed routes
      router.replace('/(drawer)/(tabs)/calendar');
    } catch (error: any) {
      console.error('❌ Error logging in:', error);
      Alert.alert('Error', error.message || 'No se pudo iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Navegar a la pantalla dedicada de recuperación
    // @ts-ignore - typed routes
    router.push('/forgot-password');
  };

  return (
    <AppContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.content}>
              <AppTitle style={styles.title}>Iniciar Sesión</AppTitle>
              
              <AppText style={styles.subtitle}>
                Ingresa con tu email y contraseña
              </AppText>

              <View style={styles.inputContainer}>
                <View style={styles.labelRow}>
                  <Ionicons name="mail-outline" size={18} color={colors.primary} />
                  <AppText style={styles.label}>Email</AppText>
                </View>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="tu@email.com"
                  placeholderTextColor="#666"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => Keyboard.dismiss()}
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.labelRow}>
                  <Ionicons name="lock-closed-outline" size={18} color={colors.primary} />
                  <AppText style={styles.label}>Contraseña</AppText>
                </View>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Tu contraseña"
                    placeholderTextColor="#666"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={22}
                      color="#999"
                    />
                  </Pressable>
                </View>
              </View>

              <Pressable
                style={[styles.button, (!email.trim() || !password.trim() || isLoading) && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={!email.trim() || !password.trim() || isLoading}
              >
                <AppText style={styles.buttonText}>
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </AppText>
              </Pressable>

              <Pressable
                style={styles.forgotPassword}
                onPress={handleForgotPassword}
              >
                <AppText style={styles.forgotPasswordText}>¿Has olvidado tu contraseña?</AppText>
              </Pressable>

              <Pressable
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <AppText style={styles.backButtonText}>Volver</AppText>
              </Pressable>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.white,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 12,
    padding: 16,
    paddingRight: 50,
    fontSize: 16,
    color: colors.white,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.secondary,
    fontSize: 16,
    fontWeight: '700',
  },
  forgotPassword: {
    marginTop: 16,
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  backButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary,
  },
});
