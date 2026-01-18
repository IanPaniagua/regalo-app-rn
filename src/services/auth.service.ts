import { db } from '@/src/database';
import {
    Auth,
    createUserWithEmailAndPassword,
    User as FirebaseUser,
    getAuth,
    initializeAuth,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
} from 'firebase/auth';
import { analytics } from './analytics.service';
import { getFirebaseApp } from './firebase';

export type { FirebaseUser };

/**
 * Servicio de autenticación con Firebase Auth (Web SDK)
 */

export class AuthService {
  private auth: Auth | null = null;

  constructor() {
    // Auth se inicializa lazy
  }

  private getAuthInstance(): Auth {
    if (!this.auth) {
      const app = getFirebaseApp();
      try {
        // Try to get existing auth instance first
        this.auth = getAuth(app);
      } catch {
        // If it doesn't exist, initialize with local persistence
        this.auth = initializeAuth(app, {
          persistence: browserLocalPersistence,
        });
      }
      console.log('✅ Firebase Auth initialized with local persistence');
    }
    return this.auth;
  }

  /**
   * Registrar nuevo usuario con email y contraseña
   */
  async signUp(email: string, password: string, displayName: string): Promise<FirebaseUser> {
    try {
      const auth = this.getAuthInstance();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: displayName,
      });

      console.log('✅ User created in Firebase Auth:', user.uid);
      return user;
    } catch (error: any) {
      console.error('❌ Error signing up:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Iniciar sesión con email y contraseña
   */
  async signIn(email: string, password: string): Promise<FirebaseUser> {
    try {
      const auth = this.getAuthInstance();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Track login
      analytics.trackLogin('email');
      analytics.setUser(userCredential.user.uid);
      
      console.log('✅ User logged in:', userCredential.user.email);
      return userCredential.user;
    } catch (error: any) {
      console.error('❌ Error signing in:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Cerrar sesión
   */
  async signOut(): Promise<void> {
    try {
      const auth = this.getAuthInstance();
      
      // Track logout
      analytics.trackLogout();
      
      await signOut(auth);
      console.log('✅ User logged out');
    } catch (error) {
      console.error('❌ Error signing out:', error);
      throw error;
    }
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): FirebaseUser | null {
    const auth = this.getAuthInstance();
    return auth.currentUser;
  }

  /**
   * Verificar si hay un usuario autenticado
   */
  isAuthenticated(): boolean {
    const auth = this.getAuthInstance();
    return auth.currentUser !== null;
  }

  /**
   * Enviar email de recuperación de contraseña
   */
  async resetPassword(email: string): Promise<void> {
    try {
      const auth = this.getAuthInstance();
      await sendPasswordResetEmail(auth, email);
      console.log('✅ Password reset email sent to:', email);
    } catch (error: any) {
      console.error('❌ Error sending password reset email:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Crear perfil completo: Auth + Database
   */
  async createUserProfile(data: {
    email: string;
    password: string;
    name: string;
    username?: string;
    birthdate: Date;
    hobbies: string[];
    giftPreferences?: string[];
    avatar: string;
  }): Promise<{ authUser: FirebaseUser; dbUserId: string }> {
    try {
      // 1. Crear usuario en Firebase Auth
      const authUser = await this.signUp(data.email, data.password, data.name);

      // 2. Crear perfil en la base de datos usando el UID de Auth como ID del documento
      const dbUser = await db.getAdapter().createUser({
        name: data.name,
        username: data.username,
        email: data.email,
        birthdate: data.birthdate,
        hobbies: data.hobbies,
        giftPreferences: data.giftPreferences,
        avatar: data.avatar,
      }, authUser.uid); // ✅ Usar UID de Auth como ID del documento

      console.log('✅ Complete user profile created:', {
        authUid: authUser.uid,
        dbUserId: dbUser.id,
        idsMatch: authUser.uid === dbUser.id, // Deberían coincidir
      });

      return {
        authUser,
        dbUserId: dbUser.id,
      };
    } catch (error) {
      console.error('❌ Error creating user profile:', error);
      throw error;
    }
  }

  /**
   * Manejar errores de Firebase Auth
   */
  private handleAuthError(error: any): Error {
    const errorCode = error.code;
    let message = 'Error de autenticación';

    switch (errorCode) {
      case 'auth/email-already-in-use':
        message = 'Este email ya está registrado';
        break;
      case 'auth/invalid-email':
        message = 'Email inválido';
        break;
      case 'auth/weak-password':
        message = 'La contraseña debe tener al menos 6 caracteres';
        break;
      case 'auth/user-not-found':
        message = 'Usuario no encontrado';
        break;
      case 'auth/wrong-password':
        message = 'Contraseña incorrecta';
        break;
      case 'auth/too-many-requests':
        message = 'Demasiados intentos. Intenta más tarde';
        break;
      default:
        message = error.message || 'Error desconocido';
    }

    return new Error(message);
  }
}

// Exportar instancia singleton (se crea cuando se importa, pero Auth se inicializa lazy)
export const authService = new AuthService();

// Nota: Firebase App debe estar inicializado antes de usar este servicio
// Esto se hace automáticamente en DatabaseService cuando se inicializa
