import { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  Pressable, 
  ScrollView, 
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useRouter } from 'expo-router';
import { AppContainer } from '@/src/components/ui/AppContainer';
import { AppTitle } from '@/src/components/ui/AppTitle';
import { AppText } from '@/src/components/ui/AppText';
import { AppButton } from '@/src/components/ui/AppButton';
import { colors, fonts } from '@/src/theme';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { useUser } from '@/src/context/UserContext';
import { useLanguage } from '@/src/context/LanguageContext';

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

export default function CreateProfileStep2() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { t } = useLanguage();
  const { tempUser, setTempUser } = useUser();
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>(tempUser?.hobbies || []);
  const [customHobby, setCustomHobby] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [skipPressed, setSkipPressed] = useState(false);

  const toggleHobby = (hobby: string) => {
    if (selectedHobbies.includes(hobby)) {
      setSelectedHobbies(selectedHobbies.filter((h) => h !== hobby));
    } else {
      setSelectedHobbies([...selectedHobbies, hobby]);
    }
  };

  const addCustomHobby = () => {
    if (customHobby.trim()) {
      setSelectedHobbies([...selectedHobbies, customHobby.trim()]);
      setCustomHobby('');
      setShowCustomInput(false);
    }
  };

  const handleContinue = () => {
    // Guardar hobbies TEMPORALES en el contexto (no en DB todavía)
    if (tempUser) {
      setTempUser({
        ...tempUser,
        hobbies: selectedHobbies,
      });
    }

    router.push('/create-profile/gift-preferences');
  };

  const handleSkip = () => {
    // Saltar hobbies (guardar array vacío)
    if (tempUser) {
      setTempUser({
        ...tempUser,
        hobbies: [],
      });
    }
    router.push('/create-profile/gift-preferences');
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
              <AppTitle style={styles.title}>¿Cuáles son tus hobbies?</AppTitle>

              <View style={styles.hobbiesGrid}>
                {HOBBY_KEYS.map((hobbyKey) => {
                  const hobbyLabel = t(hobbyKey);
                  return (
                    <Pressable
                      key={hobbyKey}
                      style={[
                        styles.hobbyChip,
                        { backgroundColor: theme.inputBg, borderColor: theme.border },
                        selectedHobbies.includes(hobbyLabel) && styles.hobbyChipSelected,
                      ]}
                      onPress={() => toggleHobby(hobbyLabel)}
                    >
                      <AppText
                        style={[
                          styles.hobbyText,
                          { color: theme.text },
                          selectedHobbies.includes(hobbyLabel) && styles.hobbyTextSelected,
                        ]}
                      >
                        {hobbyLabel}
                      </AppText>
                    </Pressable>
                  );
                })}

                <Pressable
                  style={[
                    styles.hobbyChip,
                    { backgroundColor: theme.inputBg, borderColor: theme.border },
                    styles.hobbyChipOther,
                  ]}
                  onPress={() => setShowCustomInput(!showCustomInput)}
                >
                  <AppText style={[styles.hobbyText, { color: theme.text }]}>Otro</AppText>
                </Pressable>
              </View>

              {showCustomInput && (
                <View style={styles.customInputContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text },
                    ]}
                    value={customHobby}
                    onChangeText={setCustomHobby}
                    placeholder="Escribe tu hobby"
                    placeholderTextColor={theme.textMuted}
                    onSubmitEditing={addCustomHobby}
                  />
                  <Pressable style={styles.addButton} onPress={addCustomHobby}>
                    <AppText style={styles.addButtonText}>Añadir</AppText>
                  </Pressable>
                </View>
              )}

              {selectedHobbies.length > 0 && (
                <View style={styles.selectedContainer}>
                  <AppText style={[styles.selectedLabel, { color: theme.text }]}>Seleccionados:</AppText>
                  <View style={styles.selectedList}>
                    {selectedHobbies.map((hobby, index) => (
                      <View key={index} style={styles.selectedChip}>
                        <AppText style={styles.selectedText}>{hobby}</AppText>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <AppButton
                title={t('create_profile_username_continue')}
                onPress={handleContinue}
                style={styles.button}
              />

              <Pressable
                onPress={handleSkip}
                onPressIn={() => setSkipPressed(true)}
                onPressOut={() => setSkipPressed(false)}
              >
                <AppText
                  style={[
                    styles.skipText,
                    { color: theme.textMuted },
                    skipPressed && styles.skipTextPressed,
                  ]}
                >
                  Saltar
                </AppText>
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
    paddingBottom: 40,
  },
  title: {
    marginBottom: 40,
    textAlign: 'center',
  },
  hobbiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  hobbyChip: {
    borderWidth: 1,
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
  },
  hobbyTextSelected: {
    color: colors.secondary,
    fontWeight: '600',
  },
  customInputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
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
  selectedContainer: {
    marginBottom: 24,
  },
  selectedLabel: {
    fontSize: 16,
    marginBottom: 12,
    fontWeight: '600',
  },
  selectedList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedChip: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  selectedText: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: '600',
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
  },
  skipText: {
    textAlign: 'center',
    fontSize: 16,
  },
  skipTextPressed: {
    textDecorationLine: 'underline',
  },
});
