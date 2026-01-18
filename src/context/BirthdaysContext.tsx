import { db } from '@/src/database';
import { User } from '@/src/database/types';
import { analytics } from '@/src/services/analytics.service';
import { ManualBirthdayEntry } from '@/src/types/birthday';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useConnections } from './ConnectionsContext';
import { useUser } from './UserContext';

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
  addManualEntry: (name: string, birthdate: Date, email?: string) => Promise<void>;
  deleteManualEntry: (id: string) => Promise<void>;
  refreshUsers: () => Promise<void>;
  findManualBirthdayCandidate: (newUser: User) => ManualBirthdayEntry | null;
  linkManualBirthdayToUser: (manualEntryId: string, userId: string) => Promise<void>;
  searchUserByEmailOrName: (email?: string, name?: string) => Promise<User | null>;
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

          // Auto-vincular: Buscar entradas manuales que coincidan con usuarios recién conectados
          const unlinkedManual = manual.filter((entry: ManualBirthdayEntry) => !entry.userId);
          
          for (const manualEntry of unlinkedManual) {
            const matchingUser = birthdayUsers.find(u => {
              // Coincidencia por email
              if (manualEntry.email && u.email && 
                  manualEntry.email.toLowerCase() === u.email.toLowerCase()) {
                return true;
              }
              
              // Coincidencia por nombre + fecha
              const nameMatch = manualEntry.name.toLowerCase().trim() === u.name.toLowerCase().trim();
              const dateMatch = 
                manualEntry.birthdate.getDate() === u.birthdate.getDate() &&
                manualEntry.birthdate.getMonth() === u.birthdate.getMonth() &&
                manualEntry.birthdate.getFullYear() === u.birthdate.getFullYear();
              
              return nameMatch && dateMatch;
            });

            if (matchingUser) {
              console.log('🔗 Auto-linking manual birthday to user:', matchingUser.name);
              // Actualizar la entrada manual con el userId
              const updatedManual = manual.map((entry: ManualBirthdayEntry) => 
                entry.id === manualEntry.id 
                  ? { ...entry, userId: matchingUser.id, isManual: true as const }
                  : entry
              );

              // Guardar en Firestore
              await db.getAdapter().updateUser(user.id, {
                manualBirthdays: updatedManual,
              });

              // Actualizar estado local
              setManualEntries(updatedManual as ManualBirthdayEntry[]);
            }
          }
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

  // Combinar usuarios reales y entradas manuales, filtrando duplicados
  const allEntries = useMemo<CalendarEntry[]>(() => {
    // Filtrar entradas manuales que ya están vinculadas a un usuario conectado
    const connectedUserIds = new Set(users.map(u => u.id));
    
    const filteredManual = manualEntries.filter(entry => {
      // Si tiene userId y ese usuario está en la lista de conectados, no mostrar el manual
      if (entry.userId && connectedUserIds.has(entry.userId)) {
        return false;
      }
      return true;
    });

    return [...users, ...filteredManual];
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

  // Buscar cumpleaños manual candidato para vincular
  const findManualBirthdayCandidate = useCallback((newUser: User): ManualBirthdayEntry | null => {
    if (!user?.id) return null;

    // Buscar en entradas manuales que NO estén ya vinculadas
    const candidates = manualEntries.filter(entry => {
      // Ignorar si ya está vinculado a otro usuario
      if (entry.userId) return false;

      // Coincidencia por email (más confiable)
      if (entry.email && newUser.email && entry.email.toLowerCase() === newUser.email.toLowerCase()) {
        return true;
      }

      // Coincidencia por nombre + fecha de nacimiento
      const nameMatch = entry.name.toLowerCase().trim() === newUser.name.toLowerCase().trim();
      const dateMatch = 
        entry.birthdate.getDate() === newUser.birthdate.getDate() &&
        entry.birthdate.getMonth() === newUser.birthdate.getMonth() &&
        entry.birthdate.getFullYear() === newUser.birthdate.getFullYear();

      return nameMatch && dateMatch;
    });

    // Si hay múltiples candidatos, retornar el más reciente
    if (candidates.length > 1) {
      console.warn('⚠️ Multiple manual birthday candidates found for:', newUser.name);
    }

    return candidates.length > 0 ? candidates[0] : null;
  }, [manualEntries, user?.id]);

  // Vincular cumpleaños manual con usuario real
  const linkManualBirthdayToUser = useCallback(async (manualEntryId: string, userId: string): Promise<void> => {
    if (!user?.id) {
      console.error('❌ No user logged in');
      return;
    }

    try {
      // Actualizar la entrada manual con el userId
      const updatedManual = manualEntries.map(entry => 
        entry.id === manualEntryId 
          ? { ...entry, userId, isManual: true as const }
          : entry
      );

      // Guardar en Firestore
      await db.getAdapter().updateUser(user.id, {
        manualBirthdays: updatedManual,
      });

      // Actualizar estado local
      setManualEntries(updatedManual as ManualBirthdayEntry[]);
      console.log('✅ Manual birthday linked to user:', userId);
    } catch (error) {
      console.error('❌ Error linking manual birthday:', error);
      throw error;
    }
  }, [user?.id, manualEntries]);

  // Buscar usuario existente en la plataforma por email o nombre
  const searchUserByEmailOrName = useCallback(async (email?: string, name?: string): Promise<User | null> => {
    try {
      // Buscar por email si está disponible (más confiable)
      if (email) {
        const userByEmail = await db.getAdapter().getUserByEmail(email);
        if (userByEmail && userByEmail.id !== user?.id) {
          console.log('🔍 User found by email:', userByEmail.name);
          return userByEmail;
        }
      }

      // Si no se encuentra por email, buscar por nombre (menos confiable)
      if (name) {
        const allUsers = await db.getAdapter().getAllUsers();
        const userByName = allUsers.find(u => 
          u.name.toLowerCase().trim() === name.toLowerCase().trim() && u.id !== user?.id
        );
        if (userByName) {
          console.log('🔍 User found by name:', userByName.name);
          return userByName;
        }
      }

      return null;
    } catch (error) {
      console.error('❌ Error searching for user:', error);
      return null;
    }
  }, [user?.id]);

  // Añadir entrada manual de cumpleaños
  const addManualEntry = useCallback(async (name: string, birthdate: Date, email?: string) => {
    if (!user?.id) {
      console.error('❌ No user logged in');
      return;
    }

    try {
      // 1. Verificar si ya existe un usuario conectado con esos datos
      const existingConnectedUser = users.find(u => {
        if (email && u.email && email.toLowerCase() === u.email.toLowerCase()) {
          return true;
        }
        
        const nameMatch = u.name.toLowerCase().trim() === name.toLowerCase().trim();
        const dateMatch = 
          u.birthdate.getDate() === birthdate.getDate() &&
          u.birthdate.getMonth() === birthdate.getMonth() &&
          u.birthdate.getFullYear() === birthdate.getFullYear();
        
        return nameMatch && dateMatch;
      });

      if (existingConnectedUser) {
        throw new Error(`Ya tienes conectado a ${existingConnectedUser.name} con esta fecha de cumpleaños`);
      }

      // 2. Buscar si existe un usuario registrado en la plataforma
      const existingPlatformUser = await searchUserByEmailOrName(email, name);
      
      if (existingPlatformUser) {
        // Usuario existe en la plataforma - sugerir conexión
        const suggestion = {
          found: true,
          user: existingPlatformUser,
          message: `¡Encontramos a ${existingPlatformUser.name} en RegaloApp! ¿Quieres conectar con @${existingPlatformUser.username || 'usuario'} en lugar de añadirlo manualmente?`
        };
        throw new Error(JSON.stringify(suggestion));
      }

      const newEntry: ManualBirthdayEntry = {
        id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        birthdate,
        avatar: '🎂', // Avatar fijo para entradas manuales
        isManual: true,
        email: email || undefined,
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
      
      // Track analytics
      analytics.trackAddManualBirthday();
      
      console.log('✅ Manual birthday entry added:', name);
    } catch (error) {
      console.error('❌ Error adding manual birthday entry:', error);
      throw error;
    }
  }, [user?.id, users]);

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
      
      // Track analytics
      analytics.trackDeleteManualBirthday();
      
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
      findManualBirthdayCandidate,
      linkManualBirthdayToUser,
      searchUserByEmailOrName,
      loading 
    }),
    [users, manualEntries, allEntries, getUsersByDate, addUser, addManualEntry, deleteManualEntry, refreshUsers, findManualBirthdayCandidate, linkManualBirthdayToUser, searchUserByEmailOrName, loading]
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
