import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
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
      // Pequeño delay para asegurar que Firebase esté completamente inicializado
      const timer = setTimeout(() => {
        registerForPushNotificationsAsync();
      }, 500);
      
      return () => clearTimeout(timer);
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
      // Solicitar permisos de notificaciones
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
      
      // Obtener Expo Push Token (funciona con FCM en iOS y Android)
      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        if (!projectId) {
          throw new Error('EAS project ID not found in app config');
        }

        const pushTokenData = await Notifications.getExpoPushTokenAsync({
          projectId,
        });
        
        token = pushTokenData.data;
        console.log('✅ Expo Push Token:', token);
        setFcmToken(token);
      } catch (error) {
        console.error('❌ Error getting push token:', error);
        console.log('⚠️ Push token will be obtained on next app launch.');
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
