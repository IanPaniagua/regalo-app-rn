import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '@/src/database';
import { useUser } from './UserContext';

// Configurar cómo se manejan las notificaciones cuando la app está en foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface NotificationsContextType {
  fcmToken: string | null;
  notification: Notifications.Notification | null;
  requestPermissions: () => Promise<boolean>;
  isPermissionGranted: boolean;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [notificationsEnabled, setNotificationsEnabledState] = useState(true);
  
  const notificationListener = useRef<Notifications.Subscription | undefined>();
  const responseListener = useRef<Notifications.Subscription | undefined>();

  const NOTIFICATIONS_ENABLED_KEY = '@regalo_app_notifications_enabled';

  // Cargar preferencia de notificaciones desde AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
        if (stored !== null) {
          setNotificationsEnabledState(stored === 'true');
        }
      } catch (error) {
        console.error('❌ Error loading notifications preference:', error);
      }
    })();
  }, []);

  // Registrar token cuando el usuario inicia sesión
  useEffect(() => {
    if (user && notificationsEnabled && !fcmToken) {
      registerForPushNotificationsAsync();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, notificationsEnabled]);

  // Guardar token en Firestore cuando se obtiene
  useEffect(() => {
    if (fcmToken && user && notificationsEnabled) {
      saveFCMTokenToFirestore(fcmToken);
    }
  }, [fcmToken, user, notificationsEnabled]);

  // Listeners de notificaciones
  useEffect(() => {
    // Listener cuando llega una notificación
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('📬 Notification received:', notification);
      setNotification(notification);
    });

    // Listener cuando el usuario toca una notificación
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response);
      handleNotificationResponse(response);
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#D4AF37',
      });
    }

    if (Device.isDevice) {
      // Solicitar permisos de FCM (iOS)
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          console.log('❌ FCM Permission not granted');
          setIsPermissionGranted(false);
          return;
        }
      }
      
      // Solicitar permisos de notificaciones locales
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('❌ Permission for notifications not granted');
        setIsPermissionGranted(false);
        return;
      }
      
      setIsPermissionGranted(true);
      
      // Para iOS, necesitamos registrar APNS primero
      if (Platform.OS === 'ios') {
        try {
          await messaging().registerDeviceForRemoteMessages();
          console.log('✅ Device registered for remote messages');
        } catch (error) {
          console.error('❌ Error registering device:', error);
        }
      }
      
      // Obtener token FCM nativo
      try {
        token = await messaging().getToken();
        console.log('✅ FCM Token:', token);
        setFcmToken(token);
        
        // Listener para cuando el token se actualiza
        messaging().onTokenRefresh(async (newToken) => {
          console.log('🔄 FCM Token refreshed:', newToken);
          setFcmToken(newToken);
          if (user) {
            await saveFCMTokenToFirestore(newToken);
          }
        });
      } catch (error) {
        console.error('❌ Error getting FCM token:', error);
        // Si falla FCM, intentar obtener token de Expo como fallback
        console.log('⚠️ Falling back to Expo Push Token...');
      }
      
    } else {
      console.log('⚠️ Must use physical device for Push Notifications');
    }

    return token;
  }

  async function requestPermissions(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    const granted = status === 'granted';
    setIsPermissionGranted(granted);
    
    if (granted) {
      await registerForPushNotificationsAsync();
    }
    
    return granted;
  }

  async function setNotificationsEnabled(enabled: boolean): Promise<void> {
    try {
      setNotificationsEnabledState(enabled);
      await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, enabled ? 'true' : 'false');

      if (!enabled) {
        // Desactivar a nivel de app: limpiar token local y en Firestore
        if (user?.id && fcmToken) {
          try {
            await db.getAdapter().updateUser(user.id, {
              fcmToken: null,
            });
            console.log('ℹ️ Notifications disabled, FCM token cleared from Firestore');
          } catch (error) {
            console.error('❌ Error clearing FCM token when disabling notifications:', error);
          }
        }
        setFcmToken(null);
      } else {
        // Si se vuelven a habilitar y ya hay permisos, registrar de nuevo
        if (user && isPermissionGranted && !fcmToken) {
          await registerForPushNotificationsAsync();
        }
      }
    } catch (error) {
      console.error('❌ Error updating notificationsEnabled:', error);
    }
  }

  async function saveFCMTokenToFirestore(token: string) {
    console.log('💾 Attempting to save FCM token...', { token: token.substring(0, 20) + '...', userId: user?.id });
    
    if (!user?.id) {
      console.log('⚠️  No user ID, skipping token save');
      return;
    }

    // Solo guardar si el token es diferente al actual
    if (user.fcmToken && user.fcmToken === token) {
      console.log('ℹ️  Token unchanged, skipping save');
      return;
    }

    try {
      await db.getAdapter().updateUser(user.id, {
        fcmToken: token,
        fcmTokenUpdatedAt: new Date(),
      });
      console.log('✅ FCM token saved to Firestore successfully');
    } catch (error) {
      console.error('❌ Error saving FCM token:', error);
    }
  }

  function handleNotificationResponse(response: Notifications.NotificationResponse) {
    const data = response.notification.request.content.data;
    
    console.log('📱 Notification data:', data);
    
    // Verificar que data existe antes de acceder a sus propiedades
    if (!data || typeof data !== 'object') {
      console.log('⚠️ No data in notification');
      return;
    }
    
    // Aquí puedes navegar a diferentes pantallas según el tipo de notificación
    if (data.type === 'birthday') {
      // Navegar al perfil del usuario
      console.log(`Navigate to user profile: ${data.userId}`);
      // router.push(`/profile/${data.userId}`);
    } else if (data.type === 'monthly_summary') {
      // Navegar al calendario
      console.log('Navigate to calendar');
      // router.push('/calendar');
    }
  }

  return (
    <NotificationsContext.Provider
      value={{
        fcmToken,
        notification,
        requestPermissions,
        isPermissionGranted,
        notificationsEnabled,
        setNotificationsEnabled,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
