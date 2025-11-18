import { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppContainer } from '@/src/components/ui/AppContainer';
import { AppTitle } from '@/src/components/ui/AppTitle';
import { AppText } from '@/src/components/ui/AppText';
import { AppButton } from '@/src/components/ui/AppButton';
import { colors, fonts } from '@/src/theme';
import { useUser } from '@/src/context/UserContext';
import { useBirthdays } from '@/src/context/BirthdaysContext';
import { authService } from '@/src/services/auth.service';

export default function CreateProfileStep3() {
  const router = useRouter();
  const { tempUser, setUser, clearTempUser } = useUser();
  const { addUser } = useBirthdays();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleContinue = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu email');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Por favor ingresa una contraseña');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (!tempUser || !tempUser.avatar) {
      Alert.alert('Error', 'No se encontraron datos del perfil. Por favor vuelve a empezar.');
      router.replace('/create-profile');
      return;
    }

    try {
      setIsCreating(true);

      // Crear usuario completo: Firebase Auth + Database
      const { authUser, dbUserId } = await authService.createUserProfile({
        email,
        password,
        name: tempUser.name!,
        birthdate: tempUser.birthdate!,
        hobbies: tempUser.hobbies!,
        avatar: tempUser.avatar!,
      });

      // Guardar en el contexto de usuario autenticado
      const completeUser = {
        id: dbUserId,
        authUid: authUser.uid,
        name: tempUser.name!,
        birthdate: tempUser.birthdate!,
        hobbies: tempUser.hobbies!,
        avatar: tempUser.avatar!,
        email,
      };
      setUser(completeUser);

      // Añadir al calendario de cumpleaños
      await addUser({
        id: dbUserId,
        name: tempUser.name!,
        avatar: tempUser.avatar!,
        birthdate: tempUser.birthdate!,
        hobbies: tempUser.hobbies!,
        email: email,
      });

      // Limpiar datos temporales
      clearTempUser();

      console.log('✅ Complete user profile created:', {
        authUid: authUser.uid,
        dbUserId,
      });

      Alert.alert(
        'Perfil creado',
        '¡Tu perfil ha sido creado exitosamente!',
        [
          {
            text: 'OK',
            onPress: () => {
              // @ts-ignore
              router.replace('/(drawer)/(tabs)/calendar');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('❌ Error creating profile:', error);
      Alert.alert(
        'Error',
        error.message || 'Hubo un problema al crear tu perfil. Por favor intenta de nuevo.'
      );
    } finally {
      setIsCreating(false);
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
              <AppTitle style={styles.title}>¿Cuál es tu email?</AppTitle>

              <AppText style={styles.subtitle}>
                Crea tu cuenta para acceder a la app
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
                    placeholder="Mínimo 8 caracteres"
                    placeholderTextColor="#666"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
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

              <View style={styles.inputContainer}>
                <View style={styles.labelRow}>
                  <Ionicons name="lock-closed-outline" size={18} color={colors.primary} />
                  <AppText style={styles.label}>Confirmar Contraseña</AppText>
                </View>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Repite tu contraseña"
                    placeholderTextColor="#666"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleContinue}
                  />
                  <Pressable
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                      size={22}
                      color="#999"
                    />
                  </Pressable>
                </View>
              </View>

              <AppButton
                title={isCreating ? "Creando perfil..." : "Crear cuenta"}
                onPress={handleContinue}
                disabled={!email.trim() || !password.trim() || !confirmPassword.trim() || isCreating}
                style={styles.button}
              />
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
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
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.white,
    borderWidth: 1,
    borderColor: '#444',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    paddingRight: 50,
    fontSize: 16,
    color: colors.white,
    borderWidth: 1,
    borderColor: '#444',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  button: {
    marginTop: 8,
  },
  hint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
});
