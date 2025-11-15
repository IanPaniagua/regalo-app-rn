import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, Modal, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AppContainer } from '@/src/components/ui/AppContainer';
import { AppTitle } from '@/src/components/ui/AppTitle';
import { AppText } from '@/src/components/ui/AppText';
import { AppButton } from '@/src/components/ui/AppButton';
import { useConnections } from '@/src/context/ConnectionsContext';
import { useUser } from '@/src/context/UserContext';
import { useBirthdays } from '@/src/context/BirthdaysContext';
import { colors } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import type { User } from '@/src/database/types';

export default function ConnectTabScreen() {
  const { user } = useUser();
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
      Alert.alert('Error', 'Por favor ingresa un email');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    try {
      setSendingInvitation(true);
      await sendInvitationByEmail(email);
      setEmail('');
      Alert.alert('¡Enviado!', 'Invitación enviada correctamente');
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      Alert.alert('Error', error.message || 'No se pudo enviar la invitación');
    } finally {
      setSendingInvitation(false);
    }
  };

  const handleAcceptInvitation = async (connectionId: string, userName: string) => {
    try {
      await acceptInvitation(connectionId);
      // Refrescar cumpleaños para que aparezcan en el calendario
      await refreshBirthdays();
      Alert.alert('¡Conectado!', `Ahora estás conectado con ${userName}. Sus cumpleaños aparecerán en tu calendario.`);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      Alert.alert('Error', 'No se pudo aceptar la invitación');
    }
  };

  const handleRejectInvitation = async (connectionId: string) => {
    try {
      await rejectInvitation(connectionId);
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      Alert.alert('Error', 'No se pudo rechazar la invitación');
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
      'Desconectar',
      `¿Estás seguro de que quieres desconectar de ${selectedUser.name}? Ya no verás sus cumpleaños en tu calendario.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desconectar',
          style: 'destructive',
          onPress: async () => {
            try {
              // Buscar el connectionId
              const connection = connections.find(
                c => (c.userId1 === selectedUser.id || c.userId2 === selectedUser.id) && c.status === 'accepted'
              );
              if (connection) {
                await disconnectUser(connection.id);
                handleCloseModal();
                Alert.alert('Desconectado', `Ya no estás conectado con ${selectedUser.name}`);
              }
            } catch (error) {
              console.error('Error disconnecting:', error);
              Alert.alert('Error', 'No se pudo desconectar');
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
          <AppTitle style={styles.emptyTitle}>Inicia sesión</AppTitle>
          <AppText style={styles.emptyText}>
            Inicia sesión para conectar con amigos
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
          <AppTitle>Conectar</AppTitle>
          <AppText style={styles.subtitle}>
            Conecta con amigos para ver sus cumpleaños
          </AppText>
        </View>

        {/* Formulario de invitación por email */}
        <View style={styles.inviteForm}>
          <AppText style={styles.formLabel}>Invitar por email</AppText>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="email@ejemplo.com"
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
            title={sendingInvitation ? 'Enviando...' : 'Enviar Invitación'}
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
              Mis Conexiones ({connectedUsers.length})
            </AppText>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
            onPress={() => setActiveTab('pending')}
          >
            <AppText style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
              Pendientes
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
                      No tienes conexiones todavía
                    </AppText>
                    <AppText style={styles.emptyStateSubtext}>
                      Envía una invitación para conectar con amigos
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
                        style={styles.userCard}
                        onPress={() => handleUserPress(user)}
                      >
                        <View style={styles.userInfo}>
                          <AppText style={styles.userAvatar}>{user.avatar}</AppText>
                          <View style={styles.userDetails}>
                            <View style={styles.userNameRow}>
                              <AppText style={styles.userName}>{user.name}</AppText>
                              {isNew && (
                                <View style={styles.newTag}>
                                  <AppText style={styles.newTagText}>NEW</AppText>
                                </View>
                              )}
                            </View>
                            <AppText style={styles.userBirthday}>🎂 {birthday}</AppText>
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
                      No tienes invitaciones pendientes
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
                          <AppText style={styles.actionButtonText}>Aceptar</AppText>
                        </Pressable>
                        <Pressable
                          style={[styles.actionButton, styles.rejectButton]}
                          onPress={() => handleRejectInvitation(invitation.id)}
                        >
                          <Ionicons name="close" size={20} color={colors.white} />
                          <AppText style={styles.actionButtonText}>Rechazar</AppText>
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
              <AppTitle style={styles.modalTitle}>Información</AppTitle>
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
                    <AppText style={styles.infoLabel}>Cumpleaños</AppText>
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
                      <AppText style={styles.infoLabel}>Intereses</AppText>
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
                    title="Desconectar"
                    onPress={handleDisconnect}
                    style={styles.disconnectButtonModal}
                  />
                  <AppText style={styles.disconnectWarning}>
                    Si te desconectas, ya no verás los cumpleaños de {selectedUser.name} en tu calendario
                  </AppText>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
    color: '#999',
    marginTop: 4,
  },
  inviteForm: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    color: colors.white,
  },
  inputContainer: {
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#1C1C1C',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.white,
    borderWidth: 1,
    borderColor: '#3A3A3A',
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
    color: '#999',
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.primary,
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
    color: '#999',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  userCard: {
    backgroundColor: '#2A2A2A',
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
    color: '#999',
  },
  disconnectButton: {
    padding: 4,
  },
  invitationCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  },
  invitationEmail: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },
  invitationDate: {
    fontSize: 12,
    color: '#666',
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
    backgroundColor: '#1C1C1C',
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
    color: '#999',
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
    color: '#CCC',
    marginLeft: 28,
  },
  hobbiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 28,
    marginTop: 8,
  },
  hobbyTag: {
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  hobbyText: {
    fontSize: 14,
    color: colors.white,
  },
  disconnectSection: {
    marginTop: 12,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  disconnectButtonModal: {
    backgroundColor: '#FF3B30',
    marginBottom: 12,
  },
  disconnectWarning: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
});
