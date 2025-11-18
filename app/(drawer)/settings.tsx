import { View, StyleSheet, Switch, Pressable, Modal, Alert } from 'react-native';
import { AppContainer } from '@/src/components/ui/AppContainer';
import { AppTitle } from '@/src/components/ui/AppTitle';
import { AppText } from '@/src/components/ui/AppText';
import { useNotifications } from '@/src/context/NotificationsContext';
import { colors } from '@/src/theme';
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

  const handleLanguageSelect = async (selectedLang: Lang) => {
    if (selectedLang === lang) {
      setShowLanguageModal(false);
      return;
    }
    
    setShowLanguageModal(false);
    
    // Show single confirmation alert
    Alert.alert(
      t('settings_language_change_title'),
      t('settings_language_change_message'),
      [
        {
          text: t('settings_language_change_cancel'),
          style: 'cancel',
        },
        {
          text: t('settings_language_change_confirm'),
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
              trackColor={{ false: '#777', true: colors.primary }}
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

          <Pressable style={styles.languageButton} onPress={() => setShowLanguageModal(true)}>
            <View style={styles.languageButtonContent}>
              <Ionicons name="language-outline" size={20} color={colors.primary} />
              <AppText style={styles.languageButtonText}>{getLanguageLabel(lang)}</AppText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </Pressable>

          {pendingLanguage && pendingLanguage !== lang && (
            <View style={styles.restartWarning}>
              <Ionicons name="information-circle" size={16} color={colors.primary} />
              <AppText style={styles.restartWarningText}>
                {t('settings_language_restart_required')}
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
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <AppText style={styles.modalTitle}>{t('settings_language')}</AppText>
                <Pressable onPress={() => setShowLanguageModal(false)}>
                  <Ionicons name="close" size={24} color={colors.white} />
                </Pressable>
              </View>

              <View style={styles.languageOptions}>
                <Pressable
                  style={[styles.languageOption, lang === 'es' && styles.languageOptionActive]}
                  onPress={() => handleLanguageSelect('es')}
                >
                  <AppText style={[styles.languageOptionText, lang === 'es' && styles.languageOptionTextActive]}>
                    {t('language_spanish')}
                  </AppText>
                  {lang === 'es' && <Ionicons name="checkmark" size={24} color={colors.primary} />}
                </Pressable>

                <Pressable
                  style={[styles.languageOption, lang === 'en' && styles.languageOptionActive]}
                  onPress={() => handleLanguageSelect('en')}
                >
                  <AppText style={[styles.languageOptionText, lang === 'en' && styles.languageOptionTextActive]}>
                    {t('language_english')}
                  </AppText>
                  {lang === 'en' && <Ionicons name="checkmark" size={24} color={colors.primary} />}
                </Pressable>

                <Pressable
                  style={[styles.languageOption, lang === 'de' && styles.languageOptionActive]}
                  onPress={() => handleLanguageSelect('de')}
                >
                  <AppText style={[styles.languageOptionText, lang === 'de' && styles.languageOptionTextActive]}>
                    {t('language_german')}
                  </AppText>
                  {lang === 'de' && <Ionicons name="checkmark" size={24} color={colors.primary} />}
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
    fontWeight: '700',
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
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2A2A2A',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#444',
  },
  languageButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  languageButtonText: {
    fontSize: 16,
    color: colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1C1C1C',
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
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
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
    backgroundColor: '#2A2A2A',
  },
  languageOptionActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  languageOptionText: {
    fontSize: 16,
    color: '#ccc',
  },
  languageOptionTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  restartWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  restartWarningText: {
    flex: 1,
    fontSize: 13,
    color: '#CCC',
    lineHeight: 18,
  },
});
