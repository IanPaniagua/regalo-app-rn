import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Modal, Pressable, ScrollView, useColorScheme, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, lightTheme, darkTheme, fonts } from '@/src/theme';
import { db } from '@/src/database';
import { useLanguage } from '@/src/context/LanguageContext';

interface BirthdayNotificationModalProps {
  visible: boolean;
  onClose: () => void;
  userId?: string; // ID del usuario que cumple años (si viene de notificación individual)
}

interface BirthdayUser {
  id: string;
  name: string;
  avatar: string;
  age: number;
}

export function BirthdayNotificationModal({
  visible,
  onClose,
  userId,
}: BirthdayNotificationModalProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const { t } = useLanguage();
  const [birthdayUsers, setBirthdayUsers] = useState<BirthdayUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadBirthdayUsers();
    }
  }, [visible, userId]);

  const loadBirthdayUsers = async () => {
    try {
      setLoading(true);

      if (userId) {
        // Cargar usuario específico
        const user = await db.getAdapter().getUser(userId);
        if (user) {
          const age = calculateAge(user.birthdate);
          setBirthdayUsers([{
            id: user.id,
            name: user.name,
            avatar: user.avatar || '👤',
            age,
          }]);
        }
      } else {
        // Cargar todos los cumpleaños de hoy
        const today = new Date();
        const todayMonth = today.getMonth();
        const todayDay = today.getDate();

        // Obtener todos los usuarios (en una app real, deberías filtrar solo conexiones)
        const allUsers = await db.getAdapter().getAllUsers();
        
        const todayBirthdays = allUsers
          .filter(user => {
            if (!user.birthdate) return false;
            const birthdate = user.birthdate;
            return birthdate.getMonth() === todayMonth && birthdate.getDate() === todayDay;
          })
          .map(user => ({
            id: user.id,
            name: user.name,
            avatar: user.avatar || '👤',
            age: calculateAge(user.birthdate),
          }));

        setBirthdayUsers(todayBirthdays);
      }
    } catch (error) {
      console.error('❌ Error loading birthday users:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthdate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthdate.getFullYear();
    const monthDiff = today.getMonth() - birthdate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.modalContent, { backgroundColor: theme.cardBg }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: `${theme.primary}20` }]}>
            <View style={styles.headerIcon}>
              <Ionicons name="gift" size={28} color={theme.primary} />
            </View>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              🎉 {birthdayUsers.length === 1 ? t('birthday_modal_title_single') : t('birthday_modal_title_multiple')}
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={theme.textMuted} />
            </Pressable>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {loading ? (
              <Text style={[styles.loadingText, { color: theme.textMuted }]}>
                {t('birthday_modal_loading')}
              </Text>
            ) : birthdayUsers.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                {t('birthday_modal_empty')}
              </Text>
            ) : (
              birthdayUsers.map((user) => (
                <View
                  key={user.id}
                  style={[styles.userCard, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
                >
                  <View style={[styles.avatarContainer, { backgroundColor: `${theme.primary}20` }]}>
                    <Text style={styles.avatar}>{user.avatar}</Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: theme.text }]}>
                      {user.name}
                    </Text>
                    <Text style={[styles.userAge, { color: theme.textSecondary }]}>
                      {t('birthday_modal_age_text').replace('{{age}}', user.age.toString())}
                    </Text>
                  </View>
                  <View style={styles.celebrationIcon}>
                    <Ionicons name="balloon" size={32} color={theme.primary} />
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: `${theme.primary}20` }]}>
            <Pressable
              style={[styles.closeButton, { backgroundColor: theme.primary }]}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>{t('birthday_modal_close_button')}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    // borderBottomColor se aplica dinámicamente en el componente
  },
  headerIcon: {
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    fontFamily: fonts.title,
  },
  content: {
    padding: 20,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    paddingVertical: 40,
    fontFamily: fonts.text,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    paddingVertical: 40,
    fontFamily: fonts.text,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    // backgroundColor se aplica dinámicamente en el componente
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatar: {
    fontSize: 32,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: fonts.text,
  },
  userAge: {
    fontSize: 14,
    fontFamily: fonts.text,
  },
  celebrationIcon: {
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    // borderTopColor se aplica dinámicamente en el componente
  },
  closeButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: colors.secondary,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fonts.text,
  },
});
