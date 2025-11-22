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
  limit,
  Timestamp,
  enableIndexedDbPersistence,
  documentId,
} from 'firebase/firestore';
import {
  getAuth,
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { DatabaseAdapter, User, BirthdayEvent, Connection, ConnectionInvitation } from '../types';
import { firebaseConfig } from '../config';

export class FirebaseAdapter implements DatabaseAdapter {
  private app: FirebaseApp | null = null;
  private db: Firestore | null = null;
  // Auth se maneja en authService, no aquí
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

      // Auth se inicializa en authService con persistencia de AsyncStorage
      // NO llamar a getAuth() aquí para evitar inicialización sin persistencia
      // authService se encargará de inicializar Auth correctamente
      console.log('ℹ️ Auth will be initialized by authService with AsyncStorage persistence');

      this.db = getFirestore(this.app);

      // ✅ Habilitar caché offline para reducir lecturas de Firestore
      try {
        await enableIndexedDbPersistence(this.db);
        console.log('✅ Firestore offline persistence enabled');
      } catch (err: any) {
        if (err.code === 'failed-precondition') {
          console.warn('⚠️ Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code === 'unimplemented') {
          console.warn('⚠️ Browser doesn\'t support persistence');
        }
      }

      this.initialized = true;
      console.log('✅ Firebase Firestore initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Firebase:', error);
      throw error;
    }
  }

  private async ensureAuthenticated(): Promise<void> {
    const auth = getAuth(this.app!);
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        unsubscribe();

        if (user) {
          console.log('✅ User already authenticated:', user.uid);
          resolve();
        } else {
          console.log('⚠️ No authenticated user, waiting for login...');
          resolve();
        }
      });
    });
  }

  // Método para autenticar con email/contraseña
  async signInWithEmail(email: string, password: string): Promise<FirebaseUser> {
    const auth = getAuth(this.app!);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Sign-in successful:', result.user.uid);
      return result.user;
    } catch (error: any) {
      console.error('❌ Sign-in error:', error.code);
      throw error;
    }
  }

  // Método para crear cuenta con email/contraseña
  async createAccountWithEmail(email: string, password: string): Promise<FirebaseUser> {
    const auth = getAuth(this.app!);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Account created:', result.user.uid);
      return result.user;
    } catch (error: any) {
      console.error('❌ Account creation error:', error.code);
      throw error;
    }
  }

  // Generar contraseña automática basada en email (para simplificar UX)
  generatePasswordFromEmail(email: string): string {
    // Usar una combinación del email + salt para generar contraseña consistente
    // Esto permite que el usuario use el mismo email en múltiples dispositivos
    const salt = 'RegaloApp2024!';
    return `${email.split('@')[0]}${salt}`;
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
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>, userId?: string): Promise<User> {
    const db = this.ensureInitialized();

    // Crear documento en Firestore
    // Si se proporciona userId (UID de Auth), usarlo como ID del documento
    // Esto asegura que el ID del documento coincida con el UID de Firebase Auth
    const usersRef = collection(db, 'users');
    const newUserRef = userId ? doc(usersRef, userId) : doc(usersRef);

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
    console.log('✅ User created in Firestore:', user.id);
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
      username: data.username,
      email: data.email,
      birthdate: this.timestampToDate(data.birthdate),
      hobbies: data.hobbies || [],
      giftPreferences: data.giftPreferences || [],
      avatar: data.avatar,
      hideAge: data.hideAge,
      hideAgeChangesCount: data.hideAgeChangesCount,
      hideAgeLastChangeDate: data.hideAgeLastChangeDate ? this.timestampToDate(data.hideAgeLastChangeDate) : undefined,
      nameChangesCount: data.nameChangesCount,
      nameLastChangeDate: data.nameLastChangeDate ? this.timestampToDate(data.nameLastChangeDate) : undefined,
      fcmToken: data.fcmToken,
      fcmTokenUpdatedAt: data.fcmTokenUpdatedAt ? this.timestampToDate(data.fcmTokenUpdatedAt) : undefined,
      createdAt: data.createdAt ? this.timestampToDate(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? this.timestampToDate(data.updatedAt) : undefined,
    };
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const db = this.ensureInitialized();
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      username: data.username,
      email: data.email,
      birthdate: this.timestampToDate(data.birthdate),
      hobbies: data.hobbies || [],
      giftPreferences: data.giftPreferences || [],
      avatar: data.avatar,
      hideAge: data.hideAge,
      hideAgeChangesCount: data.hideAgeChangesCount,
      hideAgeLastChangeDate: data.hideAgeLastChangeDate ? this.timestampToDate(data.hideAgeLastChangeDate) : undefined,
      nameChangesCount: data.nameChangesCount,
      nameLastChangeDate: data.nameLastChangeDate ? this.timestampToDate(data.nameLastChangeDate) : undefined,
      fcmToken: data.fcmToken,
      fcmTokenUpdatedAt: data.fcmTokenUpdatedAt ? this.timestampToDate(data.fcmTokenUpdatedAt) : undefined,
      createdAt: data.createdAt ? this.timestampToDate(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? this.timestampToDate(data.updatedAt) : undefined,
    };
  }

  async isUsernameAvailable(username: string): Promise<boolean> {
    const db = this.ensureInitialized();
    const usersRef = collection(db, 'users');
    // Buscar username en minúsculas para evitar duplicados como @User y @user
    const normalizedUsername = username.toLowerCase();
    const q = query(usersRef, where('username', '==', normalizedUsername), limit(1));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const db = this.ensureInitialized();
    const usersRef = collection(db, 'users');
    const normalizedUsername = username.toLowerCase();
    const q = query(usersRef, where('username', '==', normalizedUsername), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name,
      username: data.username,
      email: data.email,
      birthdate: this.timestampToDate(data.birthdate),
      hobbies: data.hobbies || [],
      giftPreferences: data.giftPreferences || [],
      avatar: data.avatar,
      hideAge: data.hideAge,
      hideAgeChangesCount: data.hideAgeChangesCount,
      hideAgeLastChangeDate: data.hideAgeLastChangeDate ? this.timestampToDate(data.hideAgeLastChangeDate) : undefined,
      nameChangesCount: data.nameChangesCount,
      nameLastChangeDate: data.nameLastChangeDate ? this.timestampToDate(data.nameLastChangeDate) : undefined,
      fcmToken: data.fcmToken,
      fcmTokenUpdatedAt: data.fcmTokenUpdatedAt ? this.timestampToDate(data.fcmTokenUpdatedAt) : undefined,
    };
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const db = this.ensureInitialized();
    const userRef = doc(db, 'users', id);

    const updateData: any = {
      ...data,
      updatedAt: this.dateToTimestamp(new Date()),
    };

    // Convertir todos los campos Date a Timestamp
    if (data.birthdate) {
      updateData.birthdate = this.dateToTimestamp(data.birthdate);
    }
    if (data.nameLastChangeDate) {
      updateData.nameLastChangeDate = this.dateToTimestamp(data.nameLastChangeDate);
    }
    if (data.hideAgeLastChangeDate) {
      updateData.hideAgeLastChangeDate = this.dateToTimestamp(data.hideAgeLastChangeDate);
    }
    if (data.fcmTokenUpdatedAt) {
      updateData.fcmTokenUpdatedAt = this.dateToTimestamp(data.fcmTokenUpdatedAt);
    }

    // Filtrar campos undefined (Firestore no los permite)
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

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
        username: data.username,
        email: data.email,
        birthdate: this.timestampToDate(data.birthdate),
        hobbies: data.hobbies || [],
        giftPreferences: data.giftPreferences || [],
        avatar: data.avatar,
        hideAge: data.hideAge,
        hideAgeChangesCount: data.hideAgeChangesCount,
        hideAgeLastChangeDate: data.hideAgeLastChangeDate ? this.timestampToDate(data.hideAgeLastChangeDate) : undefined,
        nameChangesCount: data.nameChangesCount,
        nameLastChangeDate: data.nameLastChangeDate ? this.timestampToDate(data.nameLastChangeDate) : undefined,
        fcmToken: data.fcmToken,
        fcmTokenUpdatedAt: data.fcmTokenUpdatedAt ? this.timestampToDate(data.fcmTokenUpdatedAt) : undefined,
        createdAt: data.createdAt ? this.timestampToDate(data.createdAt) : undefined,
        updatedAt: data.updatedAt ? this.timestampToDate(data.updatedAt) : undefined,
      };
    });
  }

  // ✅ OPTIMIZACIÓN: Obtener múltiples usuarios en batch (evita N+1 queries)
  async getUsersByIds(userIds: string[]): Promise<User[]> {
    if (userIds.length === 0) return [];

    const db = this.ensureInitialized();
    const usersRef = collection(db, 'users');

    // Firestore limita 'in' queries a 10 elementos, dividir en chunks
    const chunks: string[][] = [];
    for (let i = 0; i < userIds.length; i += 10) {
      chunks.push(userIds.slice(i, i + 10));
    }

    const results = await Promise.all(
      chunks.map(async (chunk) => {
        const q = query(usersRef, where(documentId(), 'in', chunk));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            username: data.username,
            email: data.email,
            birthdate: this.timestampToDate(data.birthdate),
            hobbies: data.hobbies || [],
            giftPreferences: data.giftPreferences || [],
            avatar: data.avatar,
            hideAge: data.hideAge,
            hideAgeChangesCount: data.hideAgeChangesCount,
            hideAgeLastChangeDate: data.hideAgeLastChangeDate ? this.timestampToDate(data.hideAgeLastChangeDate) : undefined,
            nameChangesCount: data.nameChangesCount,
            nameLastChangeDate: data.nameLastChangeDate ? this.timestampToDate(data.nameLastChangeDate) : undefined,
            fcmToken: data.fcmToken,
            fcmTokenUpdatedAt: data.fcmTokenUpdatedAt ? this.timestampToDate(data.fcmTokenUpdatedAt) : undefined,
            createdAt: data.createdAt ? this.timestampToDate(data.createdAt) : undefined,
            updatedAt: data.updatedAt ? this.timestampToDate(data.updatedAt) : undefined,
          };
        });
      })
    );

    return results.flat();
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

  async sendConnectionRequestByUsername(fromUserId: string, toUsername: string): Promise<Connection> {
    // Buscar usuario por username
    const toUser = await this.getUserByUsername(toUsername);

    if (!toUser) {
      throw new Error('Usuario no encontrado con ese nombre de usuario');
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
    console.log('✅ Connection request sent to:', toUsername);

    return connection;
  }
}
