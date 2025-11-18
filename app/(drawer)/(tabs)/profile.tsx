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
  Switch,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AppContainer } from '@/src/components/ui/AppContainer';
import { AppTitle } from '@/src/components/ui/AppTitle';
import { AppText } from '@/src/components/ui/AppText';
import { AppButton } from '@/src/components/ui/AppButton';
import { useUser } from '@/src/context/UserContext';
import { useBirthdays } from '@/src/context/BirthdaysContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { colors, fonts } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { db } from '@/src/database';
import { useDailyChangeLimit } from '@/src/hooks/useDailyChangeLimit';

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

const AVATARS = [
  '👨', '👩', '🧑', '👴', '👵', '🧓',
  '👨‍🦱', '👩‍🦱', '🧑‍🦱', '👨‍🦰', '👩‍🦰', '🧑‍🦰',
  '👨‍🦳', '👩‍🦳', '🧑‍🦳', '👨‍🦲', '👩‍🦲', '🧑‍🦲',
  '👱‍♂️', '👱‍♀️', '👱', '🧔', '🧔‍♂️', '🧔‍♀️',
  '👨‍⚕️', '👩‍⚕️', '🧑‍⚕️', '👨‍🎓', '👩‍🎓', '🧑‍🎓',
  '👨‍🏫', '👩‍🏫', '🧑‍🏫', '👨‍⚖️', '👩‍⚖️', '🧑‍⚖️',
  '👨‍🌾', '👩‍🌾', '🧑‍🌾', '👨‍🍳', '👩‍🍳', '🧑‍🍳',
  '👨‍🔧', '👩‍🔧', '🧑‍🔧', '👨‍🏭', '👩‍🏭', '🧑‍🏭',
  '👨‍💼', '👩‍💼', '🧑‍💼', '👨‍🔬', '👩‍🔬', '🧑‍🔬',
  '👨‍💻', '👩‍💻', '🧑‍💻', '👨‍🎤', '👩‍🎤', '🧑‍🎤',
  '👨‍🎨', '👩‍🎨', '🧑‍🎨', '👨‍✈️', '👩‍✈️', '🧑‍✈️',
  '👨‍🚀', '👩‍🚀', '🧑‍🚀', '👨‍🚒', '👩‍🚒', '🧑‍🚒',
  '👮‍♂️', '👮‍♀️', '👮', '🕵️‍♂️', '🕵️‍♀️', '🕵️',
  '💂‍♂️', '💂‍♀️', '💂', '👷‍♂️', '👷‍♀️', '👷',
  '🤴', '👸', '👳‍♂️', '👳‍♀️', '👳', '👲',
  '🧕', '🤵‍♂️', '🤵‍♀️', '🤵', '👰‍♂️', '👰‍♀️',
  '🤰', '🤱', '👼', '🎅', '🤶', '🧑‍🎄',
];

