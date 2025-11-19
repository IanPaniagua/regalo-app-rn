import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, Modal, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AppContainer } from '@/src/components/ui/AppContainer';
import { AppTitle } from '@/src/components/ui/AppTitle';
import { AppText } from '@/src/components/ui/AppText';
import { AppButton } from '@/src/components/ui/AppButton';
import { CelebrationModal } from '@/src/components/CelebrationModal';
import { useConnections } from '@/src/context/ConnectionsContext';
import { useUser } from '@/src/context/UserContext';
import { useBirthdays } from '@/src/context/BirthdaysContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { colors } from '@/src/theme';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import type { User } from '@/src/database/types';

export default function ConnectTabScreen() {
  const { user } = useUser();
  const { t } = useLanguage();
  const { theme } = useAppTheme();
  const { refreshUsers: refreshBirthdays } = useBirthdays();
  const {
    connections,
    connectedUsers,
    pendingInvitationsWithDetails,
    acceptedConnectionsWithDetails,
    loading,
    sendInvitationByEmail,
    acceptInvitation,
    rejectInvitation,
    disconnectUser,
    markAsViewed,
    refreshConnections,
  } = useConnections();

  const [email, setEmail] = useState('');
  const [sendingInvitation, setSendingInvitation] = useState(false);
  const [activeTab, setActiveTab] = useState<'connections' | 'pending'>('connections');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationUserName, setCelebrationUserName] = useState('');
  const hasViewedRef = useRef(false);

  // Marcar conexiones aceptadas como vistas cuando el usuario SALE de la screen
  useFocusEffect(
    useCallback(() => {
      // Cuando la screen gana focus, resetear el flag
      hasViewedRef.current = false;

      return () => {
        // Cuando la screen pierde focus (usuario sale), marcar como visto
        if (!hasViewedRef.current && acceptedConnectionsWithDetails.length > 0) {
          hasViewedRef.current = true;
          acceptedConnectionsWithDetails.forEach(async (connection) => {
            await markAsViewed(connection.id);
          });
          console.log('✅ Marked accepted connections as viewed on screen blur');
        }
      };
    }, [acceptedConnectionsWithDetails, markAsViewed])
  );

  // Helper para saber si una conexión es nueva (aceptada recientemente y no vista)
  const isNewConnection = (userId: string): boolean => {
    return acceptedConnectionsWithDetails.some(
      conn => (conn.userId1 === userId || conn.userId2 === userId)
    );
  };

  // Manejar pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshConnections();
      await refreshBirthdays();
      console.log('✅ Connections and birthdays refreshed');
    } catch (error) {
      console.error('❌ Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSendInvitation = async () => {
    if (!email.trim()) {
      Alert.alert(t('create_profile_error_title'), t('create_profile_error_email_required'));
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert(t('create_profile_error_title'), t('create_profile_error_email_invalid'));
      return;
    }

    try {
      setSendingInvitation(true);
      await sendInvitationByEmail(email);
      setEmail('');
      Alert.alert(t('invite_connected_title'), t('invite_connected_message').replace('{{name}}', email));
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      Alert.alert(t('create_profile_error_title'), error.message || t('connect_accept_invitation_error_message'));
    } finally {
      setSendingInvitation(false);
    }
  };

  const handleAcceptInvitation = async (connectionId: string, userName: string) => {
    try {
      await acceptInvitation(connectionId);
      // Refrescar cumpleaños para que aparezcan en el calendario
      await refreshBirthdays();
      // Mostrar modal de celebración
      setCelebrationUserName(userName);
      setShowCelebration(true);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      Alert.alert(t('connect_accept_invitation_error_title'), t('connect_accept_invitation_error_message'));
    }
  };

  const handleRejectInvitation = async (connectionId: string) => {
    try {
      await rejectInvitation(connectionId);
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      Alert.alert(t('connect_reject_invitation_error_title'), t('connect_reject_invitation_error_message'));
    }
  };

  const handleUserPress = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleCloseModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  const handleDisconnect = async () => {
    if (!selectedUser) return;

    Alert.alert(
      t('connect_disconnect_title'),
      t('connect_disconnect_message').replace('{{name}}', selectedUser.name),
      [
        { text: t('connect_disconnect_cancel'), style: 'cancel' },
        {
          text: t('connect_disconnect_confirm'),
          // estilo neutro para que el botón no sea tan llamativo
          onPress: async () => {
            try {
              // Buscar el connectionId
              const connection = connections.find(
                c => (c.userId1 === selectedUser.id || c.userId2 === selectedUser.id) && c.status === 'accepted'
              );
              if (connection) {
                await disconnectUser(connection.id);
                handleCloseModal();
                Alert.alert(t('connect_disconnect_confirm'), t('connect_disconnect_message').replace('{{name}}', selectedUser.name));
              }
            } catch (error) {
              console.error('Error disconnecting:', error);
              Alert.alert(t('connect_disconnect_error_title'), t('connect_disconnect_error_message'));
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <AppContainer>
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color="#666" />
          <AppTitle style={styles.emptyTitle}>{t('connect_empty_requires_login_title')}</AppTitle>
          <AppText style={styles.emptyText}>
            {t('connect_empty_requires_login_text')}
          </AppText>
        </View>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View style={styles.header}>
          <AppTitle>{t('connect_title')}</AppTitle>
          <AppText style={styles.subtitle}>
            {t('connect_subtitle')}
          </AppText>
        </View>

        {/* Formulario de invitación por email */}
        <View style={[styles.inviteForm, { backgroundColor: theme.surface }]}>
          <AppText style={[styles.formLabel, { color: theme.text }]}>{t('connect_invite_label')}</AppText>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
              placeholder={t('connect_invite_placeholder')}
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!sendingInvitation}
            />
          </View>
          <AppButton
            title={sendingInvitation ? t('connect_invite_button_loading') : t('connect_invite_button')}
            onPress={handleSendInvitation}
            disabled={sendingInvitation || !email.trim()}
            style={styles.sendButton}
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <Pressable
            style={[styles.tab, activeTab === 'connections' && styles.tabActive]}
            onPress={() => setActiveTab('connections')}
          >
            <AppText style={[styles.tabText, activeTab === 'connections' && styles.tabTextActive]}>
              {t('connect_tab_connections').replace('{{count}}', connectedUsers.length.toString())}
            </AppText>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
            onPress={() => setActiveTab('pending')}
          >
            <AppText style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
              {t('connect_tab_pending')}
            </AppText>
            {pendingInvitationsWithDetails.length > 0 && (
              <View style={styles.badge}>
                <AppText style={styles.badgeText}>{pendingInvitationsWithDetails.length}</AppText>
              </View>
            )}
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            {/* Tab: Mis Conexiones */}
            {activeTab === 'connections' && (
              <View style={styles.content}>
                {connectedUsers.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="people-outline" size={48} color="#666" />
                    <AppText style={styles.emptyStateText}>
                      {t('connect_empty_connections_title')}
                    </AppText>
                    <AppText style={styles.emptyStateSubtext}>
                      {t('connect_empty_connections_subtitle')}
                    </AppText>
                  </View>
                ) : (
                  connectedUsers.map((user) => {
                    const birthday = user.birthdate.toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                    });
                    const isNew = isNewConnection(user.id);

                    return (
                      <Pressable 
                        key={user.id} 
                        style={[styles.userCard, { backgroundColor: theme.surface }]}
                        onPress={() => handleUserPress(user)}
                      >
                        <View style={styles.userInfo}>
                          <AppText style={styles.userAvatar}>{user.avatar}</AppText>
                          <View style={styles.userDetails}>
                            <View style={styles.userNameRow}>
                              <AppText style={[styles.userName, { color: theme.text }]}>{user.name}</AppText>
                              {isNew && (
                                <View style={styles.newTag}>
                                  <AppText style={styles.newTagText}>NEW</AppText>
                                </View>
                              )}
                            </View>
                            <AppText style={[styles.userBirthday, { color: theme.textMuted }]}>🎂 {birthday}</AppText>
                          </View>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#666" />
                      </Pressable>
                    );
                  })
                )}
              </View>
            )}

            {/* Tab: Invitaciones Pendientes */}
            {activeTab === 'pending' && (
              <View style={styles.content}>
                {pendingInvitationsWithDetails.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="mail-outline" size={48} color="#666" />
                    <AppText style={styles.emptyStateText}>
                      {t('connect_empty_pending_title')}
                    </AppText>
                  </View>
                ) : (
                  pendingInvitationsWithDetails.map((invitation) => (
                    <View key={invitation.id} style={styles.invitationCard}>
                      <View style={styles.invitationHeader}>
                        <AppText style={styles.invitationAvatar}>
                          {invitation.fromUser?.avatar || '👤'}
                        </AppText>
                        <View style={styles.invitationInfo}>
                          <AppText style={styles.invitationText}>
                            {invitation.fromUser?.name || 'Usuario'}
                          </AppText>
                          <AppText style={styles.invitationEmail}>
                            {invitation.fromUser?.email || ''}
                          </AppText>
                          <AppText style={styles.invitationDate}>
                            {invitation.createdAt.toLocaleDateString('es-ES')}
                          </AppText>
                        </View>
                      </View>
                      <View style={styles.invitationActions}>
                        <Pressable
                          style={[styles.actionButton, styles.acceptButton]}
                          onPress={() => handleAcceptInvitation(invitation.id, invitation.fromUser?.name || 'usuario')}
                        >
                          <Ionicons name="checkmark" size={20} color={colors.white} />
                          <AppText style={styles.actionButtonText}>{t('invite_accept')}</AppText>
                        </Pressable>
                        <Pressable
                          style={[styles.actionButton, styles.rejectButton]}
                          onPress={() => handleRejectInvitation(invitation.id)}
                        >
                          <Ionicons name="close" size={20} color={colors.white} />
                          <AppText style={styles.actionButtonText}>{t('invite_reject')}</AppText>
                        </Pressable>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

          </>
        )}
      </ScrollView>

      {/* Modal de Información del Usuario */}
      <Modal
        visible={showUserModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppTitle style={styles.modalTitle}>{t('calendar_profile_modal_title')}</AppTitle>
              <Pressable onPress={handleCloseModal} style={styles.closeButton}>
                <Ionicons name="close" size={28} color={colors.white} />
              </Pressable>
            </View>

            {selectedUser && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.userProfileSection}>
                  <AppText style={styles.modalAvatar}>{selectedUser.avatar}</AppText>
                  <AppText style={styles.modalUserName}>{selectedUser.name}</AppText>
                  <AppText style={styles.modalUserEmail}>{selectedUser.email}</AppText>
                </View>

                <View style={styles.infoSection}>
                  <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                    <AppText style={styles.infoLabel}>{t('calendar_profile_birthdate_label')}</AppText>
                  </View>
                  <AppText style={styles.infoValue}>
                    {selectedUser.birthdate.toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </AppText>
                </View>

                {selectedUser.hobbies && selectedUser.hobbies.length > 0 && (
                  <View style={styles.infoSection}>
                    <View style={styles.infoRow}>
                      <Ionicons name="heart-outline" size={20} color={colors.primary} />
                      <AppText style={styles.infoLabel}>{t('calendar_profile_hobbies_label')}</AppText>
                    </View>
                    <View style={styles.hobbiesContainer}>
                      {selectedUser.hobbies.map((hobby, index) => (
                        <View key={index} style={styles.hobbyTag}>
                          <AppText style={styles.hobbyText}>{hobby}</AppText>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                <View style={styles.disconnectSection}>
                  <AppButton
                    title={t('connect_disconnect_confirm')}
                    variant="secondary"
                    onPress={handleDisconnect}
                    style={styles.disconnectButtonModal}
                  />
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de celebración con confetti */}
      <CelebrationModal
        visible={showCelebration}
        title={t('connect_accept_invitation_success_title')}
        message={t('connect_accept_invitation_success_message').replace('{{name}}', celebrationUserName)}
        buttonText={t('invite_connected_button')}
        onButtonPress={() => setShowCelebration(false)}
      />
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  header: {
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  inviteForm: {
    backgroundColor: '#F6FAFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    color: '#0F172A',
  },
  inputContainer: {
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#C2D4F2',
  },
  sendButton: {
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: '#64748B',
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
  },
  userCard: {
    backgroundColor: '#F6FAFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  newTag: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  newTagText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  userBirthday: {
    fontSize: 14,
    color: '#64748B',
  },
  disconnectButton: {
    padding: 4,
  },
  invitationCard: {
    backgroundColor: '#E6F0FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  invitationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  invitationAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  invitationInfo: {
    flex: 1,
  },
  invitationText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    color: '#2C5F2D',
  },
  invitationEmail: {
    fontSize: 13,
    color: '#2C5F2D',
    marginBottom: 4,
  },
  invitationDate: {
    fontSize: 12,
    color: '#2C5F2D',
  },
  invitationActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  acceptButton: {
    backgroundColor: colors.primary,
  },
  rejectButton: {
    backgroundColor: '#666',
  },
  actionButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#F6FAFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
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
    fontSize: 20,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  userProfileSection: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    marginBottom: 20,
  },
  modalAvatar: {
    fontSize: 64,
    marginBottom: 12,
  },
  modalUserName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  modalUserEmail: {
    fontSize: 14,
    color: '#64748B',
  },
  infoSection: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoValue: {
    fontSize: 15,
    color: '#334155',
    marginLeft: 28,
  },
  hobbiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 28,
    marginTop: 8,
  },
  hobbyTag: {
    backgroundColor: '#F6FAFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  hobbyText: {
    fontSize: 14,
    color: '#0F172A',
  },
  disconnectSection: {
    marginTop: 12,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  disconnectButtonModal: {
    marginBottom: 12,
  },
  disconnectWarning: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
});
