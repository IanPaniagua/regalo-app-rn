import { View, StyleSheet, Switch, Pressable, Modal, Alert } from 'react-native';
import { AppContainer } from '@/src/components/ui/AppContainer';
import { AppTitle } from '@/src/components/ui/AppTitle';
import { AppText } from '@/src/components/ui/AppText';
import { useNotifications } from '@/src/context/NotificationsContext';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { useLanguage, type Lang } from '@/src/context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const {
    notificationsEnabled,
    setNotificationsEnabled,
    isPermissionGranted,
    requestPermissions,
  } = useNotifications();
  const { theme, themeMode, setThemeMode } = useAppTheme();
  const { lang, t, setLanguage } = useLanguage();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState<Lang | null>(null);

  // Check if there's a pending language change
  useEffect(() => {
    const checkPendingLanguage = async () => {
      try {
        const stored = await AsyncStorage.getItem('APP_LANGUAGE');
        if (stored && stored !== lang && (stored === 'es' || stored === 'en' || stored === 'de')) {
          setPendingLanguage(stored as Lang);
        }
      } catch (error) {
        console.error('Error checking pending language:', error);
      }
    };
    checkPendingLanguage();
  }, [lang]);

  const handleToggleNotifications = async (value: boolean) => {
    if (value) {
      // Activar notificaciones: si no hay permiso del SO, pedirlo
      if (!isPermissionGranted) {
        const granted = await requestPermissions();
        if (!granted) {
          // Permiso del sistema denegado: mantenemos el toggle desactivado
          await setNotificationsEnabled(false);
          return;
        }
      }
      await setNotificationsEnabled(true);
    } else {
      // Desactivar notificaciones solo a nivel de app (no cambia ajustes del sistema)
      await setNotificationsEnabled(false);
    }
  };

  const getTranslationInLanguage = (key: string, targetLang: Lang): string => {
    const translations: Record<Lang, Record<string, string>> = {
      es: {
        settings_language_change_title: 'Cambiar idioma',
        settings_language_change_message: '¿Quieres cambiar el idioma de la aplicación? Tendrás que cerrar y volver a abrir la app para aplicar los cambios.',
        settings_language_change_cancel: 'Cancelar',
        settings_language_change_confirm: 'Cambiar',
        settings_language_restart_required: 'Reinicia la app para ver los cambios de idioma',
      },
      en: {
        settings_language_change_title: 'Change language',
        settings_language_change_message: 'Do you want to change the app language? You will need to close and reopen the app to apply the changes.',
        settings_language_change_cancel: 'Cancel',
        settings_language_change_confirm: 'Change',
        settings_language_restart_required: 'Restart the app to see language changes',
      },
      de: {
        settings_language_change_title: 'Sprache ändern',
        settings_language_change_message: 'Möchtest du die App-Sprache ändern? Du musst die App schließen und neu öffnen, um die Änderungen anzuwenden.',
        settings_language_change_cancel: 'Abbrechen',
        settings_language_change_confirm: 'Ändern',
        settings_language_restart_required: 'Starte die App neu, um Sprachänderungen zu sehen',
      },
    };
    return translations[targetLang][key] || key;
  };

  const handleLanguageSelect = async (selectedLang: Lang) => {
    if (selectedLang === lang) {
      setShowLanguageModal(false);
      return;
    }
    
    setShowLanguageModal(false);
    
    // Show confirmation alert in the SELECTED language (not current)
    Alert.alert(
      getTranslationInLanguage('settings_language_change_title', selectedLang),
      getTranslationInLanguage('settings_language_change_message', selectedLang),
      [
        {
          text: getTranslationInLanguage('settings_language_change_cancel', selectedLang),
          style: 'cancel',
        },
        {
          text: getTranslationInLanguage('settings_language_change_confirm', selectedLang),
          onPress: async () => {
            // Save the new language
            await setLanguage(selectedLang);
            // Update pending language state to show UI message
            setPendingLanguage(selectedLang);
          },
        },
      ]
    );
  };

  const getLanguageLabel = (langCode: Lang): string => {
    switch (langCode) {
      case 'es':
        return t('language_spanish');
      case 'en':
        return t('language_english');
      case 'de':
        return t('language_german');
    }
  };

  return (
    <AppContainer>
      <View style={styles.content}>
        <AppTitle>{t('settings_title')}</AppTitle>

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>{t('settings_appearance')}</AppText>

          <Pressable 
            style={[styles.themeButton, { backgroundColor: theme.surface, borderColor: theme.border }]} 
            onPress={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
          >
            <View style={styles.themeButtonContent}>
              <Ionicons 
                name={themeMode === 'dark' ? 'moon' : 'sunny'} 
                size={20} 
                color={theme.primary} 
              />
              <AppText style={styles.themeButtonText}>
                {t('settings_theme')}: {themeMode === 'dark' ? t('settings_theme_dark') : t('settings_theme_light')}
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>{t('settings_notifications')}</AppText>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <AppText style={styles.label}>{t('settings_notifications_toggle')}</AppText>
              <AppText style={styles.helper}>
                {t('settings_notifications_helper')}
              </AppText>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: '#777', true: theme.primary }}
              thumbColor={'#ffffff'}
            />
          </View>

          {!isPermissionGranted && (
            <AppText style={styles.warning}>
              {t('settings_notifications_system_disabled')}
            </AppText>
          )}
        </View>

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>{t('settings_language')}</AppText>

          <Pressable 
            style={[styles.languageButton, { backgroundColor: theme.surface, borderColor: theme.border }]} 
            onPress={() => setShowLanguageModal(true)}
          >
            <View style={styles.languageButtonContent}>
              <Ionicons name="language-outline" size={20} color={theme.primary} />
              <AppText style={styles.languageButtonText}>{getLanguageLabel(lang)}</AppText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
          </Pressable>

          {pendingLanguage && pendingLanguage !== lang && (
            <View style={[styles.restartWarning, { backgroundColor: `${theme.primary}1A`, borderLeftColor: theme.primary }]}>
              <Ionicons name="information-circle" size={16} color={theme.primary} />
              <AppText style={styles.restartWarningText}>
                {getTranslationInLanguage('settings_language_restart_required', pendingLanguage)}
              </AppText>
            </View>
          )}
        </View>

        {/* Language Selection Modal */}
        <Modal
          visible={showLanguageModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLanguageModal(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowLanguageModal(false)}>
            <Pressable 
              style={[styles.modalContent, { backgroundColor: theme.modalBg }]} 
              onPress={(e) => e.stopPropagation()}
            >
              <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
                <AppText style={styles.modalTitle}>{t('settings_language')}</AppText>
                <Pressable onPress={() => setShowLanguageModal(false)}>
                  <Ionicons name="close" size={24} color={theme.text} />
                </Pressable>
              </View>

              <View style={styles.languageOptions}>
                <Pressable
                  style={[
                    styles.languageOption, 
                    { backgroundColor: theme.surface },
                    lang === 'es' && { backgroundColor: `${theme.primary}26`, borderWidth: 1, borderColor: theme.primary }
                  ]}
                  onPress={() => handleLanguageSelect('es')}
                >
                  <AppText style={[
                    styles.languageOptionText,
                    lang === 'es' && { color: theme.primary, fontWeight: '600' }
                  ]}>
                    {t('language_spanish')}
                  </AppText>
                  {lang === 'es' && <Ionicons name="checkmark" size={24} color={theme.primary} />}
                </Pressable>

                <Pressable
                  style={[
                    styles.languageOption,
                    { backgroundColor: theme.surface },
                    lang === 'en' && { backgroundColor: `${theme.primary}26`, borderWidth: 1, borderColor: theme.primary }
                  ]}
                  onPress={() => handleLanguageSelect('en')}
                >
                  <AppText style={[
                    styles.languageOptionText,
                    lang === 'en' && { color: theme.primary, fontWeight: '600' }
                  ]}>
                    {t('language_english')}
                  </AppText>
                  {lang === 'en' && <Ionicons name="checkmark" size={24} color={theme.primary} />}
                </Pressable>

                <Pressable
                  style={[
                    styles.languageOption,
                    { backgroundColor: theme.surface },
                    lang === 'de' && { backgroundColor: `${theme.primary}26`, borderWidth: 1, borderColor: theme.primary }
                  ]}
                  onPress={() => handleLanguageSelect('de')}
                >
                  <AppText style={[
                    styles.languageOptionText,
                    lang === 'de' && { color: theme.primary, fontWeight: '600' }
                  ]}>
                    {t('language_german')}
                  </AppText>
                  {lang === 'de' && <Ionicons name="checkmark" size={24} color={theme.primary} />}
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingVertical: 16,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontWeight: '500',
  },
  helper: {
    marginTop: 4,
    fontSize: 12,
    opacity: 0.8,
  },
  warning: {
    marginTop: 8,
    fontSize: 12,
    color: '#FF3B30',
  },
  themeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  themeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeButtonText: {
    fontSize: 16,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  languageButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  languageButtonText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  languageOptions: {
    padding: 12,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  languageOptionText: {
    fontSize: 16,
  },
  restartWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderLeftWidth: 3,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  restartWarningText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
