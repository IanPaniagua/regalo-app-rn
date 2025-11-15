// Tipos de datos de la aplicación
export interface User {
  id: string;
  name: string;
  email: string;
  birthdate: Date;
  hobbies: string[];
  avatar?: string;
  hideAge?: boolean; // Preferencia de privacidad para ocultar edad
  hideAgeChangesCount?: number; // Contador de cambios de privacidad
  hideAgeLastChangeDate?: Date; // Fecha del último cambio de privacidad
  nameChangesCount?: number; // Contador de cambios de nombre
  nameLastChangeDate?: Date; // Fecha del último cambio de nombre
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

// Sistema de conexiones entre usuarios
export interface Connection {
  id: string;
  userId1: string; // Usuario que envió la invitación
  userId2: string; // Usuario que recibió la invitación
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  // Notificaciones
  viewedByUser1?: boolean; // Si userId1 vio la respuesta (aceptada/rechazada)
  viewedByUser2?: boolean; // Si userId2 vio la invitación pendiente
}

// Invitación para conectar (con link único)
export interface ConnectionInvitation {
  id: string; // ID único para el link
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  expiresAt: Date; // Expira después de 14 días
  used: boolean; // Si ya fue usada
  usedBy?: string; // ID del usuario que la usó
  createdAt: Date;
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
  
  // Conexiones entre usuarios
  createConnectionInvitation(invitation: Omit<ConnectionInvitation, 'id' | 'createdAt'>): Promise<ConnectionInvitation>;
  getConnectionInvitation(invitationId: string): Promise<ConnectionInvitation | null>;
  createConnection(userId1: string, userId2: string): Promise<Connection>;
  getConnectionsByUser(userId: string): Promise<Connection[]>;
  getConnectedUsers(userId: string): Promise<User[]>; // Solo usuarios conectados
  updateConnectionStatus(connectionId: string, status: 'accepted' | 'rejected'): Promise<Connection>;
  getPendingInvitations(userId: string): Promise<Connection[]>;
  getAcceptedConnections(userId: string): Promise<Connection[]>; // Conexiones aceptadas (para notificaciones)
  markConnectionAsViewed(connectionId: string, userId: string): Promise<void>; // Marcar como visto
  deleteConnection(connectionId: string): Promise<void>; // Para desconectar usuarios
  sendConnectionRequestByEmail(fromUserId: string, toEmail: string): Promise<Connection>; // Enviar invitación por email
  
  // Utilidades
  initialize(): Promise<void>;
  disconnect(): Promise<void>;
}
