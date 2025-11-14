import { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  Pressable, 
  Platform, 
  Modal, 
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AppContainer } from '@/src/components/ui/AppContainer';
import { AppTitle } from '@/src/components/ui/AppTitle';
import { AppText } from '@/src/components/ui/AppText';
import { AppButton } from '@/src/components/ui/AppButton';
import { colors, fonts } from '@/src/theme';
import { useUser } from '@/src/context/UserContext';

export default function CreateProfileStep1() {
  const router = useRouter();
  const { tempUser, setTempUser } = useUser();
  const [name, setName] = useState(tempUser?.name || '');
  const [birthdate, setBirthdate] = useState(tempUser?.birthdate || new Date(2000, 0, 1)); // Fecha por defecto más razonable
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [skipPressed, setSkipPressed] = useState(false);

  const handleContinue = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu nombre');
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

  const handleSkip = () => {
    // @ts-ignore
    router.push('/create-profile/hobbies');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
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
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.content}>
              <AppTitle style={styles.title}>Vamos a crear tu perfil</AppTitle>

              <View style={styles.inputGroup}>
                <AppText style={styles.label}>Nombre</AppText>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Tu nombre"
                  placeholderTextColor="#666"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />
              </View>

              <View style={styles.inputGroup}>
                <AppText style={styles.label}>Fecha de nacimiento</AppText>
                <Pressable
                  style={styles.dateButton}
                  onPress={() => {
                    Keyboard.dismiss();
                    setShowDatePicker(true);
                  }}
                >
                  <AppText>{formatDate(birthdate)}</AppText>
                </Pressable>
              </View>

              <AppButton
                title="Save and Continue"
                onPress={handleContinue}
                style={styles.button}
              />

              <Pressable
                onPress={handleSkip}
                onPressIn={() => setSkipPressed(true)}
                onPressOut={() => setSkipPressed(false)}
              >
                <AppText style={[styles.skipText, skipPressed && styles.skipTextPressed]}>
                  Saltar
                </AppText>
              </Pressable>
            </View>
          </TouchableWithoutFeedback>

        {/* Modal para iOS con DatePicker */}
        {Platform.OS === 'ios' && showDatePicker && (
          <Modal
            transparent
            animationType="slide"
            visible={showDatePicker}
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Pressable onPress={() => setShowDatePicker(false)}>
                    <AppText style={styles.modalButton}>Cancelar</AppText>
                  </Pressable>
                  <Pressable onPress={() => setShowDatePicker(false)}>
                    <AppText style={[styles.modalButton, styles.modalButtonDone]}>
                      Listo
                    </AppText>
                  </Pressable>
                </View>
                <DateTimePicker
                  value={birthdate}
                  mode="date"
                  display="spinner"
                  onChange={(_event: any, selectedDate?: Date) => {
                    if (selectedDate) {
                      setBirthdate(selectedDate);
                    }
                  }}
                  maximumDate={new Date()}
                  textColor={colors.white}
                  style={styles.datePicker}
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
                setBirthdate(selectedDate);
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
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    color: colors.white,
    fontFamily: fonts.text,
    fontSize: 16,
  },
  dateButton: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  button: {
    marginTop: 16,
    marginBottom: 16,
  },
  skipText: {
    textAlign: 'center',
    fontSize: 16,
    color: colors.white,
  },
  skipTextPressed: {
    textDecorationLine: 'underline',
  },
  // Estilos para el Modal del DatePicker (iOS)
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#1C1C1C',
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
    color: colors.white,
  },
  modalButtonDone: {
    color: colors.primary,
    fontWeight: '600',
  },
  datePicker: {
    backgroundColor: '#1C1C1C',
  },
});
