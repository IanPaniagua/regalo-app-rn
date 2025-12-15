import { AppButton } from '@/src/components/ui/AppButton';
import { AppContainer } from '@/src/components/ui/AppContainer';
import { AppText } from '@/src/components/ui/AppText';
import { AppTitle } from '@/src/components/ui/AppTitle';
import { useLanguage } from '@/src/context/LanguageContext';
import { useUser } from '@/src/context/UserContext';
import { db } from '@/src/database';
import { colors, fonts } from '@/src/theme';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableWithoutFeedback,
    View
} from 'react-native';

export default function CreateProfileUsername() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { t } = useLanguage();
  const { tempUser, setTempUser } = useUser();
  const [username, setUsername] = useState(tempUser?.username || '');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string>('');

  // Validar formato de username
  const validateUsername = (text: string): string | null => {
    if (text.length === 0) return null;
    if (text.length < 3) return t('create_profile_username_too_short');
    if (text.length > 20) return t('create_profile_username_too_long');
    if (!/^[a-zA-Z0-9_]+$/.test(text)) return t('create_profile_username_invalid');
    return null;
  };

  // Verificar disponibilidad con debounce
  useEffect(() => {
    const validationError = validateUsername(username);
    if (validationError) {
      setError(validationError);
      setIsAvailable(null);
      return;
    }

    if (username.length === 0) {
      setError('');
      setIsAvailable(null);
      return;
    }

    setError('');
    const timeoutId = setTimeout(async () => {
      setIsChecking(true);
      try {
        const available = await db.getAdapter().isUsernameAvailable(username);
        setIsAvailable(available);
        if (!available) {
          setError(t('create_profile_username_taken'));
        }
      } catch (err) {
        console.error('Error checking username:', err);
        setError('Error al verificar disponibilidad');
      } finally {
        setIsChecking(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleContinue = () => {
    if (!isAvailable) return;

    // Guardar username normalizado (minúsculas)
    if (tempUser) {
      setTempUser({
        ...tempUser,
        username: username.toLowerCase(),
      });
    }

    router.push('/create-profile/email');
  };



  const getStatusIcon = () => {
    if (isChecking) {
      return <ActivityIndicator size="small" color={colors.primary} />;
    }
    if (error && username.length > 0) {
      return <Ionicons name="close-circle" size={24} color="#EF4444" />;
    }
    if (isAvailable) {
      return <Ionicons name="checkmark-circle" size={24} color="#10B981" />;
    }
    return null;
  };

  const getStatusText = () => {
    if (isChecking) return t('create_profile_username_checking');
    if (error && username.length > 0) return error;
    if (isAvailable) return t('create_profile_username_available');
    return '';
  };

  const getStatusColor = () => {
    if (error && username.length > 0) return '#EF4444';
    if (isAvailable) return '#10B981';
    return theme.textMuted;
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
          {Platform.OS === 'web' ? (
            <View style={styles.content}>
              <AppTitle style={styles.title}>{t('create_profile_username_title')}</AppTitle>

              <AppText style={[styles.subtitle, { color: theme.textMuted }]}>
                {t('create_profile_username_subtitle')}
              </AppText>

              <View style={styles.inputContainer}>
                <View style={[styles.inputWrapper, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                  <AppText style={[styles.prefix, { color: theme.text }]}>
                    {t('create_profile_username_prefix')}
                  </AppText>
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    value={username}
                    onChangeText={setUsername}
                    placeholder={t('create_profile_username_placeholder')}
                    placeholderTextColor={theme.textMuted}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="off"
                  />
                  <View style={styles.statusIcon}>
                    {getStatusIcon()}
                  </View>
                </View>

                {(username.length > 0 || error) && (
                  <View style={styles.statusContainer}>
                    <AppText style={[styles.statusText, { color: getStatusColor() }]}>
                      {getStatusText()}
                    </AppText>
                  </View>
                )}
              </View>

              <AppButton
                title={t('create_profile_username_continue')}
                onPress={handleContinue}
                disabled={!isAvailable || isChecking}
                style={styles.button}
              />
            </View>
          ) : (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.content}>
                <AppTitle style={styles.title}>{t('create_profile_username_title')}</AppTitle>

                <AppText style={[styles.subtitle, { color: theme.textMuted }]}>
                  {t('create_profile_username_subtitle')}
                </AppText>

                <View style={styles.inputContainer}>
                  <View style={[styles.inputWrapper, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                    <AppText style={[styles.prefix, { color: theme.text }]}>
                      {t('create_profile_username_prefix')}
                    </AppText>
                    <TextInput
                      style={[styles.input, { color: theme.text }]}
                      value={username}
                      onChangeText={setUsername}
                      placeholder={t('create_profile_username_placeholder')}
                      placeholderTextColor={theme.textMuted}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="off"
                    />
                    <View style={styles.statusIcon}>
                      {getStatusIcon()}
                    </View>
                  </View>

                  {(username.length > 0 || error) && (
                    <View style={styles.statusContainer}>
                      <AppText style={[styles.statusText, { color: getStatusColor() }]}>
                        {getStatusText()}
                      </AppText>
                    </View>
                  )}
                </View>

                <AppButton
                  title={t('create_profile_username_continue')}
                  onPress={handleContinue}
                  disabled={!isAvailable || isChecking}
                  style={styles.button}
                />
              </View>
            </TouchableWithoutFeedback>
          )}
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
    paddingBottom: 40,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  prefix: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontFamily: fonts.text,
    fontSize: 18,
    paddingVertical: 12,
  },
  statusIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    marginTop: 8,
  },
});
