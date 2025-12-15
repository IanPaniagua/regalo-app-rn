import { AppButton } from '@/src/components/ui/AppButton';
import { AppContainer } from '@/src/components/ui/AppContainer';
import { AppText } from '@/src/components/ui/AppText';
import { AppTitle } from '@/src/components/ui/AppTitle';
import { useLanguage } from '@/src/context/LanguageContext';
import { useUser } from '@/src/context/UserContext';
import { colors, fonts } from '@/src/theme';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableWithoutFeedback,
    View
} from 'react-native';

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

export default function CreateProfileGiftPreferences() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { t } = useLanguage();
  const { tempUser, setTempUser } = useUser();
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(tempUser?.giftPreferences || []);
  const [customPreference, setCustomPreference] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [skipPressed, setSkipPressed] = useState(false);

  const togglePreference = (preference: string) => {
    if (selectedPreferences.includes(preference)) {
      setSelectedPreferences(selectedPreferences.filter((p) => p !== preference));
    } else {
      setSelectedPreferences([...selectedPreferences, preference]);
    }
  };

  const addCustomPreference = () => {
    if (customPreference.trim()) {
      setSelectedPreferences([...selectedPreferences, customPreference.trim()]);
      setCustomPreference('');
      setShowCustomInput(false);
    }
  };

  const handleContinue = () => {
    // Guardar preferencias TEMPORALES en el contexto (no en DB todavía)
    if (tempUser) {
      setTempUser({
        ...tempUser,
        giftPreferences: selectedPreferences,
      });
    }

    router.push('/create-profile/avatar');
  };

  const handleSkip = () => {
    // Saltar preferencias (guardar array vacío)
    if (tempUser) {
      setTempUser({
        ...tempUser,
        giftPreferences: [],
      });
    }
    router.push('/create-profile/avatar');
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
              <AppTitle style={styles.title}>{t('create_profile_gift_preferences_title')}</AppTitle>

              <View style={styles.preferencesGrid}>
                {GIFT_PREFERENCE_KEYS.map((prefKey) => {
                  const prefLabel = t(prefKey);
                  return (
                    <Pressable
                      key={prefKey}
                      style={[
                        styles.preferenceChip,
                        { backgroundColor: theme.inputBg, borderColor: theme.border },
                        selectedPreferences.includes(prefLabel) && styles.preferenceChipSelected,
                      ]}
                      onPress={() => togglePreference(prefLabel)}
                    >
                      <AppText
                        style={[
                          styles.preferenceText,
                          { color: theme.text },
                          selectedPreferences.includes(prefLabel) && styles.preferenceTextSelected,
                        ]}
                      >
                        {prefLabel}
                      </AppText>
                    </Pressable>
                  );
                })}

                <Pressable
                  style={[
                    styles.preferenceChip,
                    { backgroundColor: theme.inputBg, borderColor: theme.border },
                    styles.preferenceChipOther,
                  ]}
                  onPress={() => setShowCustomInput(!showCustomInput)}
                >
                  <AppText style={[styles.preferenceText, { color: theme.text }]}>
                    {t('profile_gift_preferences_other')}
                  </AppText>
                </Pressable>
              </View>

              {showCustomInput && (
                <View style={styles.customInputContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text },
                    ]}
                    value={customPreference}
                    onChangeText={setCustomPreference}
                    placeholder={t('profile_gift_preferences_custom_placeholder')}
                    placeholderTextColor={theme.textMuted}
                    onSubmitEditing={addCustomPreference}
                  />
                  <Pressable style={styles.addButton} onPress={addCustomPreference}>
                    <AppText style={styles.addButtonText}>{t('profile_gift_preferences_add')}</AppText>
                  </Pressable>
                </View>
              )}

              {selectedPreferences.length > 0 && (
                <View style={styles.selectedContainer}>
                  <AppText style={[styles.selectedLabel, { color: theme.text }]}>Seleccionados:</AppText>
                  <View style={styles.selectedList}>
                    {selectedPreferences.map((preference, index) => (
                      <View key={index} style={styles.selectedChip}>
                        <AppText style={styles.selectedText}>{preference}</AppText>
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
                  {t('create_profile_gift_preferences_skip')}
                </AppText>
              </Pressable>
            </View>
          ) : (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.content}>
                <AppTitle style={styles.title}>{t('create_profile_gift_preferences_title')}</AppTitle>

                <View style={styles.preferencesGrid}>
                  {GIFT_PREFERENCE_KEYS.map((prefKey) => {
                    const prefLabel = t(prefKey);
                    return (
                      <Pressable
                        key={prefKey}
                        style={[
                          styles.preferenceChip,
                          { backgroundColor: theme.inputBg, borderColor: theme.border },
                          selectedPreferences.includes(prefLabel) && styles.preferenceChipSelected,
                        ]}
                        onPress={() => togglePreference(prefLabel)}
                      >
                        <AppText
                          style={[
                            styles.preferenceText,
                            { color: theme.text },
                            selectedPreferences.includes(prefLabel) && styles.preferenceTextSelected,
                          ]}
                        >
                          {prefLabel}
                        </AppText>
                      </Pressable>
                    );
                  })}

                  <Pressable
                    style={[
                      styles.preferenceChip,
                      { backgroundColor: theme.inputBg, borderColor: theme.border },
                      styles.preferenceChipOther,
                    ]}
                    onPress={() => setShowCustomInput(!showCustomInput)}
                  >
                    <AppText style={[styles.preferenceText, { color: theme.text }]}>
                      {t('profile_gift_preferences_other')}
                    </AppText>
                  </Pressable>
                </View>

                {showCustomInput && (
                  <View style={styles.customInputContainer}>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text },
                      ]}
                      value={customPreference}
                      onChangeText={setCustomPreference}
                      placeholder={t('profile_gift_preferences_custom_placeholder')}
                      placeholderTextColor={theme.textMuted}
                      onSubmitEditing={addCustomPreference}
                    />
                    <Pressable style={styles.addButton} onPress={addCustomPreference}>
                      <AppText style={styles.addButtonText}>{t('profile_gift_preferences_add')}</AppText>
                    </Pressable>
                  </View>
                )}

                {selectedPreferences.length > 0 && (
                  <View style={styles.selectedContainer}>
                    <AppText style={[styles.selectedLabel, { color: theme.text }]}>Seleccionados:</AppText>
                    <View style={styles.selectedList}>
                      {selectedPreferences.map((preference, index) => (
                        <View key={index} style={styles.selectedChip}>
                          <AppText style={styles.selectedText}>{preference}</AppText>
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
                    {t('create_profile_gift_preferences_skip')}
                  </AppText>
                </Pressable>
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
    marginBottom: 40,
    textAlign: 'center',
  },
  preferencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  preferenceChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  preferenceChipSelected: {
    backgroundColor: colors.primary,
  },
  preferenceChipOther: {
    borderStyle: 'dashed',
  },
  preferenceText: {
    fontSize: 14,
  },
  preferenceTextSelected: {
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
