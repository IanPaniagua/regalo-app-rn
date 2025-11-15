import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { db } from '@/src/database';
import { useUser } from './UserContext';

// Configurar cómo se manejan las notificaciones cuando la app está en foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface NotificationsContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  requestPermissions: () => Promise<boolean>;
  isPermissionGranted: boolean;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  // Registrar token cuando el usuario inicia sesión
  useEffect(() => {
    if (user && !expoPushToken) {
      registerForPushNotificationsAsync();
    }
  }, [user]);

  // Guardar token en Firestore cuando se obtiene
  useEffect(() => {
    if (expoPushToken && user) {
      saveFCMTokenToFirestore(expoPushToken);
    }
  }, [expoPushToken, user]);

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
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
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
      
      // Obtener token de Expo
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId ?? 'your-project-id',
      })).data;
      
      console.log('✅ Expo Push Token:', token);
      setExpoPushToken(token);
      
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

  async function saveFCMTokenToFirestore(token: string) {
    if (!user?.id) return;

    try {
      await db.getAdapter().updateUser(user.id, {
        fcmToken: token,
        fcmTokenUpdatedAt: new Date(),
      });
      console.log('✅ FCM token saved to Firestore');
    } catch (error) {
      console.error('❌ Error saving FCM token:', error);
    }
  }

  function handleNotificationResponse(response: Notifications.NotificationResponse) {
    const data = response.notification.request.content.data;
    
    console.log('📱 Notification data:', data);
    
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
        expoPushToken,
        notification,
        requestPermissions,
        isPermissionGranted,
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
