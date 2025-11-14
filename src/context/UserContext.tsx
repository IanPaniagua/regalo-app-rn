import { createContext, useContext, useState, ReactNode } from 'react';

// Datos completos del usuario (con email confirmado)
interface UserData {
  id?: string; // ID del usuario en la base de datos
  authUid?: string; // UID de Firebase Auth
  name: string;
  birthdate: Date;
  hobbies: string[];
  email: string;
}

// Datos temporales durante el funnel (sin email)
interface TempUserData {
  name: string;
  birthdate: Date;
  hobbies: string[];
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
