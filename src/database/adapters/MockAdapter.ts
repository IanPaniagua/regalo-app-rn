import { BirthdayEvent, User } from '../types';

// Adapter Mock para desarrollo y testing
// @ts-ignore - Mock adapter not fully implemented, use Firebase in production
export class MockAdapter {
  private users: Map<string, User> = new Map();
  private initialized = false;

  // Métodos stub para compatibilidad con DatabaseAdapter
  async getUserByUsername(username: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.username === username) return user;
    }
    return null;
  }

  async isUsernameAvailable(username: string): Promise<boolean> {
    for (const user of this.users.values()) {
      if (user.username === username) return false;
    }
    return true;
  }

  async getUsersByIds(userIds: string[]): Promise<User[]> {
    return userIds.map(id => this.users.get(id)).filter((u): u is User => u !== undefined);
  }

  async createConnectionInvitation(fromUserId: string, toUserId: string): Promise<string> {
    return `mock_connection_${Date.now()}`;
  }

  async getConnectionInvitations(userId: string): Promise<any[]> {
    return [];
  }

  async acceptConnectionInvitation(invitationId: string): Promise<void> {
    // Mock implementation
  }

  async rejectConnectionInvitation(invitationId: string): Promise<void> {
    // Mock implementation
  }

  async getConnections(userId: string): Promise<any[]> {
    return [];
  }

  async updateConnectionStatus(connectionId: string, status: string): Promise<void> {
    // Mock implementation
  }

  async searchUserByEmailOrName(email?: string, name?: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (email && user.email === email) return user;
      if (name && user.name === name) return user;
    }
    return null;
  }

  async initialize(): Promise<void> {
    // Si ya hay usuarios, solo marcar como inicializado
    if (this.users.size > 0) {
      this.initialized = true;
      console.log('✅ Mock database re-initialized with', this.users.size, 'existing users');
      return;
    }

    // Primera inicialización: cargar datos mock
    const mockUsers: Omit<User, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'María García',
        email: 'maria@ejemplo.com',
        birthdate: new Date(1995, 10, 15),
        hobbies: ['Lectura', 'Cocina', 'Viajes'],
        avatar: '👩',
      },
      {
        name: 'Carlos López',
        email: 'carlos@ejemplo.com',
        birthdate: new Date(1990, 10, 15),
        hobbies: ['Deportes', 'Gaming', 'Tecnología'],
        avatar: '👨',
      },
      {
        name: 'Ana Martínez',
        email: 'ana@ejemplo.com',
        birthdate: new Date(1998, 10, 23),
        hobbies: ['Música', 'Arte', 'Fotografía'],
        avatar: '👧',
      },
    ];

    for (const userData of mockUsers) {
      await this.createUser(userData);
    }

    this.initialized = true;
    console.log('✅ Mock database initialized with', this.users.size, 'users');
  }

  async disconnect(): Promise<void> {
    // NO limpiar los datos en disconnect para evitar perder datos en hot reload
    // Solo marcar como desconectado
    console.log('Mock database disconnected (data preserved)');
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>, userId?: string): Promise<User> {
    const id = userId || `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const user: User = {
      ...userData,
      id,
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(id, user);
    return user;
  }

  async getUser(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser: User = {
      ...user,
      ...data,
      id, // Mantener el ID original
      updatedAt: new Date(),
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    this.users.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getBirthdaysByDate(date: Date): Promise<BirthdayEvent[]> {
    const users = await this.getAllUsers();
    const day = date.getDate();
    const month = date.getMonth();

    return users
      .filter(user => {
        const userDay = user.birthdate.getDate();
        const userMonth = user.birthdate.getMonth();
        return userDay === day && userMonth === month;
      })
      .map(user => ({
        id: user.id,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar || '🎉',
        birthdate: user.birthdate,
        hobbies: user.hobbies,
        email: user.email,
      }));
  }

  async getBirthdaysByMonth(year: number, month: number): Promise<BirthdayEvent[]> {
    const users = await this.getAllUsers();

    return users
      .filter(user => user.birthdate.getMonth() === month)
      .map(user => ({
        id: user.id,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar || '🎉',
        birthdate: user.birthdate,
        hobbies: user.hobbies,
        email: user.email,
      }));
  }
}
