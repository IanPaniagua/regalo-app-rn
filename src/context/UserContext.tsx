import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '@/src/database';

// Datos completos del usuario (con email confirmado)
interface UserData {
  id?: string; // ID del usuario en la base de datos
  authUid?: string; // UID de Firebase Auth
  name: string;
  birthdate: Date;
  hobbies: string[];
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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_STORAGE_KEY = '@regalo_app_user';

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
        
        // IMPORTANTE: Verificar si hay sesión activa en Firebase Auth
        // Si no hay sesión, redirigir a login
        const { authService } = await import('@/src/services/auth.service');
        const currentUser = authService.getCurrentUser();
        
        if (!currentUser) {
          console.log('⚠️ No Firebase Auth session, user needs to login');
          // Limpiar usuario guardado y redirigir a login
          await AsyncStorage.removeItem(USER_STORAGE_KEY);
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        setUser(parsedUser);
        console.log('✅ User loaded from storage:', parsedUser.email);
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

  const clearUser = async () => {
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      setUser(null);
      console.log('✅ User cleared from storage');
    } catch (error) {
      console.error('❌ Error clearing user from storage:', error);
    }
  };

  const clearTempUser = () => {
    setTempUser({});
  };

  return (
    <UserContext.Provider value={{ user, tempUser, setUser, setTempUser, clearUser, clearTempUser, isLoading }}>
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
