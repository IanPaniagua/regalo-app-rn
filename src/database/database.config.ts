import { DatabaseType } from './DatabaseService';

/**
 * Configuración de la base de datos
 * Cambia DATABASE_TYPE para usar diferentes adaptadores
 */

// Cambiar entre 'firebase' y 'mock'
export const DATABASE_TYPE: DatabaseType = 'firebase'; // Usando Firebase en producción

// Configuración adicional
export const DATABASE_CONFIG = {
  // Tiempo de espera para operaciones (ms)
  timeout: 10000,
  
  // Reintentos en caso de error
  retries: 3,
  
  // Modo debug (muestra logs adicionales)
  debug: __DEV__, // true en desarrollo, false en producción
};

/**
 * INSTRUCCIONES:
 * 
 * Para usar Mock (desarrollo/testing):
 * export const DATABASE_TYPE: DatabaseType = 'mock';
 * 
 * Para usar Firebase (producción):
 * export const DATABASE_TYPE: DatabaseType = 'firebase';
 * 
 * Asegúrate de tener las variables de entorno configuradas en .env.local
 */
