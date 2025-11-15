import { initializeApp, FirebaseApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import {
  getAuth,
  Auth,
  signInAnonymously,
  onAuthStateChanged,
  indexedDBLocalPersistence,
} from 'firebase/auth';
import { DatabaseAdapter, User, BirthdayEvent, Connection, ConnectionInvitation } from '../types';
import { firebaseConfig } from '../config';

export class FirebaseAdapter implements DatabaseAdapter {
  private app: FirebaseApp | null = null;
  private db: Firestore | null = null;
  private auth: Auth | null = null;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Verificar si ya existe una instancia de Firebase
      if (getApps().length === 0) {
        console.log('🔥 Initializing Firebase App...');
        this.app = initializeApp(firebaseConfig);
        console.log('✅ Firebase App initialized');
      } else {
        console.log('✅ Using existing Firebase App');
        this.app = getApp();
      }

      // Inicializar Auth (opcional)
      this.auth = getAuth(this.app);
      console.log('✅ Firebase Auth initialized');

      // Intentar autenticar anónimamente (no crítico)
      try {
        await this.ensureAuthenticated();
      } catch (authError: any) {
        console.warn('⚠️ Auth failed, continuing without authentication:', authError.code);
        console.warn('   To enable: Firebase Console → Authentication → Sign-in method → Anonymous → Enable');
      }

      this.db = getFirestore(this.app);
      this.initialized = true;
      console.log('✅ Firebase Firestore initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Firebase:', error);
      throw error;
    }
  }

  private async ensureAuthenticated(): Promise<void> {
    if (!this.auth) throw new Error('Auth not initialized');

    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(this.auth!, async (user) => {
        unsubscribe();
        
        if (user) {
          console.log('✅ User already authenticated:', user.uid);
          resolve();
        } else {
          try {
            console.log('🔐 Signing in anonymously...');
            const result = await signInAnonymously(this.auth!);
            console.log('✅ Anonymous sign-in successful:', result.user.uid);
            resolve();
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  }

  async disconnect(): Promise<void> {
    // Firestore no requiere desconexión explícita
    this.initialized = false;
    console.log('Firebase disconnected');
  }

  private ensureInitialized(): Firestore {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  // Convertir Date a Timestamp de Firebase
  private dateToTimestamp(date: Date): Timestamp {
    return Timestamp.fromDate(date);
  }

  // Convertir Timestamp de Firebase a Date
  private timestampToDate(timestamp: Timestamp): Date {
    return timestamp.toDate();
  }

  // USUARIOS
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const db = this.ensureInitialized();
    const usersRef = collection(db, 'users');
    const newUserRef = doc(usersRef);

    const now = new Date();
    const user: User = {
      ...userData,
      id: newUserRef.id,
      createdAt: now,
      updatedAt: now,
    };

    // Convertir Date a Timestamp para Firebase
    const firestoreData = {
      ...user,
      birthdate: this.dateToTimestamp(user.birthdate),
      createdAt: this.dateToTimestamp(user.createdAt!),
      updatedAt: this.dateToTimestamp(user.updatedAt!),
    };

    await setDoc(newUserRef, firestoreData);
    console.log('✅ User created:', user.id);
    return user;
  }

  async getUser(id: string): Promise<User | null> {
    const db = this.ensureInitialized();
    const userRef = doc(db, 'users', id);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    const data = userSnap.data();
    return {
      id: userSnap.id,
      name: data.name,
      email: data.email,
      birthdate: this.timestampToDate(data.birthdate),
      hobbies: data.hobbies,
      avatar: data.avatar,
      createdAt: data.createdAt ? this.timestampToDate(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? this.timestampToDate(data.updatedAt) : undefined,
    };
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const db = this.ensureInitialized();
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      email: data.email,
      birthdate: this.timestampToDate(data.birthdate),
      hobbies: data.hobbies,
      avatar: data.avatar,
      createdAt: data.createdAt ? this.timestampToDate(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? this.timestampToDate(data.updatedAt) : undefined,
    };
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const db = this.ensureInitialized();
    const userRef = doc(db, 'users', id);

    const updateData: any = {
      ...data,
      updatedAt: this.dateToTimestamp(new Date()),
    };

    // Convertir Date a Timestamp si existe
    if (data.birthdate) {
      updateData.birthdate = this.dateToTimestamp(data.birthdate);
    }

    await updateDoc(userRef, updateData);
    console.log('✅ User updated:', id);

    const updatedUser = await this.getUser(id);
    if (!updatedUser) {
      throw new Error('User not found after update');
    }
    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    const db = this.ensureInitialized();
    const userRef = doc(db, 'users', id);
    await deleteDoc(userRef);
    console.log('✅ User deleted:', id);
  }

  async getAllUsers(): Promise<User[]> {
    const db = this.ensureInitialized();
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        email: data.email,
        birthdate: this.timestampToDate(data.birthdate),
        hobbies: data.hobbies,
        avatar: data.avatar,
        createdAt: data.createdAt ? this.timestampToDate(data.createdAt) : undefined,
        updatedAt: data.updatedAt ? this.timestampToDate(data.updatedAt) : undefined,
      };
    });
  }

  // EVENTOS DE CUMPLEAÑOS
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

  // CONEXIONES ENTRE USUARIOS
  async createConnectionInvitation(
    invitation: Omit<ConnectionInvitation, 'id' | 'createdAt'>
  ): Promise<ConnectionInvitation> {
    const db = this.ensureInitialized();
    const invitationsRef = collection(db, 'connection_invitations');
    const newInvitationRef = doc(invitationsRef);

    const now = new Date();
    const fullInvitation: ConnectionInvitation = {
      ...invitation,
      id: newInvitationRef.id,
      createdAt: now,
    };

    const firestoreData = {
      ...fullInvitation,
      expiresAt: this.dateToTimestamp(fullInvitation.expiresAt),
      createdAt: this.dateToTimestamp(fullInvitation.createdAt),
    };

    await setDoc(newInvitationRef, firestoreData);
    console.log('✅ Connection invitation created:', fullInvitation.id);
    return fullInvitation;
  }

  async getConnectionInvitation(invitationId: string): Promise<ConnectionInvitation | null> {
    const db = this.ensureInitialized();
    const invitationRef = doc(db, 'connection_invitations', invitationId);
    const invitationSnap = await getDoc(invitationRef);

    if (!invitationSnap.exists()) {
      return null;
    }

    const data = invitationSnap.data();
    return {
      id: invitationSnap.id,
      fromUserId: data.fromUserId,
      fromUserName: data.fromUserName,
      fromUserAvatar: data.fromUserAvatar,
      expiresAt: this.timestampToDate(data.expiresAt),
      used: data.used,
      usedBy: data.usedBy,
      createdAt: this.timestampToDate(data.createdAt),
    };
  }

  async createConnection(userId1: string, userId2: string): Promise<Connection> {
    const db = this.ensureInitialized();
    const connectionsRef = collection(db, 'connections');
    const newConnectionRef = doc(connectionsRef);

    const now = new Date();
    const connection: Connection = {
      id: newConnectionRef.id,
      userId1,
      userId2,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    const firestoreData = {
      ...connection,
      createdAt: this.dateToTimestamp(connection.createdAt),
      updatedAt: this.dateToTimestamp(connection.updatedAt),
    };

    await setDoc(newConnectionRef, firestoreData);
    console.log('✅ Connection created:', connection.id);
    return connection;
  }

  async getConnectionsByUser(userId: string): Promise<Connection[]> {
    const db = this.ensureInitialized();
    const connectionsRef = collection(db, 'connections');

    // Buscar conexiones donde el usuario es userId1 o userId2
    const q1 = query(connectionsRef, where('userId1', '==', userId));
    const q2 = query(connectionsRef, where('userId2', '==', userId));

    const [snapshot1, snapshot2] = await Promise.all([
      getDocs(q1),
      getDocs(q2),
    ]);

    const connections: Connection[] = [];

    snapshot1.forEach(doc => {
      const data = doc.data();
      connections.push({
        id: doc.id,
        userId1: data.userId1,
        userId2: data.userId2,
        status: data.status,
        createdAt: this.timestampToDate(data.createdAt),
        updatedAt: this.timestampToDate(data.updatedAt),
        viewedByUser1: data.viewedByUser1 || false,
        viewedByUser2: data.viewedByUser2 || false,
      });
    });

    snapshot2.forEach(doc => {
      const data = doc.data();
      connections.push({
        id: doc.id,
        userId1: data.userId1,
        userId2: data.userId2,
        status: data.status,
        createdAt: this.timestampToDate(data.createdAt),
        updatedAt: this.timestampToDate(data.updatedAt),
        viewedByUser1: data.viewedByUser1 || false,
        viewedByUser2: data.viewedByUser2 || false,
      });
    });

    return connections;
  }

  async getConnectedUsers(userId: string): Promise<User[]> {
    // Obtener todas las conexiones aceptadas del usuario
    const connections = await this.getConnectionsByUser(userId);
    const acceptedConnections = connections.filter(c => c.status === 'accepted');

    // Obtener IDs de usuarios conectados
    const connectedUserIds = acceptedConnections.map(c => 
      c.userId1 === userId ? c.userId2 : c.userId1
    );

    // Obtener datos de usuarios conectados
    const users = await Promise.all(
      connectedUserIds.map(id => this.getUser(id))
    );

    // Filtrar nulls
    return users.filter((user): user is User => user !== null);
  }

  async updateConnectionStatus(
    connectionId: string,
    status: 'accepted' | 'rejected'
  ): Promise<Connection> {
    const db = this.ensureInitialized();
    const connectionRef = doc(db, 'connections', connectionId);

    const updateData: any = {
      status,
      updatedAt: this.dateToTimestamp(new Date()),
    };

    // Si se acepta, inicializar los campos de visto
    if (status === 'accepted') {
      updateData.viewedByUser1 = false; // El que envió no ha visto que fue aceptada
      updateData.viewedByUser2 = true;  // El que aceptó ya la vio (está aceptando)
    }

    await updateDoc(connectionRef, updateData);
    console.log('✅ Connection status updated:', connectionId, status);

    // Obtener conexión actualizada
    const connectionSnap = await getDoc(connectionRef);
    if (!connectionSnap.exists()) {
      throw new Error('Connection not found after update');
    }

    const data = connectionSnap.data();
    return {
      id: connectionSnap.id,
      userId1: data.userId1,
      userId2: data.userId2,
      status: data.status,
      createdAt: this.timestampToDate(data.createdAt),
      updatedAt: this.timestampToDate(data.updatedAt),
      viewedByUser1: data.viewedByUser1 || false,
      viewedByUser2: data.viewedByUser2 || false,
    };
  }

  async getPendingInvitations(userId: string): Promise<Connection[]> {
    const connections = await this.getConnectionsByUser(userId);
    
    // Solo invitaciones pendientes donde el usuario es userId2 (receptor)
    return connections.filter(c => c.status === 'pending' && c.userId2 === userId);
  }

  async getAcceptedConnections(userId: string): Promise<Connection[]> {
    const connections = await this.getConnectionsByUser(userId);
    
    // Conexiones aceptadas donde:
    // - El usuario es userId1 (envió) y no ha visto la respuesta (viewedByUser1 = false)
    // - O el usuario es userId2 (recibió) y no ha visto que fue aceptada (viewedByUser2 = false)
    return connections.filter(c => {
      if (c.status !== 'accepted') return false;
      
      if (c.userId1 === userId && !c.viewedByUser1) return true;
      if (c.userId2 === userId && !c.viewedByUser2) return true;
      
      return false;
    });
  }

  async markConnectionAsViewed(connectionId: string, userId: string): Promise<void> {
    const db = this.ensureInitialized();
    const connectionRef = doc(db, 'connections', connectionId);
    
    // Obtener la conexión para saber si es userId1 o userId2
    const connectionSnap = await getDoc(connectionRef);
    if (!connectionSnap.exists()) {
      throw new Error('Connection not found');
    }
    
    const connection = connectionSnap.data();
    const updateData: any = {};
    
    if (connection.userId1 === userId) {
      updateData.viewedByUser1 = true;
    } else if (connection.userId2 === userId) {
      updateData.viewedByUser2 = true;
    }
    
    await updateDoc(connectionRef, updateData);
    console.log('✅ Connection marked as viewed:', connectionId);
  }

  async deleteConnection(connectionId: string): Promise<void> {
    const db = this.ensureInitialized();
    const connectionRef = doc(db, 'connections', connectionId);
    await deleteDoc(connectionRef);
    console.log('✅ Connection deleted:', connectionId);
  }

  async sendConnectionRequestByEmail(fromUserId: string, toEmail: string): Promise<Connection> {
    // Buscar usuario por email
    const toUser = await this.getUserByEmail(toEmail);
    
    if (!toUser) {
      throw new Error('Usuario no encontrado con ese email');
    }

    // Verificar que no sea el mismo usuario
    if (fromUserId === toUser.id) {
      throw new Error('No puedes conectar contigo mismo');
    }

    // Verificar si ya existe una conexión (pendiente o aceptada)
    const existingConnections = await this.getConnectionsByUser(fromUserId);
    const alreadyConnected = existingConnections.find(
      conn => 
        (conn.userId1 === fromUserId && conn.userId2 === toUser.id) ||
        (conn.userId1 === toUser.id && conn.userId2 === fromUserId)
    );

    if (alreadyConnected) {
      if (alreadyConnected.status === 'accepted') {
        throw new Error('Ya estás conectado con este usuario');
      } else if (alreadyConnected.status === 'pending') {
        throw new Error('Ya existe una invitación pendiente con este usuario');
      }
    }

    // Crear conexión pendiente
    const connection = await this.createConnection(fromUserId, toUser.id);
    console.log('✅ Connection request sent to:', toEmail);
    
    return connection;
  }
}
