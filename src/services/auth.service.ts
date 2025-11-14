import { 
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  updateProfile,
  Auth,
} from 'firebase/auth';
import { db } from '@/src/database';
import { getFirebaseApp } from './firebase';

/**
 * Servicio de autenticación con Firebase Auth
 * 
 * NOTA: Para persistencia en React Native, instala @react-native-async-storage/async-storage
 * y configura initializeAuth con getReactNativePersistence
 */
export class AuthService {
  private auth: Auth | null = null;

  constructor() {
    // No inicializar Auth en el constructor para evitar errores
    // Se inicializará cuando se use por primera vez
  }

  /**
   * Obtener instancia de Auth (lazy initialization)
   */
  private getAuthInstance(): Auth {
    if (!this.auth) {
      // Asegurar que Firebase App esté inicializado
      const app = getFirebaseApp();
      this.auth = getAuth(app);
      console.log('✅ Firebase Auth initialized (memory persistence)');
    }
    return this.auth;
  }

  /**
   * Registrar nuevo usuario con email y contraseña
   */
  async signUp(email: string, password: string, displayName: string): Promise<FirebaseUser> {
    try {
      const auth = this.getAuthInstance();
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Actualizar nombre de usuario
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
      console.log('✅ User signed in:', userCredential.user.uid);
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
      await signOut(auth);
      console.log('✅ User signed out');
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
   * Crear perfil completo: Auth + Database
   */
  async createUserProfile(data: {
    email: string;
    password: string;
    name: string;
    birthdate: Date;
    hobbies: string[];
    avatar?: string;
  }): Promise<{ authUser: FirebaseUser; dbUserId: string }> {
    try {
      // 1. Crear usuario en Firebase Auth
      const authUser = await this.signUp(data.email, data.password, data.name);

      // 2. Crear perfil en la base de datos
      const dbUser = await db.getAdapter().createUser({
        name: data.name,
        email: data.email,
        birthdate: data.birthdate,
        hobbies: data.hobbies,
        avatar: data.avatar || '🎉',
      });

      console.log('✅ Complete user profile created:', {
        authUid: authUser.uid,
        dbUserId: dbUser.id,
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
