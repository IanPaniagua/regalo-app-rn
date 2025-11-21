import { useState, useEffect } from 'react';
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
  ActivityIndicator,
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
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import { db } from '@/src/database';
import { useDailyChangeLimit } from '@/src/hooks/useDailyChangeLimit';

const HOBBY_KEYS = [
  'hobby_sports',
  'hobby_reading',
  'hobby_music',
  'hobby_movies',
  'hobby_cooking',
  'hobby_travel',
  'hobby_photography',
  'hobby_gaming',
  'hobby_art',
  'hobby_technology',
] as const;

const GIFT_PREFERENCE_KEYS = [
  'gift_clothes',
  'gift_socks',
  'gift_books',
  'gift_videogames',
  'gift_technology',
  'gift_music',
  'gift_sports',
  'gift_art',
  'gift_cooking',
  'gift_travel',
] as const;

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
  const { t, lang } = useLanguage();
  const { theme } = useAppTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [editedUsername, setEditedUsername] = useState(user?.username || '');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState<string>('');
  const [editedAvatar, setEditedAvatar] = useState(user?.avatar || '');
  const [editedHobbies, setEditedHobbies] = useState<string[]>(user?.hobbies || []);
  const [editedGiftPreferences, setEditedGiftPreferences] = useState<string[]>(user?.giftPreferences || []);
  const [hideAge, setHideAge] = useState(user?.hideAge || false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showBirthdayInfo, setShowBirthdayInfo] = useState(false);
  const [customHobby, setCustomHobby] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customGiftPreference, setCustomGiftPreference] = useState('');
  const [showCustomGiftInput, setShowCustomGiftInput] = useState(false);

  const formatDate = (date: Date) => {
    const locale = lang === 'es' ? 'es-ES' : lang === 'de' ? 'de-DE' : 'en-US';
    return date.toLocaleDateString(locale, {
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
    const locale = lang === 'es' ? 'es-ES' : lang === 'de' ? 'de-DE' : 'en-US';
    return nextBirthday.toLocaleDateString(locale, {
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
    fieldName: 'el nombre',
  });

  // Validar username con debounce
  useEffect(() => {
    if (!isEditing) return;

    const validateUsername = (text: string): string | null => {
      if (text.length === 0) return null;
      if (text.length < 3) return t('create_profile_username_too_short');
      if (text.length > 20) return t('create_profile_username_too_long');
      if (!/^[a-zA-Z0-9_]+$/.test(text)) return t('create_profile_username_invalid');
      return null;
    };

    const validationError = validateUsername(editedUsername);
    if (validationError) {
      setUsernameError(validationError);
      setIsUsernameAvailable(null);
      return;
    }

    if (editedUsername.length === 0) {
      setUsernameError('');
      setIsUsernameAvailable(null);
      return;
    }

    // Si el username no cambió, no validar
    if (editedUsername.toLowerCase() === user?.username?.toLowerCase()) {
      setUsernameError('');
      setIsUsernameAvailable(true);
      return;
    }

    setUsernameError('');
    const timeoutId = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const available = await db.getAdapter().isUsernameAvailable(editedUsername);
        setIsUsernameAvailable(available);
        if (!available) {
          setUsernameError(t('create_profile_username_taken'));
        }
      } catch (err) {
        console.error('Error checking username:', err);
        setUsernameError('Error al verificar disponibilidad');
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [editedUsername, isEditing, user?.username]);

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

  const toggleGiftPreference = (preference: string) => {
    if (editedGiftPreferences.includes(preference)) {
      setEditedGiftPreferences(editedGiftPreferences.filter((p) => p !== preference));
    } else {
      setEditedGiftPreferences([...editedGiftPreferences, preference]);
    }
  };

  const addCustomGiftPreference = () => {
    if (customGiftPreference.trim()) {
      setEditedGiftPreferences([...editedGiftPreferences, customGiftPreference.trim()]);
      setCustomGiftPreference('');
      setShowCustomGiftInput(false);
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

    // Validar username si se está editando
    if (editedUsername && editedUsername.length > 0) {
      if (isCheckingUsername) {
        Alert.alert(t('create_profile_error_title'), 'Verificando username...');
        return;
      }
      if (!isUsernameAvailable) {
        Alert.alert(t('create_profile_error_title'), usernameError || 'Username no disponible');
        return;
      }
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
        username: editedUsername ? editedUsername.toLowerCase() : undefined,
        avatar: editedAvatar,
        hobbies: editedHobbies,
        giftPreferences: editedGiftPreferences,
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
        username: editedUsername ? editedUsername.toLowerCase() : undefined,
        avatar: editedAvatar,
        hobbies: editedHobbies,
        giftPreferences: editedGiftPreferences,
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
    setEditedUsername(user?.username || '');
    setIsUsernameAvailable(null);
    setUsernameError('');
    setEditedAvatar(user?.avatar || '');
    setEditedHobbies(user?.hobbies || []);
    setEditedGiftPreferences(user?.giftPreferences || []);
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
                <AppTitle style={styles.title}>{t('profile_title')}</AppTitle>
                {!isEditing && (
                  <Pressable
                    style={[
                      styles.editButton,
                      { 
                        backgroundColor: theme.surface,
                        borderColor: colors.primary,
                      }
                    ]}
                    onPress={() => setIsEditing(true)}
                  >
                    <Ionicons name="pencil" size={20} color={colors.primary} />
                    <AppText style={styles.editButtonText}>{t('profile_edit')}</AppText>
                  </Pressable>
                )}
              </View>

              {/* Avatar centrado en círculo */}
              <View style={styles.avatarSection}>
                {isEditing ? (
                  <Pressable
                    style={[styles.avatarCircle, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    onPress={() => {
                      Keyboard.dismiss();
                      setShowAvatarPicker(true);
                    }}
                  >
                    <AppText style={styles.avatarEmojiLarge}>{editedAvatar}</AppText>
                  </Pressable>
                ) : (
                  <View style={[styles.avatarCircle, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <AppText style={styles.avatarEmojiLarge}>{user.avatar}</AppText>
                  </View>
                )}
                {isEditing && (
                  <AppText style={[styles.changeAvatarHint, { color: theme.textMuted }]}>{t('profile_change_avatar')}</AppText>
                )}
              </View>

              {/* Nombre centrado */}
              <View style={styles.nameSection}>
                {isEditing ? (
                  <TextInput
                    style={[styles.nameInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
                    value={editedName}
                    onChangeText={setEditedName}
                    placeholder={t('profile_name_placeholder')}
                    placeholderTextColor="#666"
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                    textAlign="center"
                  />
                ) : (
                  <AppText style={[styles.nameText, { color: theme.text }]}>{user.name}</AppText>
                )}
              </View>

              {/* Username */}
              <View style={styles.section}>
                <AppText style={[styles.label, { color: theme.textSecondary }]}>{t('profile_username')}</AppText>
                {isEditing ? (
                  <>
                    <View style={[styles.usernameInputWrapper, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                      <AppText style={[styles.usernamePrefix, { color: theme.text }]}>@</AppText>
                      <TextInput
                        style={[styles.usernameInput, { color: theme.text }]}
                        value={editedUsername}
                        onChangeText={setEditedUsername}
                        placeholder={t('create_profile_username_placeholder')}
                        placeholderTextColor={theme.textMuted}
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="off"
                      />
                      {isCheckingUsername && (
                        <ActivityIndicator size="small" color={colors.primary} />
                      )}
                      {!isCheckingUsername && editedUsername.length > 0 && (
                        <Ionicons 
                          name={isUsernameAvailable ? "checkmark-circle" : "close-circle"} 
                          size={20} 
                          color={isUsernameAvailable ? "#10B981" : "#EF4444"} 
                        />
                      )}
                    </View>
                    {usernameError && editedUsername.length > 0 && (
                      <AppText style={styles.usernameError}>{usernameError}</AppText>
                    )}
                    {isUsernameAvailable && editedUsername.length > 0 && !usernameError && (
                      <AppText style={styles.usernameSuccess}>{t('create_profile_username_available')}</AppText>
                    )}
                  </>
                ) : (
                  <View style={[styles.valueContainer, { backgroundColor: theme.surface }]}>
                    <AppText style={styles.value}>
                      {user.username ? `@${user.username}` : t('profile_username_empty')}
                    </AppText>
                  </View>
                )}
              </View>

              {/* Email (no editable - solo visible para el propio usuario) */}
              <View style={styles.section}>
                <AppText style={[styles.label, { color: theme.textSecondary }]}>{t('profile_email')}</AppText>
                <View style={[styles.valueContainer, { backgroundColor: theme.surface }, styles.disabledContainer]}>
                  <AppText style={styles.value}>{user.email}</AppText>
                  <Ionicons name="lock-closed" size={16} color="#666" />
                </View>
              </View>

              {/* Fecha de nacimiento */}
              <View style={styles.section}>
                <AppText style={[styles.label, { color: theme.textSecondary }]}>{t('profile_birthdate')}</AppText>
                <View style={[styles.valueContainer, { backgroundColor: theme.surface }, styles.disabledContainer]}>
                  <AppText style={styles.value}>{formatDate(user.birthdate)}</AppText>
                  <Ionicons name="lock-closed" size={16} color="#666" />
                </View>
              </View>

              {/* Privacidad: No revelar edad */}
              <View style={styles.section}>
                <View style={[styles.privacyRow, { backgroundColor: theme.surface }]}>
                  <View style={styles.privacyLabelContainer}>
                    <AppText style={[styles.privacyLabel, { color: theme.text }]}>{t('profile_privacy_hide_age')}</AppText>
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
                  <View style={[styles.previewContainer, { backgroundColor: theme.surface }]}>
                    <AppText style={[styles.previewLabel, { color: theme.textMuted }]}>{t('profile_privacy_preview')}</AppText>
                    <AppText style={styles.previewValue}>{formatNextBirthday(user.birthdate)}</AppText>
                  </View>
                )}
              </View>

              {/* Hobbies */}
              <View style={styles.section}>
                <AppText style={[styles.label, { color: theme.textSecondary }]}>{t('profile_hobbies')}</AppText>
                {isEditing ? (
                  <>
                    <View style={styles.hobbiesGrid}>
                      {HOBBY_KEYS.map((hobbyKey) => {
                        const hobbyLabel = t(hobbyKey);
                        return (
                          <Pressable
                            key={hobbyKey}
                            style={[
                              styles.hobbyChip,
                              { backgroundColor: theme.surface, borderColor: theme.border },
                              editedHobbies.includes(hobbyLabel) && styles.hobbyChipSelected,
                            ]}
                            onPress={() => toggleHobby(hobbyLabel)}
                          >
                            <AppText
                              style={[
                                styles.hobbyText,
                                { color: theme.text },
                                editedHobbies.includes(hobbyLabel) && styles.hobbyTextSelected,
                              ]}
                            >
                              {hobbyLabel}
                            </AppText>
                          </Pressable>
                        );
                      })}
                      <Pressable
                        style={[styles.hobbyChip, { backgroundColor: theme.surface, borderColor: theme.border }, styles.hobbyChipOther]}
                        onPress={() => setShowCustomInput(!showCustomInput)}
                      >
                        <AppText style={[styles.hobbyText, { color: theme.text }]}>{t('profile_hobbies_other')}</AppText>
                      </Pressable>
                    </View>

                    {showCustomInput && (
                      <View style={styles.customInputContainer}>
                        <TextInput
                          style={[styles.customInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
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

              {/* Gift Preferences */}
              <View style={styles.section}>
                <AppText style={[styles.label, { color: theme.textSecondary }]}>{t('profile_gift_preferences')}</AppText>
                {isEditing ? (
                  <>
                    <View style={styles.hobbiesGrid}>
                      {GIFT_PREFERENCE_KEYS.map((prefKey) => {
                        const prefLabel = t(prefKey);
                        return (
                          <Pressable
                            key={prefKey}
                            style={[
                              styles.hobbyChip,
                              { backgroundColor: theme.surface, borderColor: theme.border },
                              editedGiftPreferences.includes(prefLabel) && styles.hobbyChipSelected,
                            ]}
                            onPress={() => toggleGiftPreference(prefLabel)}
                          >
                            <AppText
                              style={[
                                styles.hobbyText,
                                { color: theme.text },
                                editedGiftPreferences.includes(prefLabel) && styles.hobbyTextSelected,
                              ]}
                            >
                              {prefLabel}
                            </AppText>
                          </Pressable>
                        );
                      })}
                      <Pressable
                        style={[styles.hobbyChip, { backgroundColor: theme.surface, borderColor: theme.border }, styles.hobbyChipOther]}
                        onPress={() => setShowCustomGiftInput(!showCustomGiftInput)}
                      >
                        <AppText style={[styles.hobbyText, { color: theme.text }]}>{t('profile_gift_preferences_other')}</AppText>
                      </Pressable>
                    </View>

                    {showCustomGiftInput && (
                      <View style={styles.customInputContainer}>
                        <TextInput
                          style={[styles.customInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
                          value={customGiftPreference}
                          onChangeText={setCustomGiftPreference}
                          placeholder={t('profile_gift_preferences_custom_placeholder')}
                          placeholderTextColor="#666"
                          onSubmitEditing={addCustomGiftPreference}
                        />
                        <Pressable style={styles.addButton} onPress={addCustomGiftPreference}>
                          <AppText style={styles.addButtonText}>{t('profile_gift_preferences_add')}</AppText>
                        </Pressable>
                      </View>
                    )}
                  </>
                ) : (
                  <View style={styles.hobbiesList}>
                    {(user.giftPreferences && user.giftPreferences.length > 0) ? (
                      user.giftPreferences.map((preference, index) => (
                        <View key={index} style={styles.hobbyBadge}>
                          <AppText style={styles.hobbyBadgeText}>{preference}</AppText>
                        </View>
                      ))
                    ) : (
                      <AppText style={styles.emptyText}>{t('profile_gift_preferences_empty')}</AppText>
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
                  <Pressable 
                    style={[
                      styles.cancelButton, 
                      { 
                        borderColor: theme.border,
                        backgroundColor: theme.surface,
                      }
                    ]} 
                    onPress={handleCancel}
                  >
                    <AppText style={[styles.cancelButtonText, { color: theme.text }]}>
                      {t('profile_cancel')}
                    </AppText>
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
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarEmojiLarge: {
    fontSize: 64,
  },
  changeAvatarHint: {
    fontSize: 13,
    marginTop: 4,
  },
  nameSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  nameText: {
    fontSize: 24,
    fontWeight: '700',
  },
  nameInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    fontSize: 20,
    fontWeight: '600',
    minWidth: 200,
  },
  editButton: {
    position: 'absolute',
    right: 0,
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
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    color: '#0F172A',
    fontFamily: fonts.text,
    fontSize: 16,
  },
  valueContainer: {
    backgroundColor: '#F6FAFF',
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
    backgroundColor: '#F6FAFF',
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
    color: '#0F172A',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: '#0F172A',
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
    borderRadius: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
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
    backgroundColor: '#F6FAFF',
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
    backgroundColor: '#F6FAFF',
  },
  avatarButton: {
    backgroundColor: '#F6FAFF',
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
    backgroundColor: '#F6FAFF',
    borderWidth: 2,
    borderColor: '#C2D4F2',
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
    backgroundColor: '#F6FAFF',
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
    color: '#0F172A',
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
    color: '#334155',
    lineHeight: 18,
  },
  previewContainer: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  previewLabel: {
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewValue: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  usernameInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  usernamePrefix: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 4,
  },
  usernameInput: {
    flex: 1,
    fontFamily: fonts.text,
    fontSize: 16,
    paddingVertical: 12,
  },
  usernameError: {
    fontSize: 13,
    color: '#EF4444',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  usernameSuccess: {
    fontSize: 13,
    color: '#10B981',
    marginTop: 8,
    paddingHorizontal: 4,
  },
});
