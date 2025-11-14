import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { db } from '@/src/database';

export interface BirthdayUser {
  id: string;
  name: string;
  avatar: string; // emoji o URL
  birthdate: Date;
  hobbies: string[];
  email?: string;
}

interface BirthdaysContextType {
  users: BirthdayUser[];
  getUsersByDate: (date: Date) => Promise<BirthdayUser[]>;
  addUser: (user: BirthdayUser) => Promise<void>;
  refreshUsers: () => Promise<void>;
  loading: boolean;
}

const BirthdaysContext = createContext<BirthdaysContextType | undefined>(undefined);

export function BirthdaysProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<BirthdayUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar usuarios desde la base de datos
  const refreshUsers = async () => {
    try {
      setLoading(true);
      const dbUsers = await db.getAdapter().getAllUsers();
      
      // Convertir usuarios de la DB al formato BirthdayUser
      const birthdayUsers: BirthdayUser[] = dbUsers.map(user => ({
        id: user.id,
        name: user.name,
        avatar: user.avatar || '🎉',
        birthdate: user.birthdate,
        hobbies: user.hobbies,
        email: user.email,
      }));
      
      setUsers(birthdayUsers);
      console.log('✅ Loaded', birthdayUsers.length, 'users from database');
    } catch (error: any) {
      console.error('❌ Error loading users:', error);
      
      // Si es error de permisos, mostrar mensaje útil
      if (error.code === 'permission-denied' || error.message?.includes('permissions')) {
        console.error('⚠️ FIRESTORE PERMISSIONS ERROR:');
        console.error('   Go to Firebase Console → Firestore → Rules');
        console.error('   Set: allow read, write: if true; (for development)');
      }
    } finally {
      setLoading(false);
    }
  };

  // Cargar usuarios al montar el componente
  useEffect(() => {
    refreshUsers();
  }, []);

  const getUsersByDate = async (date: Date): Promise<BirthdayUser[]> => {
    try {
      const birthdays = await db.getAdapter().getBirthdaysByDate(date);
      return birthdays.map(b => ({
        id: b.id,
        name: b.userName,
        avatar: b.userAvatar,
        birthdate: b.birthdate,
        hobbies: b.hobbies,
        email: b.email,
      }));
    } catch (error) {
      console.error('❌ Error getting birthdays by date:', error);
      return [];
    }
  };

  const addUser = async (user: BirthdayUser) => {
    try {
      console.log('🔄 Adding user to birthday calendar:', user.name);
      
      // El usuario ya fue creado en la DB por authService.createUserProfile
      // Solo necesitamos refrescar la lista para mostrarlo en el calendario
      await refreshUsers();
      
      console.log('✅ Birthday calendar refreshed, user should appear:', user.name);
    } catch (error) {
      console.error('❌ Error refreshing birthday calendar:', error);
    }
  };

  return (
    <BirthdaysContext.Provider value={{ users, getUsersByDate, addUser, refreshUsers, loading }}>
      {children}
    </BirthdaysContext.Provider>
  );
}

export function useBirthdays() {
  const context = useContext(BirthdaysContext);
  if (context === undefined) {
    throw new Error('useBirthdays must be used within a BirthdaysProvider');
  }
  return context;
}
