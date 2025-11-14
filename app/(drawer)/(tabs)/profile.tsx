import { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
  Modal,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AppContainer } from '@/src/components/ui/AppContainer';
import { AppTitle } from '@/src/components/ui/AppTitle';
import { AppText } from '@/src/components/ui/AppText';
import { AppButton } from '@/src/components/ui/AppButton';
import { useUser } from '@/src/context/UserContext';
import { colors, fonts } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';

const HOBBIES = [
  'Deportes',
  'Lectura',
  'Música',
  'Cine',
  'Cocina',
  'Viajes',
  'Fotografía',
  'Gaming',
  'Arte',
  'Tecnología',
];

export default function ProfileScreen() {
  const { user, setUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [editedBirthdate, setEditedBirthdate] = useState(user?.birthdate || new Date());
  const [editedHobbies, setEditedHobbies] = useState<string[]>(user?.hobbies || []);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customHobby, setCustomHobby] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const toggleHobby = (hobby: string) => {
    if (editedHobbies.includes(hobby)) {
      setEditedHobbies(editedHobbies.filter((h) => h !== hobby));
    } else {
      setEditedHobbies([...editedHobbies, hobby]);
    }
  };

  const addCustomHobby = () => {
    if (customHobby.trim()) {
      setEditedHobbies([...editedHobbies, customHobby.trim()]);
      setCustomHobby('');
      setShowCustomInput(false);
    }
  };

  const handleSave = () => {
    if (!editedName.trim()) {
      Alert.alert('Error', 'El nombre no puede estar vacío');
      return;
    }

    if (user) {
      setUser({
        ...user,
        name: editedName,
        birthdate: editedBirthdate,
        hobbies: editedHobbies,
      });
      setIsEditing(false);
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    }
  };

  const handleCancel = () => {
    setEditedName(user?.name || '');
    setEditedBirthdate(user?.birthdate || new Date());
    setEditedHobbies(user?.hobbies || []);
    setIsEditing(false);
  };

  if (!user) {
    return (
      <AppContainer>
        <View style={styles.emptyContainer}>
          <AppTitle>No hay usuario</AppTitle>
          <AppText style={styles.emptyText}>
            Por favor inicia sesión o crea un perfil
          </AppText>
        </View>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.content}>
              <View style={styles.header}>
                <AppTitle>Mi Perfil</AppTitle>
                {!isEditing && (
                  <Pressable
                    style={styles.editButton}
                    onPress={() => setIsEditing(true)}
                  >
                    <Ionicons name="pencil" size={20} color={colors.primary} />
                    <AppText style={styles.editButtonText}>Editar</AppText>
                  </Pressable>
                )}
              </View>

              {/* Nombre */}
              <View style={styles.section}>
                <AppText style={styles.label}>Nombre</AppText>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={editedName}
                    onChangeText={setEditedName}
                    placeholder="Tu nombre"
                    placeholderTextColor="#666"
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                  />
                ) : (
                  <View style={styles.valueContainer}>
                    <AppText style={styles.value}>{user.name}</AppText>
                  </View>
                )}
              </View>

              {/* Email (no editable) */}
              <View style={styles.section}>
                <AppText style={styles.label}>Email</AppText>
                <View style={[styles.valueContainer, styles.disabledContainer]}>
                  <AppText style={styles.value}>{user.email}</AppText>
                  <Ionicons name="lock-closed" size={16} color="#666" />
                </View>
              </View>

              {/* Fecha de nacimiento */}
              <View style={styles.section}>
                <AppText style={styles.label}>Fecha de nacimiento</AppText>
                {isEditing ? (
                  <Pressable
                    style={styles.dateButton}
                    onPress={() => {
                      Keyboard.dismiss();
                      setShowDatePicker(true);
                    }}
                  >
                    <AppText>{formatDate(editedBirthdate)}</AppText>
                  </Pressable>
                ) : (
                  <View style={styles.valueContainer}>
                    <AppText style={styles.value}>{formatDate(user.birthdate)}</AppText>
                  </View>
                )}
              </View>

              {/* Hobbies */}
              <View style={styles.section}>
                <AppText style={styles.label}>Hobbies</AppText>
                {isEditing ? (
                  <>
                    <View style={styles.hobbiesGrid}>
                      {HOBBIES.map((hobby) => (
                        <Pressable
                          key={hobby}
                          style={[
                            styles.hobbyChip,
                            editedHobbies.includes(hobby) && styles.hobbyChipSelected,
                          ]}
                          onPress={() => toggleHobby(hobby)}
                        >
                          <AppText
                            style={[
                              styles.hobbyText,
                              editedHobbies.includes(hobby) && styles.hobbyTextSelected,
                            ]}
                          >
                            {hobby}
                          </AppText>
                        </Pressable>
                      ))}
                      <Pressable
                        style={[styles.hobbyChip, styles.hobbyChipOther]}
                        onPress={() => setShowCustomInput(!showCustomInput)}
                      >
                        <AppText style={styles.hobbyText}>Otro</AppText>
                      </Pressable>
                    </View>

                    {showCustomInput && (
                      <View style={styles.customInputContainer}>
                        <TextInput
                          style={styles.customInput}
                          value={customHobby}
                          onChangeText={setCustomHobby}
                          placeholder="Escribe tu hobby"
                          placeholderTextColor="#666"
                          onSubmitEditing={addCustomHobby}
                        />
                        <Pressable style={styles.addButton} onPress={addCustomHobby}>
                          <AppText style={styles.addButtonText}>Añadir</AppText>
                        </Pressable>
                      </View>
                    )}
                  </>
                ) : (
                  <View style={styles.hobbiesList}>
                    {user.hobbies.length > 0 ? (
                      user.hobbies.map((hobby, index) => (
                        <View key={index} style={styles.hobbyBadge}>
                          <AppText style={styles.hobbyBadgeText}>{hobby}</AppText>
                        </View>
                      ))
                    ) : (
                      <AppText style={styles.emptyText}>Sin hobbies</AppText>
                    )}
                  </View>
                )}
              </View>

              {/* Botones de acción */}
              {isEditing && (
                <View style={styles.actions}>
                  <AppButton
                    title="Guardar"
                    onPress={handleSave}
                    style={styles.saveButton}
                  />
                  <Pressable style={styles.cancelButton} onPress={handleCancel}>
                    <AppText style={styles.cancelButtonText}>Cancelar</AppText>
                  </Pressable>
                </View>
              )}
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
                    value={editedBirthdate}
                    mode="date"
                    display="spinner"
                    onChange={(_event: any, selectedDate?: Date) => {
                      if (selectedDate) {
                        setEditedBirthdate(selectedDate);
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

          {/* DatePicker para Android */}
          {Platform.OS === 'android' && showDatePicker && (
            <DateTimePicker
              value={editedBirthdate}
              mode="date"
              display="default"
              onChange={(_event: any, selectedDate?: Date) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setEditedBirthdate(selectedDate);
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
  },
  content: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
  },
  editButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  valueContainer: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  disabledContainer: {
    opacity: 0.6,
  },
  value: {
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
  hobbiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  hobbyChip: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  hobbyChipSelected: {
    backgroundColor: colors.primary,
  },
  hobbyChipOther: {
    borderStyle: 'dashed',
  },
  hobbyText: {
    fontSize: 14,
    color: colors.white,
  },
  hobbyTextSelected: {
    color: colors.secondary,
    fontWeight: '600',
  },
  customInputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  customInput: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: colors.white,
    fontFamily: fonts.text,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  addButtonText: {
    color: colors.secondary,
    fontWeight: '600',
  },
  hobbiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hobbyBadge: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  hobbyBadgeText: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: '600',
  },
  actions: {
    marginTop: 16,
    gap: 12,
  },
  saveButton: {
    marginBottom: 0,
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
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
