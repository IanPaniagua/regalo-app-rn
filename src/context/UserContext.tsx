import { createContext, useContext, useState, ReactNode } from 'react';

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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [tempUser, setTempUser] = useState<Partial<UserData>>({});

  const clearUser = () => {
    setUser(null);
    console.log(' User context cleared');
  };

  const clearTempUser = () => {
    setTempUser({});
  };

  return (
    <UserContext.Provider value={{ user, tempUser, setUser, setTempUser, clearUser, clearTempUser }}>
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
