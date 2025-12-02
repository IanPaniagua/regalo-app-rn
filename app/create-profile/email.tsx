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
import { useLanguage } from '@/src/context/LanguageContext';
import { colors, fonts } from '@/src/theme';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { useUser } from '@/src/context/UserContext';
import { useBirthdays } from '@/src/context/BirthdaysContext';
import { authService } from '@/src/services/auth.service';

export default function CreateProfileStep3() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { tempUser, setUser, clearTempUser } = useUser();
  const { addUser } = useBirthdays();
  const { t } = useLanguage();
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

    if (password.length < 8) {
      Alert.alert(t('create_profile_error_title'), t('create_profile_error_password_min_length'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('create_profile_error_title'), t('create_profile_error_password_mismatch'));
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
        username: tempUser.username,
        birthdate: tempUser.birthdate!,
        hobbies: tempUser.hobbies!,
        giftPreferences: tempUser.giftPreferences,
        avatar: tempUser.avatar!,
      });

      // Guardar en el contexto de usuario autenticado
      const completeUser = {
        id: dbUserId,
        authUid: authUser.uid,
        name: tempUser.name!,
        username: tempUser.username,
        birthdate: tempUser.birthdate!,
        hobbies: tempUser.hobbies!,
        giftPreferences: tempUser.giftPreferences,
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
            text: t('common_ok'),
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
        t('create_profile_error_title'),
        error.message || t('create_profile_error_generic')
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
              <AppTitle style={styles.title}>{t('create_profile_email_title')}</AppTitle>

              <AppText style={[styles.subtitle, { color: theme.textSecondary }]}> 
                {t('create_profile_email_subtitle')}
              </AppText>

              <View style={styles.inputContainer}>
                <View style={styles.labelRow}>
                  <Ionicons name="mail-outline" size={18} color={colors.primary} />
                  <AppText style={[styles.label, { color: theme.text }]}>
                    {t('create_profile_email_label')}
                  </AppText>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text },
                  ]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t('create_profile_email_placeholder')}
                  placeholderTextColor={theme.textMuted}
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
                  <AppText style={[styles.label, { color: theme.text }]}>
                    {t('create_profile_password_label')}
                  </AppText>
                </View>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.passwordInput,
                      { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text },
                    ]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder={t('create_profile_password_placeholder')}
                    placeholderTextColor={theme.textMuted}
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
                      color={theme.textMuted}
                    />
                  </Pressable>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.labelRow}>
                  <Ionicons name="lock-closed-outline" size={18} color={colors.primary} />
                  <AppText style={[styles.label, { color: theme.text }]}>
                    {t('create_profile_confirm_password_label')}
                  </AppText>
                </View>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.passwordInput,
                      { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text },
                    ]}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder={t('create_profile_confirm_password_placeholder')}
                    placeholderTextColor={theme.textMuted}
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
                      color={theme.textMuted}
                    />
                  </Pressable>
                </View>
              </View>

              <AppButton
                title={isCreating ? t('create_profile_button_loading') : t('create_profile_button')}
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
    fontWeight: '600',
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontFamily: fonts.text,
    fontSize: 16,
    borderWidth: 1,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    borderRadius: 12,
    padding: 16,
    paddingRight: 50,
    fontFamily: fonts.text,
    fontSize: 16,
    borderWidth: 1,
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
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
});
