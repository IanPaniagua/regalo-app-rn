import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { firebaseConfig } from '@/src/database/config';

/**
 * Obtener o inicializar la instancia de Firebase App
 * Esta función asegura que Firebase esté inicializado antes de usarlo
 */
export function getFirebaseApp(): FirebaseApp {
  if (getApps().length === 0) {
    console.log('🔥 Initializing Firebase App globally...');
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

/**
 * Verificar si Firebase está inicializado
 */
export function isFirebaseInitialized(): boolean {
  return getApps().length > 0;
}
