import React from 'react';
import { View, StyleSheet, Modal, Pressable, ScrollView, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/src/components/ui/AppText';
import { AppButton } from '@/src/components/ui/AppButton';
import { colors } from '@/src/theme';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { useLanguage } from '@/src/context/LanguageContext';
import type { User } from '@/src/database/types';
import type { BirthdayUser } from '@/src/context/BirthdaysContext';

const BgLight = require('@/assets/images/bg-light.png');
const BgDark = require('@/assets/images/bg-dark.png');

interface UserProfileModalProps {
  visible: boolean;
  user: User | BirthdayUser | null;
  onClose: () => void;
  onDisconnect?: () => void;
  showDisconnect?: boolean;
}

export function UserProfileModal({ 
  visible, 
  user, 
  onClose, 
  onDisconnect,
  showDisconnect = false 
}: UserProfileModalProps) {
  const { theme, themeMode } = useAppTheme();
  const { t } = useLanguage();
  const backgroundImage = themeMode === 'dark' ? BgDark : BgLight;

  if (!user) return null;

  const calculateAge = (birthdate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthdate.getFullYear();
    const monthDiff = today.getMonth() - birthdate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(user.birthdate);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <ImageBackground 
          source={backgroundImage} 
          style={styles.modalContent}
          imageStyle={styles.backgroundImage}
        >
          <View style={[styles.contentOverlay, { backgroundColor: theme.overlay }]} />
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: `${theme.border}80` }]}>
            <AppText style={[styles.modalTitle, { color: theme.text }]}>
              {t('calendar_profile_modal_title')}
            </AppText>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={theme.text} />
            </Pressable>
          </View>

          {/* Body */}
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Avatar y nombre */}
            <View style={styles.profileSection}>
              <View style={styles.avatarWrapper}>
                <View style={[styles.avatarCircle, { borderColor: theme.primary }]} />
                <View style={[styles.avatarContainer, { backgroundColor: theme.cardBg }]}>
                  <AppText style={styles.avatar}>{user.avatar}</AppText>
                </View>
              </View>
              <AppText style={[styles.userName, { color: theme.text }]}>{user.name}</AppText>
              {user.email && (
                <AppText style={[styles.userEmail, { color: theme.textSecondary }]}>
                  {user.email}
                </AppText>
              )}
            </View>

            {/* Info Cards */}
            <View style={styles.infoCards}>
              {/* Cumpleaños */}
              <View style={[styles.infoCard, { backgroundColor: theme.cardBg }]}>
                <View style={[styles.iconCircle, { backgroundColor: `${theme.primary}20` }]}>
                  <Ionicons name="calendar" size={24} color={theme.primary} />
                </View>
                <AppText style={[styles.infoLabel, { color: theme.textMuted }]}>
                  {t('calendar_profile_birthdate_label')}
                </AppText>
                <AppText style={[styles.infoValue, { color: theme.text }]}>
                  {user.birthdate.toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </AppText>
              </View>

              {/* Edad */}
              <View style={[styles.infoCard, { backgroundColor: theme.cardBg }]}>
                <View style={[styles.iconCircle, { backgroundColor: `${theme.primary}20` }]}>
                  <Ionicons name="gift" size={24} color={theme.primary} />
                </View>
                <AppText style={[styles.infoLabel, { color: theme.textMuted }]}>
                  {t('calendar_profile_age_label')}
                </AppText>
                <AppText style={[styles.infoValue, { color: theme.text }]}>
                  {age} {t('calendar_day_item_age_suffix')}
                </AppText>
              </View>
            </View>

            {/* Hobbies */}
            {user.hobbies && user.hobbies.length > 0 && (
              <View style={[styles.section, { backgroundColor: theme.cardBg, borderRadius: 16, padding: 16 }]}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="heart" size={20} color={theme.primary} />
                  <AppText style={[styles.sectionTitle, { color: theme.text }]}>
                    {t('calendar_profile_hobbies_label')}
                  </AppText>
                </View>
                <View style={styles.hobbiesContainer}>
                  {user.hobbies.map((hobby, index) => (
                    <View 
                      key={index} 
                      style={[styles.hobbyTag, { 
                        backgroundColor: theme.surface,
                        borderColor: theme.primary,
                      }]}
                    >
                      <AppText style={[styles.hobbyText, { color: theme.text }]}>
                        {hobby}
                      </AppText>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Botón desconectar */}
            {showDisconnect && onDisconnect && (
              <View style={styles.disconnectSection}>
                <AppButton
                  title={t('connect_disconnect_confirm')}
                  variant="secondary"
                  onPress={onDisconnect}
                  style={styles.disconnectButton}
                />
              </View>
            )}
          </ScrollView>
        </ImageBackground>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  backgroundImage: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  contentOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarCircle: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    top: -5,
    left: -5,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    fontSize: 48,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  infoCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  hobbiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  hobbyTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  hobbyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  disconnectSection: {
    marginTop: 8,
    paddingTop: 24,
  },
  disconnectButton: {
    marginBottom: 12,
  },
});
