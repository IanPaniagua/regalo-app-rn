import { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppContainer } from '@/src/components/ui/AppContainer';
import { AppTitle } from '@/src/components/ui/AppTitle';
import { AppText } from '@/src/components/ui/AppText';
import { AppButton } from '@/src/components/ui/AppButton';
import { useUser } from '@/src/context/UserContext';
import { useConnections } from '@/src/context/ConnectionsContext';
import { db } from '@/src/database';
import { ConnectionInvitation } from '@/src/database/types';
import { colors } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';

export default function InviteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useUser();
  const { refreshConnections } = useConnections();

  const [invitation, setInvitation] = useState<ConnectionInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    loadInvitation();
  }, [id]);

  const loadInvitation = async () => {
    if (!id) {
      setError('ID de invitación inválido');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const inv = await db.getAdapter().getConnectionInvitation(id);

      if (!inv) {
        setError('Invitación no encontrada');
        return;
      }

      // Verificar si expiró
      if (new Date() > inv.expiresAt) {
        setError('Esta invitación ha expirado');
        return;
      }

      // Verificar si ya fue usada
      if (inv.used) {
        setError('Esta invitación ya fue usada');
        return;
      }

      setInvitation(inv);
    } catch (error) {
      console.error('Error loading invitation:', error);
      setError('Error al cargar la invitación');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!user) {
      Alert.alert(
        'Inicia sesión',
        'Necesitas iniciar sesión para aceptar esta invitación',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Iniciar sesión',
            onPress: () => router.replace('/login'),
          },
        ]
      );
      return;
    }

    if (!invitation || !user.id) return;

    // Verificar que no sea el mismo usuario
    if (user.id === invitation.fromUserId) {
      Alert.alert('Error', 'No puedes conectar contigo mismo');
      return;
    }

    try {
      setAccepting(true);

      // Crear conexión
      const connection = await db.getAdapter().createConnection(
        invitation.fromUserId,
        user.id
      );

      // Actualizar conexión a aceptada
      await db.getAdapter().updateConnectionStatus(connection.id, 'accepted');

      // La invitación se marca como usada automáticamente al crear la conexión

      // Refrescar conexiones
      await refreshConnections();

      Alert.alert(
        '¡Conectado!',
        `Ahora estás conectado con ${invitation.fromUserName}`,
        [
          {
            text: 'Ver conexiones',
            onPress: () => router.push('/(drawer)/(tabs)/connect' as any),
          },
        ]
      );
    } catch (error) {
      console.error('Error accepting invitation:', error);
      Alert.alert('Error', 'No se pudo aceptar la invitación');
    } finally {
      setAccepting(false);
    }
  };

  const handleReject = () => {
    Alert.alert(
      'Rechazar invitación',
      '¿Estás seguro de que quieres rechazar esta invitación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  };

  if (loading) {
    return (
      <AppContainer>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText style={styles.loadingText}>Cargando invitación...</AppText>
        </View>
      </AppContainer>
    );
  }

  if (error || !invitation) {
    return (
      <AppContainer>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#999" />
          <AppTitle style={styles.errorTitle}>Invitación no válida</AppTitle>
          <AppText style={styles.errorText}>
            {error || 'No se pudo cargar la invitación'}
          </AppText>
          <AppButton
            title="Volver"
            onPress={() => router.back()}
            style={styles.button}
          />
        </View>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <View style={styles.container}>
        <View style={styles.invitationCard}>
          <View style={styles.avatarContainer}>
            <AppText style={styles.avatar}>{invitation.fromUserAvatar}</AppText>
          </View>

          <AppTitle style={styles.title}>Invitación de conexión</AppTitle>

          <AppText style={styles.message}>
            <AppText style={styles.userName}>{invitation.fromUserName}</AppText>
            {' '}quiere conectar contigo
          </AppText>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <AppText style={styles.infoText}>
              Al conectar, podrán ver los cumpleaños del otro en el calendario
            </AppText>
          </View>

          {!user && (
            <View style={styles.warningBox}>
              <Ionicons name="warning-outline" size={20} color="#FFA500" />
              <AppText style={styles.warningText}>
                Necesitas iniciar sesión para aceptar esta invitación
              </AppText>
            </View>
          )}

          <View style={styles.actions}>
            <AppButton
              title={accepting ? 'Aceptando...' : 'Aceptar'}
              onPress={handleAccept}
              disabled={accepting}
              style={styles.acceptButton}
            />
            <AppButton
              title="Rechazar"
              onPress={handleReject}
              style={styles.rejectButton}
              variant="secondary"
            />
          </View>

          <AppText style={styles.expiryText}>
            Esta invitación expira el{' '}
            {invitation.expiresAt.toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </AppText>
        </View>
      </View>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#999',
  },
  errorTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  invitationCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3A3A3A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    fontSize: 48,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#CCC',
  },
  userName: {
    fontWeight: '600',
    color: colors.primary,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#CCC',
    lineHeight: 18,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#FFA500',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#FFA500',
    lineHeight: 18,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  acceptButton: {
    width: '100%',
  },
  rejectButton: {
    width: '100%',
  },
  button: {
    marginTop: 16,
  },
  expiryText: {
    fontSize: 12,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
});
