import { AppButton } from '@/src/components/ui/AppButton';
import { AppContainer } from '@/src/components/ui/AppContainer';
import { AppText } from '@/src/components/ui/AppText';
import { AppTitle } from '@/src/components/ui/AppTitle';
import { useLanguage } from '@/src/context/LanguageContext';
import { useUser } from '@/src/context/UserContext';
import { colors, fonts } from '@/src/theme';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableWithoutFeedback,
    View
} from 'react-native';

export default function CreateProfileStep1() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { t, lang } = useLanguage();
  const { tempUser, setTempUser } = useUser();
  const [name, setName] = useState(tempUser?.name || '');
  const [birthdate, setBirthdate] = useState(
    tempUser?.birthdate || new Date(2000, 0, 1, 12, 0, 0, 0) // Fecha por defecto a las 12:00 del mediodía
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleContinue = () => {
    if (!name.trim()) {
      Alert.alert(t('create_profile_error_title'), t('profile_error_empty_name'));
      return;
    }

    // Guardar datos TEMPORALES en el contexto (no en DB todavía)
    setTempUser({
      name,
      birthdate,
      hobbies: [], // Se añadirán en el siguiente paso
    });

    router.push('/create-profile/hobbies');
  };

  const formatDate = (date: Date) => {
    const locale = lang === 'es' ? 'es-ES' : lang === 'de' ? 'de-DE' : 'en-US';
    return date.toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
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
              <AppTitle style={styles.title}>{t('create_profile_intro_title')}</AppTitle>

              <View style={styles.inputGroup}>
                <AppText style={[styles.label, { color: theme.textSecondary }]}>
                  {t('profile_name')}
                </AppText>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
                  value={name}
                  onChangeText={setName}
                  placeholder={t('profile_name_placeholder')}
                  placeholderTextColor="#666"
                  returnKeyType="done"
                />
              </View>

              <View style={styles.inputGroup}>
                <AppText style={[styles.label, { color: theme.textSecondary }]}>
                  {t('profile_birthdate')}
                </AppText>
                <input
                  type="date"
                  value={birthdate.toISOString().split('T')[0]}
                  onChange={(e) => {
                    if (e.target.value) {
                      const selectedDate = new Date(e.target.value + 'T12:00:00');
                      if (!isNaN(selectedDate.getTime())) {
                        setBirthdate(selectedDate);
                      }
                    }
                  }}
                  max={new Date().toISOString().split('T')[0]}
                  style={{
                    width: '100%',
                    padding: 16,
                    fontSize: 16,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderStyle: 'solid',
                    borderColor: theme.border,
                    backgroundColor: theme.inputBg,
                    color: theme.text,
                    fontFamily: fonts.text,
                  }}
                />
              </View>

              <AppButton
                title={t('create_profile_username_continue')}
                onPress={handleContinue}
                style={styles.button}
              />
            </View>
          ) : (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.content}>
                <AppTitle style={styles.title}>{t('create_profile_intro_title')}</AppTitle>

                <View style={styles.inputGroup}>
                  <AppText style={[styles.label, { color: theme.textSecondary }]}>
                    {t('profile_name')}
                  </AppText>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
                    value={name}
                    onChangeText={setName}
                    placeholder={t('profile_name_placeholder')}
                    placeholderTextColor="#666"
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <AppText style={[styles.label, { color: theme.textSecondary }]}>
                    {t('profile_birthdate')}
                  </AppText>
                  <Pressable
                    style={[styles.dateButton, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
                    onPress={() => {
                      Keyboard.dismiss();
                      setShowDatePicker(true);
                    }}
                  >
                    <AppText>{formatDate(birthdate)}</AppText>
                  </Pressable>
                </View>

                <AppButton
                  title={t('create_profile_username_continue')}
                  onPress={handleContinue}
                  style={styles.button}
                />
              </View>
            </TouchableWithoutFeedback>
          )}

        {/* Modal para iOS con DatePicker */}
        {Platform.OS === 'ios' && showDatePicker && (
          <Modal
            transparent
            animationType="slide"
            visible={showDatePicker}
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: theme.modalBg }] }>
                <View
                  style={[
                    styles.modalHeader,
                    { borderBottomColor: theme.border },
                  ]}
                >
                  <Pressable onPress={() => setShowDatePicker(false)}>
                    <AppText style={[styles.modalButton, { color: theme.text }]}>
                      {t('common_cancel')}
                    </AppText>
                  </Pressable>
                  <Pressable onPress={() => setShowDatePicker(false)}>
                    <AppText
                      style={[
                        styles.modalButton,
                        styles.modalButtonDone,
                        { color: colors.primary },
                      ]}
                    >
                      {t('common_done')}
                    </AppText>
                  </Pressable>
                </View>
                <DateTimePicker
                  value={birthdate}
                  mode="date"
                  display="spinner"
                  onChange={(_event: any, selectedDate?: Date) => {
                    if (selectedDate) {
                      // Normalizar a las 12:00 del mediodía para evitar problemas de zona horaria
                      const normalizedDate = new Date(
                        selectedDate.getFullYear(),
                        selectedDate.getMonth(),
                        selectedDate.getDate(),
                        12, 0, 0, 0
                      );
                      setBirthdate(normalizedDate);
                    }
                  }}
                  maximumDate={new Date()}
                  textColor={theme.text}
                  style={[styles.datePicker, { backgroundColor: theme.modalBg }]}
                />
              </View>
            </View>
          </Modal>
        )}

        {/* DatePicker para Android (se muestra como diálogo nativo) */}
        {Platform.OS === 'android' && showDatePicker && (
          <DateTimePicker
            value={birthdate}
            mode="date"
            display="default"
            onChange={(_event: any, selectedDate?: Date) => {
              setShowDatePicker(false);
              if (selectedDate) {
                // Normalizar a las 12:00 del mediodía para evitar problemas de zona horaria
                const normalizedDate = new Date(
                  selectedDate.getFullYear(),
                  selectedDate.getMonth(),
                  selectedDate.getDate(),
                  12, 0, 0, 0
                );
                setBirthdate(normalizedDate);
              }
            }}
            maximumDate={new Date()}
          />
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
    marginBottom: 40,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontFamily: fonts.text,
    fontSize: 16,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    marginTop: 16,
    marginBottom: 16,
  },
  // Estilos para el Modal del DatePicker (iOS)
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalButton: {
    fontSize: 16,
  },
  modalButtonDone: {
    color: colors.primary,
    fontWeight: '600',
  },
  datePicker: {},
});
