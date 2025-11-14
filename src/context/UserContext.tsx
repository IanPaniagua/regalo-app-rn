import { createContext, useContext, useState, ReactNode } from 'react';

interface UserData {
  name: string;
  birthdate: Date;
  hobbies: string[];
  email: string;
}

interface UserContextType {
  user: UserData | null;
  setUser: (user: UserData) => void;
  clearUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserData] = useState<UserData | null>(null);

  const setUser = (userData: UserData) => {
    setUserData(userData);
  };

  const clearUser = () => {
    setUserData(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, clearUser }}>
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
