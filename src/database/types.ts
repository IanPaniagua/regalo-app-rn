// Tipos de datos de la aplicación
export interface User {
  id: string;
  name: string;
  email: string;
  birthdate: Date;
  hobbies: string[];
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BirthdayEvent {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  birthdate: Date;
  hobbies: string[];
  email?: string;
}

// Interfaz genérica para operaciones de base de datos
export interface DatabaseAdapter {
  // Usuarios
  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  getUser(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  getAllUsers(): Promise<User[]>;

  // Eventos de cumpleaños
  getBirthdaysByDate(date: Date): Promise<BirthdayEvent[]>;
  getBirthdaysByMonth(year: number, month: number): Promise<BirthdayEvent[]>;
  
  // Utilidades
  initialize(): Promise<void>;
  disconnect(): Promise<void>;
}
