import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '@/src/database';

// Datos completos del usuario (con email confirmado)
interface UserData {
  id?: string; // ID del usuario en la base de datos
  authUid?: string; // UID de Firebase Auth
  name: string;
  username?: string; // Username único tipo @username
  birthdate: Date;
  hobbies: string[];
  giftPreferences?: string[]; // Preferencias de regalos
  avatar: string;
  email: string;
  hideAge?: boolean; // Preferencia de privacidad para ocultar edad
  hideAgeChangesCount?: number; // Contador de cambios de privacidad
  hideAgeLastChangeDate?: Date; // Fecha del último cambio de privacidad
  nameChangesCount?: number; // Contador de cambios de nombre
  nameLastChangeDate?: Date; // Fecha del último cambio de nombre
  fcmToken?: string; // Token de Firebase Cloud Messaging para notificaciones push
  fcmTokenUpdatedAt?: Date; // Fecha de última actualización del token
}

// Datos temporales durante el funnel (sin email)
interface TempUserData {
  name: string;
  birthdate: Date;
  hobbies: string[];
  avatar: string;
  hideAge?: boolean;
}

interface UserContextType {
  user: UserData | null;
  setUser: (user: UserData | null) => void;
  clearUser: () => void;
  tempUser: Partial<UserData>;
  setTempUser: (user: Partial<UserData>) => void;
  clearTempUser: () => void;
  isLoading: boolean;
  saveCredentials: (email: string, password: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_STORAGE_KEY = '@regalo_app_user';
const AUTH_CREDENTIALS_KEY = '@regalo_app_auth_credentials';

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [tempUser, setTempUser] = useState<Partial<UserData>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Cargar usuario guardado al iniciar la app
  useEffect(() => {
    loadUser();
  }, []);

  // Guardar usuario cuando cambie
  useEffect(() => {
    if (user) {
      saveUser(user);
    }
  }, [user]);

  const loadUser = async () => {
    try {
      const { authService } = await import('@/src/services/auth.service');
      
      // Primero verificar si hay sesión activa en Firebase Auth
      let currentUser = authService.getCurrentUser();
      
      // Si no hay sesión, intentar auto-login con credenciales guardadas
      if (!currentUser) {
        const storedCredentials = await AsyncStorage.getItem(AUTH_CREDENTIALS_KEY);
        if (storedCredentials) {
          try {
            const { email, password } = JSON.parse(storedCredentials);
            console.log('🔄 Attempting auto-login...');
            await authService.signIn(email, password);
            currentUser = authService.getCurrentUser();
            console.log('✅ Auto-login successful');
          } catch (error) {
            console.error('❌ Auto-login failed:', error);
            // Limpiar credenciales inválidas
            await AsyncStorage.removeItem(AUTH_CREDENTIALS_KEY);
            await AsyncStorage.removeItem(USER_STORAGE_KEY);
            setUser(null);
            setIsLoading(false);
            return;
          }
        } else {
          console.log('ℹ️ No stored credentials, user needs to login');
          setUser(null);
          setIsLoading(false);
          return;
        }
      }
      
      // Si hay sesión (activa o restaurada), cargar datos del usuario desde Firebase
      if (currentUser) {
        try {
          // Recargar usuario desde Firebase para tener datos actualizados
          const dbUser = await db.getAdapter().getUser(currentUser.uid);
          if (dbUser) {
            const userData: UserData = {
              ...dbUser,
              avatar: dbUser.avatar || '🎉',
              giftPreferences: dbUser.giftPreferences || [],
            };
            setUser(userData);
            await saveUser(userData);
            console.log('✅ User loaded from Firebase:', userData.email);
          } else {
            // Si no existe en Firebase, intentar desde storage como fallback
            const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
            if (storedUser) {
              const parsedUser = JSON.parse(storedUser);
              // Convertir fechas de string a Date
              if (parsedUser.birthdate) {
                parsedUser.birthdate = new Date(parsedUser.birthdate);
              }
              if (parsedUser.hideAgeLastChangeDate) {
                parsedUser.hideAgeLastChangeDate = new Date(parsedUser.hideAgeLastChangeDate);
              }
              if (parsedUser.nameLastChangeDate) {
                parsedUser.nameLastChangeDate = new Date(parsedUser.nameLastChangeDate);
              }
              
              setUser(parsedUser);
              console.log('✅ User loaded from storage (fallback):', parsedUser.email);
            }
          }
        } catch (error) {
          console.error('❌ Error loading user from Firebase:', error);
        }
      }
    } catch (error) {
      console.error('❌ Error loading user from storage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUser = async (userData: UserData) => {
    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      console.log('✅ User saved to storage:', userData.email);
    } catch (error) {
      console.error('❌ Error saving user to storage:', error);
    }
  };

  // Función para guardar credenciales (llamar desde login)
  const saveCredentials = async (email: string, password: string) => {
    try {
      await AsyncStorage.setItem(AUTH_CREDENTIALS_KEY, JSON.stringify({ email, password }));
      console.log('✅ Credentials saved for auto-login');
    } catch (error) {
      console.error('❌ Error saving credentials:', error);
    }
  };

  const clearUser = async () => {
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      await AsyncStorage.removeItem(AUTH_CREDENTIALS_KEY);
      setUser(null);
      console.log('✅ User and credentials cleared from storage');
    } catch (error) {
      console.error('❌ Error clearing user from storage:', error);
    }
  };

  const clearTempUser = () => {
    setTempUser({});
  };

  return (
    <UserContext.Provider value={{ user, tempUser, setUser, setTempUser, clearUser, clearTempUser, isLoading, saveCredentials }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
