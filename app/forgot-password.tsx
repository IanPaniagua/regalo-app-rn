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
import { colors } from '@/src/theme';
import { authService } from '@/src/services/auth.service';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendReset = async () => {
    if (!email.trim()) {
      Alert.alert('Email requerido', 'Por favor ingresa tu email para recuperar tu contraseña');
      return;
    }

    try {
      setIsSending(true);
      await authService.resetPassword(email.trim());
      Alert.alert(
        '¡Email enviado!',
        'Revisa tu correo para restablecer tu contraseña. Si no lo ves, revisa también la carpeta de spam.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ],
      );
    } catch (error: any) {
      console.error('❌ Error sending password reset:', error);
      Alert.alert('Error', error.message || 'No se pudo enviar el email de recuperación');
    } finally {
      setIsSending(false);
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
              <AppTitle style={styles.title}>Recuperar contraseña</AppTitle>

              <AppText style={styles.subtitle}>
                Introduce el email con el que creaste tu cuenta y te enviaremos un enlace para
                restablecer tu contraseña.
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
                  returnKeyType="done"
                  onSubmitEditing={handleSendReset}
                />
              </View>

              <Pressable
                style={[
                  styles.button,
                  (!email.trim() || isSending) && styles.buttonDisabled,
                ]}
                onPress={handleSendReset}
                disabled={!email.trim() || isSending}
              >
                <AppText style={styles.buttonText}>
                  {isSending ? 'Enviando...' : 'Enviar enlace'}
                </AppText>
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
    marginBottom: 8,
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
    color: '#CCCCCC',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#444',
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
