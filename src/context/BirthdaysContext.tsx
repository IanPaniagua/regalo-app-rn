import { createContext, useContext, ReactNode } from 'react';

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
  getUsersByDate: (date: Date) => BirthdayUser[];
}

// Usuarios mock con cumpleaños en noviembre
const MOCK_USERS: BirthdayUser[] = [
  {
    id: '1',
    name: 'María García',
    avatar: '👩',
    birthdate: new Date(1995, 10, 15), // 15 de noviembre
    hobbies: ['Lectura', 'Cocina', 'Viajes'],
    email: 'maria@ejemplo.com',
  },
  {
    id: '2',
    name: 'Carlos López',
    avatar: '👨',
    birthdate: new Date(1990, 10, 15), // 15 de noviembre
    hobbies: ['Deportes', 'Gaming', 'Tecnología'],
    email: 'carlos@ejemplo.com',
  },
  {
    id: '3',
    name: 'Ana Martínez',
    avatar: '👧',
    birthdate: new Date(1998, 10, 23), // 23 de noviembre
    hobbies: ['Música', 'Arte', 'Fotografía'],
    email: 'ana@ejemplo.com',
  },
];

const BirthdaysContext = createContext<BirthdaysContextType | undefined>(undefined);

export function BirthdaysProvider({ children }: { children: ReactNode }) {
  const getUsersByDate = (date: Date): BirthdayUser[] => {
    const day = date.getDate();
    const month = date.getMonth();
    
    return MOCK_USERS.filter(user => {
      const userDay = user.birthdate.getDate();
      const userMonth = user.birthdate.getMonth();
      return userDay === day && userMonth === month;
    });
  };

  return (
    <BirthdaysContext.Provider value={{ users: MOCK_USERS, getUsersByDate }}>
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
