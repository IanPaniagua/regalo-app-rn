import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
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
  const refreshConnections = async () => {
    if (!user?.id) {
      setConnections([]);
      setConnectedUsers([]);
      setPendingInvitations([]);
      return;
    }

    try {
      setLoading(true);

      // Cargar todas las conexiones del usuario
      const userConnections = await db.getAdapter().getConnectionsByUser(user.id);
      setConnections(userConnections);

      // Cargar usuarios conectados (solo aceptados)
      const connected = await db.getAdapter().getConnectedUsers(user.id);
      setConnectedUsers(connected);

      // Cargar invitaciones pendientes
      const pending = await db.getAdapter().getPendingInvitations(user.id);
      setPendingInvitations(pending);

      // Cargar detalles de usuarios que enviaron invitaciones
      const pendingWithDetails = await Promise.all(
        pending.map(async (invitation) => {
          const fromUser = await db.getAdapter().getUser(invitation.userId1);
          return { ...invitation, fromUser: fromUser || undefined };
        })
      );
      setPendingInvitationsWithDetails(pendingWithDetails);

      // Cargar conexiones aceptadas no vistas
      const accepted = await db.getAdapter().getAcceptedConnections(user.id);
      setAcceptedConnections(accepted);

      // Cargar detalles del otro usuario en conexiones aceptadas
      const acceptedWithDetails = await Promise.all(
        accepted.map(async (connection) => {
          // Determinar quién es el "otro" usuario
          const otherUserId = connection.userId1 === user.id ? connection.userId2 : connection.userId1;
          const otherUser = await db.getAdapter().getUser(otherUserId);
          return { ...connection, otherUser: otherUser || undefined };
        })
      );
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
  };

  // Cargar conexiones al montar o cuando cambie el usuario
  useEffect(() => {
    refreshConnections();
  }, [user?.id]);

  // Crear invitación
  const createInvitation = async (): Promise<string> => {
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
  };

  // Enviar invitación por username
  const sendInvitationByUsername = async (username: string): Promise<void> => {
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
  };

  // Compartir link de invitación
  const shareInvitationLink = async (link: string): Promise<void> => {
    try {
      await Share.share({
        message: `¡Únete a mi red de cumpleaños! 🎉\n\n${link}`,
        title: 'Invitación a conectar',
      });
    } catch (error) {
      console.error('❌ Error sharing invitation:', error);
      throw error;
    }
  };

  // Aceptar invitación
  const acceptInvitation = async (connectionId: string): Promise<void> => {
    try {
      await db.getAdapter().updateConnectionStatus(connectionId, 'accepted');
      console.log('✅ Invitation accepted:', connectionId);
      await refreshConnections();
    } catch (error) {
      console.error('❌ Error accepting invitation:', error);
      throw error;
    }
  };

  // Rechazar invitación
  const rejectInvitation = async (connectionId: string): Promise<void> => {
    try {
      await db.getAdapter().updateConnectionStatus(connectionId, 'rejected');
      console.log('✅ Invitation rejected:', connectionId);
      await refreshConnections();
    } catch (error) {
      console.error('❌ Error rejecting invitation:', error);
      throw error;
    }
  };

  // Desconectar usuario
  const disconnectUser = async (connectionId: string): Promise<void> => {
    try {
      await db.getAdapter().deleteConnection(connectionId);
      console.log('✅ User disconnected:', connectionId);
      await refreshConnections();
    } catch (error) {
      console.error('❌ Error disconnecting user:', error);
      throw error;
    }
  };

  // Marcar notificación como vista
  const markAsViewed = async (connectionId: string): Promise<void> => {
    if (!user?.id) return;

    try {
      await db.getAdapter().markConnectionAsViewed(connectionId, user.id);
      console.log('✅ Notification marked as viewed:', connectionId);
      await refreshConnections();
    } catch (error) {
      console.error('❌ Error marking as viewed:', error);
      throw error;
    }
  };

  return (
    <ConnectionsContext.Provider
      value={{
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
      }}
    >
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
