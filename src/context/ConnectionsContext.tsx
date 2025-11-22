import { createContext, useContext, ReactNode, useState, useEffect, useMemo, useCallback } from 'react';
import { db } from '@/src/database';
import { Connection, ConnectionInvitation, User } from '@/src/database/types';
import { useUser } from './UserContext';
import * as Linking from 'expo-linking';
import { Share } from 'react-native';

interface ConnectionsContextType {
  connections: Connection[];
  connectedUsers: User[];
  pendingInvitations: Connection[];
  pendingInvitationsWithDetails: Array<Connection & { fromUser?: User }>;
  acceptedConnections: Connection[];
  acceptedConnectionsWithDetails: Array<Connection & { otherUser?: User }>;
  notificationCount: number; // Total de notificaciones (pendientes + aceptadas no vistas)
  loading: boolean;
  createInvitation: () => Promise<string>; // Retorna el link
  sendInvitationByUsername: (username: string) => Promise<void>; // Enviar por username
  acceptInvitation: (connectionId: string) => Promise<void>;
  rejectInvitation: (connectionId: string) => Promise<void>;
  disconnectUser: (connectionId: string) => Promise<void>;
  markAsViewed: (connectionId: string) => Promise<void>; // Marcar notificación como vista
  refreshConnections: () => Promise<void>;
  shareInvitationLink: (link: string) => Promise<void>;
}

const ConnectionsContext = createContext<ConnectionsContextType | undefined>(undefined);

