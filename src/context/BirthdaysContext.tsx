import { createContext, useContext, ReactNode, useState, useEffect, useMemo, useCallback } from 'react';
import { db } from '@/src/database';
import { useUser } from './UserContext';
import { useConnections } from './ConnectionsContext';
import { ManualBirthdayEntry } from '@/src/types/birthday';

export interface BirthdayUser {
  id: string;
  name: string;
  avatar: string; // emoji o URL
  birthdate: Date;
  hobbies: string[];
  giftPreferences: string[];
  email?: string;
  isManual?: false; // Flag para distinguir de entradas manuales
}

// Tipo unión para el calendario
export type CalendarEntry = BirthdayUser | ManualBirthdayEntry;

interface BirthdaysContextType {
  users: BirthdayUser[];
  manualEntries: ManualBirthdayEntry[];
  allEntries: CalendarEntry[]; // Combinación de usuarios reales + manuales
  getUsersByDate: (date: Date) => Promise<CalendarEntry[]>;
  addUser: (user: BirthdayUser) => Promise<void>;
  addManualEntry: (name: string, birthdate: Date) => Promise<void>;
  deleteManualEntry: (id: string) => Promise<void>;
  refreshUsers: () => Promise<void>;
  loading: boolean;
}

const BirthdaysContext = createContext<BirthdaysContextType | undefined>(undefined);

export function BirthdaysProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const { connectedUsers } = useConnections();
  const [users, setUsers] = useState<BirthdayUser[]>([]);
  const [manualEntries, setManualEntries] = useState<ManualBirthdayEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar usuarios conectados y entradas manuales desde la base de datos
  // ✅ Memoizado para evitar recrear la función en cada render
  const refreshUsers = useCallback(async () => {
    if (!user?.id) {
      setUsers([]);
      setManualEntries([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Solo cargar usuarios conectados con el usuario actual
      const dbUsers = await db.getAdapter().getConnectedUsers(user.id);

      // Convertir usuarios de la DB al formato BirthdayUser
      const birthdayUsers: BirthdayUser[] = dbUsers.map(user => ({
        id: user.id,
        name: user.name,
        avatar: user.avatar || '🎉',
        birthdate: user.birthdate,
        hobbies: user.hobbies,
        giftPreferences: user.giftPreferences || [],
        email: user.email,
        isManual: false,
      }));

      setUsers(birthdayUsers);
      console.log('✅ Loaded', birthdayUsers.length, 'users from database');

      // Cargar entradas manuales del usuario actual
      if (user.id) {
        const currentUser = await db.getAdapter().getUser(user.id);
        if (currentUser?.manualBirthdays) {
          const manual = currentUser.manualBirthdays.map((entry: any) => ({
            ...entry,
            birthdate: entry.birthdate instanceof Date ? entry.birthdate : new Date(entry.birthdate),
            isManual: true as const,
          }));
          setManualEntries(manual);
          console.log('✅ Loaded', manual.length, 'manual birthday entries');
        } else {
          setManualEntries([]);
        }
      } else {
        setManualEntries([]);
      }
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
  }, [user?.id]);

  // Cargar usuarios al montar el componente o cuando cambie el usuario o las conexiones
  useEffect(() => {
    refreshUsers();
  }, [user?.id, connectedUsers.length]);

  // Combinar usuarios reales y entradas manuales
  const allEntries = useMemo<CalendarEntry[]>(() => {
    return [...users, ...manualEntries];
  }, [users, manualEntries]);

  // ✅ Memoizado para evitar recrear la función en cada render
  const getUsersByDate = useCallback(async (date: Date): Promise<CalendarEntry[]> => {
    try {
      // Filtrar de todas las entradas (usuarios + manuales)
      const day = date.getDate();
      const month = date.getMonth();

      const birthdaysToday = allEntries.filter(entry => {
        const entryDay = entry.birthdate.getDate();
        const entryMonth = entry.birthdate.getMonth();
        return entryDay === day && entryMonth === month;
      });

      console.log(`📅 Birthdays on ${date.toLocaleDateString()}:`, birthdaysToday.length);
      return birthdaysToday;
    } catch (error) {
      console.error('❌ Error getting birthdays by date:', error);
      return [];
    }
  }, [allEntries]);

  // ✅ Memoizado para evitar recrear la función en cada render
  const addUser = useCallback(async (user: BirthdayUser) => {
    try {
      console.log('🔄 Adding user to birthday calendar:', user.name);

      // El usuario ya fue creado en la DB por authService.createUserProfile
      // Solo necesitamos refrescar la lista para mostrarlo en el calendario
      await refreshUsers();

      console.log('✅ Birthday calendar refreshed, user should appear:', user.name);
    } catch (error) {
      console.error('❌ Error refreshing birthday calendar:', error);
    }
  }, [refreshUsers]);

  // Añadir entrada manual de cumpleaños
  const addManualEntry = useCallback(async (name: string, birthdate: Date) => {
    if (!user?.id) {
      console.error('❌ No user logged in');
      return;
    }

    try {
      const newEntry: ManualBirthdayEntry = {
        id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        birthdate,
        avatar: '🎂', // Avatar fijo para entradas manuales
        isManual: true,
      };

      // Obtener entradas actuales
      const currentUser = await db.getAdapter().getUser(user.id);
      const currentManual = currentUser?.manualBirthdays || [];

      // Añadir nueva entrada
      const updatedManual = [...currentManual, newEntry];

      // Guardar en Firestore
      await db.getAdapter().updateUser(user.id, {
        manualBirthdays: updatedManual,
      });

      // Actualizar estado local
      setManualEntries(prev => [...prev, newEntry]);
      console.log('✅ Manual birthday entry added:', name);
    } catch (error) {
      console.error('❌ Error adding manual birthday entry:', error);
      throw error;
    }
  }, [user?.id]);

  // Eliminar entrada manual
  const deleteManualEntry = useCallback(async (id: string) => {
    if (!user?.id) {
      console.error('❌ No user logged in');
      return;
    }

    try {
      // Filtrar la entrada a eliminar
      const updatedManual = manualEntries.filter(entry => entry.id !== id);

      // Guardar en Firestore
      await db.getAdapter().updateUser(user.id, {
        manualBirthdays: updatedManual,
      });

      // Actualizar estado local
      setManualEntries(updatedManual);
      console.log('✅ Manual birthday entry deleted:', id);
    } catch (error) {
      console.error('❌ Error deleting manual birthday entry:', error);
      throw error;
    }
  }, [user?.id, manualEntries]);

  // ✅ Memoizar el value del contexto para evitar re-renders innecesarios
  const contextValue = useMemo(
    () => ({ 
      users, 
      manualEntries, 
      allEntries, 
      getUsersByDate, 
      addUser, 
      addManualEntry, 
      deleteManualEntry, 
      refreshUsers, 
      loading 
    }),
    [users, manualEntries, allEntries, getUsersByDate, addUser, addManualEntry, deleteManualEntry, refreshUsers, loading]
  );

  return (
    <BirthdaysContext.Provider value={contextValue}>
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