export default function ProfileScreen() {
  const { user, setUser } = useUser();
  const { refreshUsers } = useBirthdays();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [editedAvatar, setEditedAvatar] = useState(user?.avatar || '');
  const [editedHobbies, setEditedHobbies] = useState<string[]>(user?.hobbies || []);
  const [hideAge, setHideAge] = useState(user?.hideAge || false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showBirthdayInfo, setShowBirthdayInfo] = useState(false);
  const [customHobby, setCustomHobby] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getNextBirthday = (birthdate: Date) => {
    const today = new Date();
    const nextBirthday = new Date(
      today.getFullYear(),
      birthdate.getMonth(),
      birthdate.getDate()
    );
    
    // Si el cumpleaños ya pasó este año, usar el del próximo año
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    
    return nextBirthday;
  };

  const formatNextBirthday = (birthdate: Date) => {
    const nextBirthday = getNextBirthday(birthdate);
    return nextBirthday.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
    });
  };

  // Hook para límite de cambios de privacidad
  const privacyChangeLimit = useDailyChangeLimit({
    currentCount: user?.hideAgeChangesCount || 0,
    lastChangeDate: user?.hideAgeLastChangeDate,
    maxChanges: 3,
    fieldName: 'la configuración de privacidad',
  });

  // Hook para límite de cambios de nombre
  const nameChangeLimit = useDailyChangeLimit({
    currentCount: user?.nameChangesCount || 0,
    lastChangeDate: user?.nameLastChangeDate,
    maxChanges: 3,
    fieldName: 'tu nombre',
  });

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

  const handleSave = async () => {
    if (!editedName.trim()) {
      Alert.alert(t('create_profile_error_title'), t('profile_error_empty_name'));
      return;
    }

    if (!user?.id) {
      Alert.alert(t('create_profile_error_title'), t('profile_error_no_user_id'));
      return;
    }

    // Verificar si el nombre cambió
    const nameChanged = editedName !== user.name;
    
    // Si el nombre cambió, verificar límite
    if (nameChanged && !nameChangeLimit.checkAndNotify()) {
      return;
    }

    try {
      setIsSaving(true);

      const updateData: any = {
        name: editedName,
        avatar: editedAvatar,
        hobbies: editedHobbies,
      };

      // Si el nombre cambió, actualizar contador
      if (nameChanged) {
        const nameLimitData = nameChangeLimit.getNewChangeLimitData();
        updateData.nameChangesCount = nameLimitData.count;
        updateData.nameLastChangeDate = nameLimitData.lastChangeDate;
      }

      // Actualizar en Firebase
      await db.getAdapter().updateUser(user.id, updateData);

      // Actualizar contexto local
      setUser({
        ...user,
        name: editedName,
        avatar: editedAvatar,
        hobbies: editedHobbies,
        ...(nameChanged && {
          nameChangesCount: updateData.nameChangesCount,
          nameLastChangeDate: updateData.nameLastChangeDate,
        }),
      });

      // Refrescar calendario para mostrar cambios
      await refreshUsers();

      setIsEditing(false);
      console.log('✅ Profile updated successfully');
      
      // Notificar cambios restantes si el nombre cambió
      if (nameChanged) {
        nameChangeLimit.notifyRemainingChanges(updateData.nameChangesCount);
      } else {
        Alert.alert(t('invite_connected_title'), t('profile_success'));
      }
    } catch (error: any) {
      console.error('❌ Error updating profile:', error);
      Alert.alert(t('create_profile_error_title'), t('profile_error_update'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedName(user?.name || '');
    setEditedAvatar(user?.avatar || '');
    setEditedHobbies(user?.hobbies || []);
    setHideAge(user?.hideAge || false);
    setIsEditing(false);
  };

  if (!user) {
    return (
      <AppContainer>
        <View style={styles.emptyContainer}>
          <AppTitle>{t('profile_no_user_title')}</AppTitle>
          <AppText style={styles.emptyText}>
            {t('profile_no_user_text')}
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
                <AppTitle>{t('profile_title')}</AppTitle>
                {!isEditing && (
                  <Pressable
                    style={styles.editButton}
                    onPress={() => setIsEditing(true)}
                  >
                    <Ionicons name="pencil" size={20} color={colors.primary} />
                    <AppText style={styles.editButtonText}>{t('profile_edit')}</AppText>
                  </Pressable>
                )}
              </View>

              {/* Nombre */}
              <View style={styles.section}>
                <AppText style={styles.label}>{t('profile_name')}</AppText>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={editedName}
                    onChangeText={setEditedName}
                    placeholder={t('profile_name_placeholder')}
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

              {/* Avatar */}
              <View style={styles.section}>
                <AppText style={styles.label}>{t('profile_avatar')}</AppText>
                {isEditing ? (
                  <Pressable
                    style={styles.avatarButton}
                    onPress={() => {
                      Keyboard.dismiss();
                      setShowAvatarPicker(true);
                    }}
                  >
                    <AppText style={styles.avatarEmoji}>{editedAvatar}</AppText>
                    <AppText style={styles.changeAvatarText}>{t('profile_change_avatar')}</AppText>
                  </Pressable>
                ) : (
                  <View style={styles.valueContainer}>
                    <AppText style={styles.avatarEmoji}>{user.avatar}</AppText>
                  </View>
                )}
              </View>

              {/* Email (no editable) */}
              <View style={styles.section}>
                <AppText style={styles.label}>{t('profile_email')}</AppText>
                <View style={[styles.valueContainer, styles.disabledContainer]}>
                  <AppText style={styles.value}>{user.email}</AppText>
                  <Ionicons name="lock-closed" size={16} color="#666" />
                </View>
              </View>

              {/* Fecha de nacimiento */}
              <View style={styles.section}>
                <AppText style={styles.label}>{t('profile_birthdate')}</AppText>
                <View style={[styles.valueContainer, styles.disabledContainer]}>
                  <AppText style={styles.value}>{formatDate(user.birthdate)}</AppText>
                  <Ionicons name="lock-closed" size={16} color="#666" />
                </View>
              </View>

              {/* Privacidad: No revelar edad */}
              <View style={styles.section}>
                <View style={styles.privacyRow}>
                  <View style={styles.privacyLabelContainer}>
                    <AppText style={styles.privacyLabel}>{t('profile_privacy_hide_age')}</AppText>
                    <Pressable 
                      onPress={() => setShowBirthdayInfo(!showBirthdayInfo)}
                      hitSlop={8}
                    >
                      <Ionicons name="information-circle-outline" size={18} color="#999" />
                    </Pressable>
                  </View>
                  <Switch
                    value={hideAge}
                    onValueChange={async (value) => {
                      // Verificar límite de cambios
                      if (!privacyChangeLimit.checkAndNotify()) {
                        return;
                      }

                      setHideAge(value);
                      // Guardar inmediatamente en la base de datos
                      try {
                        const limitData = privacyChangeLimit.getNewChangeLimitData();

                        await db.getAdapter().updateUser(user.id!, {
                          hideAge: value,
                          hideAgeChangesCount: limitData.count,
                          hideAgeLastChangeDate: limitData.lastChangeDate,
                        });
                        
                        // Actualizar contexto local
                        setUser({
                          ...user,
                          hideAge: value,
                          hideAgeChangesCount: limitData.count,
                          hideAgeLastChangeDate: limitData.lastChangeDate,
                        });
                        
                        console.log(`✅ Privacy setting updated`);
                        
                        // Notificar cambios restantes
                        privacyChangeLimit.notifyRemainingChanges(limitData.count);
                      } catch (error) {
                        console.error('❌ Error updating privacy setting:', error);
                        Alert.alert(t('create_profile_error_title'), t('profile_error_privacy'));
                        // Revertir el cambio en caso de error
                        setHideAge(!value);
                      }
                    }}
                    trackColor={{ false: '#3A3A3A', true: colors.primary }}
                    thumbColor={hideAge ? colors.secondary : '#f4f3f4'}
                    ios_backgroundColor="#3A3A3A"
                  />
                </View>
                
                {showBirthdayInfo && (
                  <View style={styles.infoBox}>
                    <Ionicons name="information-circle" size={16} color={colors.primary} />
                    <AppText style={styles.infoText}>
                      {t('profile_privacy_info')}
                    </AppText>
                  </View>
                )}

                {hideAge && (
                  <View style={styles.previewContainer}>
                    <AppText style={styles.previewLabel}>{t('profile_privacy_preview')}</AppText>
                    <AppText style={styles.previewValue}>{formatNextBirthday(user.birthdate)}</AppText>
                  </View>
                )}
              </View>

              {/* Hobbies */}
              <View style={styles.section}>
                <AppText style={styles.label}>{t('profile_hobbies')}</AppText>
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
                        <AppText style={styles.hobbyText}>{t('profile_hobbies_other')}</AppText>
                      </Pressable>
                    </View>

                    {showCustomInput && (
                      <View style={styles.customInputContainer}>
                        <TextInput
                          style={styles.customInput}
                          value={customHobby}
                          onChangeText={setCustomHobby}
                          placeholder={t('profile_hobbies_custom_placeholder')}
                          placeholderTextColor="#666"
                          onSubmitEditing={addCustomHobby}
                        />
                        <Pressable style={styles.addButton} onPress={addCustomHobby}>
                          <AppText style={styles.addButtonText}>{t('profile_hobbies_add')}</AppText>
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
                      <AppText style={styles.emptyText}>{t('profile_hobbies_empty')}</AppText>
                    )}
                  </View>
                )}
              </View>

              {/* Botones de acción */}
              {isEditing && (
                <View style={styles.actions}>
                  <AppButton
                    title={isSaving ? t('profile_saving') : t('profile_save')}
                    onPress={handleSave}
                    disabled={isSaving}
                    style={styles.saveButton}
                  />
                  <Pressable style={styles.cancelButton} onPress={handleCancel}>
                    <AppText style={styles.cancelButtonText}>{t('profile_cancel')}</AppText>
                  </Pressable>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>


          {/* Modal para seleccionar Avatar */}
          {showAvatarPicker && (
            <Modal
              transparent
              animationType="slide"
              visible={showAvatarPicker}
              onRequestClose={() => setShowAvatarPicker(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, styles.avatarModalContent]}>
                  <View style={styles.modalHeader}>
                    <AppText style={styles.modalTitle}>{t('profile_select_avatar')}</AppText>
                    <Pressable onPress={() => setShowAvatarPicker(false)}>
                      <Ionicons name="close" size={24} color={colors.white} />
                    </Pressable>
                  </View>
                  <ScrollView 
                    style={styles.avatarScrollView}
                    showsVerticalScrollIndicator={false}
                  >
                    <View style={styles.avatarsGrid}>
                      {AVATARS.map((avatar, index) => (
                        <Pressable
                          key={index}
                          style={[
                            styles.avatarOption,
                            editedAvatar === avatar && styles.avatarOptionSelected,
                          ]}
                          onPress={() => {
                            setEditedAvatar(avatar);
                            setShowAvatarPicker(false);
                          }}
                        >
                          <AppText style={styles.avatarOptionEmoji}>{avatar}</AppText>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </View>
            </Modal>
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
  avatarButton: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarEmoji: {
    fontSize: 32,
  },
  changeAvatarText: {
    fontSize: 16,
    color: colors.primary,
  },
  avatarModalContent: {
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  avatarScrollView: {
    maxHeight: 500,
  },
  avatarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 20,
    justifyContent: 'center',
  },
  avatarOption: {
    width: 60,
    height: 60,
    backgroundColor: '#2A2A2A',
    borderWidth: 2,
    borderColor: '#444',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: '#3A3A3A',
  },
  avatarOptionEmoji: {
    fontSize: 32,
  },
  privacyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  privacyLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  privacyLabel: {
    fontSize: 16,
    color: colors.white,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#CCC',
    lineHeight: 18,
  },
  previewContainer: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  previewLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewValue: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
});