export function ConnectionsProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<Connection[]>([]);
  const [pendingInvitationsWithDetails, setPendingInvitationsWithDetails] = useState<Array<Connection & { fromUser?: User }>>([]);
  const [acceptedConnections, setAcceptedConnections] = useState<Connection[]>([]);
  const [acceptedConnectionsWithDetails, setAcceptedConnectionsWithDetails] = useState<Array<Connection & { otherUser?: User }>>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Cargar conexiones del usuario
  // ✅ Memoizado para evitar recrear la función en cada render
  const refreshConnections = useCallback(async () => {
    if (!user?.id) {
      setConnections([]);
      setConnectedUsers([]);
      setPendingInvitations([]);
      return;
    }

    try {
      setLoading(true);

      // Cargar todas las conexiones del usuario
      console.log('🔄 Loading connections for user:', user.id);
      const userConnections = await db.getAdapter().getConnectionsByUser(user.id);
      console.log('✅ Raw connections loaded:', userConnections.length);
      setConnections(userConnections);

      // Cargar usuarios conectados (solo aceptados)
      const connected = await db.getAdapter().getConnectedUsers(user.id);
      setConnectedUsers(connected);

      // Cargar invitaciones pendientes
      const pending = await db.getAdapter().getPendingInvitations(user.id);
      setPendingInvitations(pending);

      // ✅ OPTIMIZACIÓN: Cargar detalles de usuarios en batch (evita N+1 queries)
      const pendingUserIds = pending.map(inv => inv.userId1);
      const pendingUsers = await db.getAdapter().getUsersByIds(pendingUserIds);
      const pendingUsersMap = new Map<string, User>(pendingUsers.map((u: User) => [u.id, u]));

      const pendingWithDetails = pending.map(invitation => ({
        ...invitation,
        fromUser: pendingUsersMap.get(invitation.userId1),
      }));
      setPendingInvitationsWithDetails(pendingWithDetails);

      // Cargar conexiones aceptadas no vistas
      const accepted = await db.getAdapter().getAcceptedConnections(user.id);
      setAcceptedConnections(accepted);

      // ✅ OPTIMIZACIÓN: Cargar detalles del otro usuario en batch (evita N+1 queries)
      const acceptedUserIds = accepted.map(conn =>
        conn.userId1 === user.id ? conn.userId2 : conn.userId1
      );
      const acceptedUsers = await db.getAdapter().getUsersByIds(acceptedUserIds);
      const acceptedUsersMap = new Map<string, User>(acceptedUsers.map((u: User) => [u.id, u]));

      const acceptedWithDetails = accepted.map(connection => {
        const otherUserId = connection.userId1 === user.id ? connection.userId2 : connection.userId1;
        return {
          ...connection,
          otherUser: acceptedUsersMap.get(otherUserId),
        };
      });
      setAcceptedConnectionsWithDetails(acceptedWithDetails);

      // Calcular contador de notificaciones
      const totalNotifications = pending.length + accepted.length;
      setNotificationCount(totalNotifications);

      console.log('✅ Connections loaded:', {
        total: userConnections.length,
        connected: connected.length,
        pending: pending.length,
        accepted: accepted.length,
        notifications: totalNotifications,
      });
    } catch (error) {
      console.error('❌ Error loading connections:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Cargar conexiones al montar o cuando cambie el usuario
  useEffect(() => {
    refreshConnections();
  }, [user?.id]);

  // Crear invitación
  // ✅ Memoizado para evitar recrear la función en cada render
  const createInvitation = useCallback(async (): Promise<string> => {
    if (!user?.id) {
      throw new Error('Usuario no autenticado');
    }

    try {
      // Crear invitación que expira en 14 días
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 14);

      const invitation = await db.getAdapter().createConnectionInvitation({
        fromUserId: user.id,
        fromUserName: user.name,
        fromUserAvatar: user.avatar,
        expiresAt,
        used: false,
      });

      // Crear deep link
      const link = Linking.createURL(`invite/${invitation.id}`);
      console.log('✅ Invitation created:', link);

      return link;
    } catch (error) {
      console.error('❌ Error creating invitation:', error);
      throw error;
    }
  }, [user?.id, user?.name, user?.avatar]);

  // Enviar invitación por username
  // ✅ Memoizado para evitar recrear la función en cada render
  const sendInvitationByUsername = useCallback(async (username: string): Promise<void> => {
    if (!user?.id) {
      throw new Error('Usuario no autenticado');
    }

    try {
      await db.getAdapter().sendConnectionRequestByUsername(user.id, username);
      console.log('✅ Invitation sent to:', username);
      await refreshConnections();
    } catch (error) {
      console.error('❌ Error sending invitation:', error);
      throw error;
    }
  }, [user?.id, refreshConnections]);

  // Compartir link de invitación
  // ✅ Memoizado para evitar recrear la función en cada render
  const shareInvitationLink = useCallback(async (link: string): Promise<void> => {
    try {
      await Share.share({
        message: `¡Únete a mi red de cumpleaños! 🎉\n\n${link}`,
        title: 'Invitación a conectar',
      });
    } catch (error) {
      console.error('❌ Error sharing invitation:', error);
      throw error;
    }
  }, []);

  // Aceptar invitación
  // ✅ Memoizado para evitar recrear la función en cada render
  const acceptInvitation = useCallback(async (connectionId: string): Promise<void> => {
    try {
      await db.getAdapter().updateConnectionStatus(connectionId, 'accepted');
      console.log('✅ Invitation accepted:', connectionId);
      await refreshConnections();
    } catch (error) {
      console.error('❌ Error accepting invitation:', error);
      throw error;
    }
  }, [refreshConnections]);

  // Rechazar invitación
  // ✅ Memoizado para evitar recrear la función en cada render
  const rejectInvitation = useCallback(async (connectionId: string): Promise<void> => {
    try {
      await db.getAdapter().updateConnectionStatus(connectionId, 'rejected');
      console.log('✅ Invitation rejected:', connectionId);
      await refreshConnections();
    } catch (error) {
      console.error('❌ Error rejecting invitation:', error);
      throw error;
    }
  }, [refreshConnections]);

  // Desconectar usuario
  // ✅ Memoizado para evitar recrear la función en cada render
  const disconnectUser = useCallback(async (connectionId: string): Promise<void> => {
    try {
      await db.getAdapter().deleteConnection(connectionId);
      console.log('✅ User disconnected:', connectionId);
      await refreshConnections();
    } catch (error) {
      console.error('❌ Error disconnecting user:', error);
      throw error;
    }
  }, [refreshConnections]);

  // Marcar notificación como vista
  // ✅ Memoizado para evitar recrear la función en cada render
  const markAsViewed = useCallback(async (connectionId: string): Promise<void> => {
    if (!user?.id) return;

    try {
      await db.getAdapter().markConnectionAsViewed(connectionId, user.id);
      console.log('✅ Notification marked as viewed:', connectionId);
      await refreshConnections();
    } catch (error) {
      console.error('❌ Error marking as viewed:', error);
      throw error;
    }
  }, [user?.id, refreshConnections]);

  // ✅ Memoizar el value del contexto para evitar re-renders innecesarios
  const contextValue = useMemo(
    () => ({
      connections,
      connectedUsers,
      pendingInvitations,
      pendingInvitationsWithDetails,
      acceptedConnections,
      acceptedConnectionsWithDetails,
      notificationCount,
      loading,
      createInvitation,
      sendInvitationByUsername,
      acceptInvitation,
      rejectInvitation,
      disconnectUser,
      markAsViewed,
      refreshConnections,
      shareInvitationLink,
    }),
    [
      connections,
      connectedUsers,
      pendingInvitations,
      pendingInvitationsWithDetails,
      acceptedConnections,
      acceptedConnectionsWithDetails,
      notificationCount,
      loading,
      createInvitation,
      sendInvitationByUsername,
      acceptInvitation,
      rejectInvitation,
      disconnectUser,
      markAsViewed,
      refreshConnections,
      shareInvitationLink,
    ]
  );

  return (
    <ConnectionsContext.Provider value={contextValue}>
      {children}
    </ConnectionsContext.Provider>
  );
}

export function useConnections() {
  const context = useContext(ConnectionsContext);
  if (context === undefined) {
    throw new Error('useConnections must be used within a ConnectionsProvider');
  }
  return context;
}
