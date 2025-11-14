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
import { DatabaseAdapter, User, BirthdayEvent } from '../types';
import { firebaseConfig } from '../config';

export class FirebaseAdapter implements DatabaseAdapter {
  private app: FirebaseApp | null = null;
  private db: Firestore | null = null;
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

      this.db = getFirestore(this.app);
      this.initialized = true;
      console.log('✅ Firebase Firestore initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Firebase:', error);
      throw error;
    }
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
}
