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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppContainer } from '@/src/components/ui/AppContainer';
import { AppTitle } from '@/src/components/ui/AppTitle';
import { AppText } from '@/src/components/ui/AppText';
import { AppButton } from '@/src/components/ui/AppButton';
import { colors, fonts } from '@/src/theme';
import { useLanguage } from '@/src/context/LanguageContext';
import { useUser } from '@/src/context/UserContext';
import { useBirthdays } from '@/src/context/BirthdaysContext';
import { authService } from '@/src/services/auth.service';

export default function CreateProfileStep3() {
  const router = useRouter();
  const { tempUser, setUser, clearTempUser } = useUser();
  const { addUser } = useBirthdays();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleContinue = async () => {
    if (!email.trim()) {
      Alert.alert(t('create_profile_error_title'), t('create_profile_error_email_required'));
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert(t('create_profile_error_title'), t('create_profile_error_email_invalid'));
      return;
    }

    if (!password.trim()) {
      Alert.alert(t('create_profile_error_title'), t('create_profile_error_password_required'));
      return;
    }

    if (password.length < 6) {
      Alert.alert(t('create_profile_error_title'), t('create_profile_error_password_min_length'));
      return;
    }

    if (!tempUser || !tempUser.avatar) {
      Alert.alert(t('create_profile_error_title'), t('create_profile_error_tempuser_missing'));
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
        t('create_profile_created_title'),
        t('create_profile_created_message'),
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
      Alert.alert(t('create_profile_error_title'), error.message || t('create_profile_error_generic'));
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
              <AppTitle style={styles.title}>{t('create_profile_email_title')}</AppTitle>

              <AppText style={styles.subtitle}>
                {t('create_profile_email_subtitle')}
              </AppText>

              <View style={styles.inputContainer}>
                <View style={styles.labelRow}>
                  <Ionicons name="mail-outline" size={18} color={colors.primary} />
                  <AppText style={styles.label}>{t('create_profile_email_label')}</AppText>
                </View>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t('create_profile_email_placeholder')}
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
                  <AppText style={styles.label}>{t('create_profile_password_label')}</AppText>
                </View>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder={t('create_profile_password_placeholder')}
                  placeholderTextColor="#666"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleContinue}
                />
              </View>

              <AppButton
                title={isCreating ? t('create_profile_button_loading') : t('create_profile_button')}
                onPress={handleContinue}
                disabled={!email.trim() || !password.trim() || isCreating}
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
