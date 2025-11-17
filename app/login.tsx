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
import { useLanguage } from '@/src/context/LanguageContext';
import { useUser } from '@/src/context/UserContext';
import { useBirthdays } from '@/src/context/BirthdaysContext';
import { authService } from '@/src/services/auth.service';
import { db } from '@/src/database';

export default function LoginScreen() {
  const router = useRouter();
  const { setUser, saveCredentials } = useUser();
  const { refreshUsers } = useBirthdays();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert(t('login_error_title'), t('login_error_email_required'));
      return;
    }

    if (!password.trim()) {
      Alert.alert(t('login_error_title'), t('login_error_password_required'));
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
      Alert.alert(t('login_error_title'), error.message || t('login_error_generic'));
    } finally {
      setIsLoading(false);
    }
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
              <AppTitle style={styles.title}>{t('login_title')}</AppTitle>
              
              <AppText style={styles.subtitle}>
                {t('login_subtitle')}
              </AppText>

              <View style={styles.inputContainer}>
                <View style={styles.labelRow}>
                  <Ionicons name="mail-outline" size={18} color={colors.primary} />
                  <AppText style={styles.label}>{t('login_email_label')}</AppText>
                </View>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t('login_email_placeholder')}
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
                  <AppText style={styles.label}>{t('login_password_label')}</AppText>
                </View>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder={t('login_password_placeholder')}
                  placeholderTextColor="#666"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
              </View>

              <Pressable
                style={[styles.button, (!email.trim() || !password.trim() || isLoading) && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={!email.trim() || !password.trim() || isLoading}
              >
                <AppText style={styles.buttonText}>
                  {isLoading ? t('login_button_loading') : t('login_button')}
                </AppText>
              </Pressable>

              <Pressable
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <AppText style={styles.backButtonText}>{t('login_back')}</AppText>
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
  backButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary,
  },
});
