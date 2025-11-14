import { DatabaseAdapter } from './types';
import { FirebaseAdapter } from './adapters/FirebaseAdapter';
import { MockAdapter } from './adapters/MockAdapter';
import { validateFirebaseConfig } from './config';

// Tipo de base de datos disponibles
export type DatabaseType = 'firebase' | 'mock';

/**
 * Servicio centralizado de base de datos
 * Permite cambiar fácilmente entre diferentes proveedores
 */
class DatabaseService {
  private adapter: DatabaseAdapter | null = null;
  private currentType: DatabaseType | null = null;

  /**
   * Inicializa el servicio de base de datos con el adaptador especificado
   * @param type - Tipo de base de datos ('firebase' | 'mock')
   */
  async initialize(type: DatabaseType = 'firebase'): Promise<void> {
    // Si ya está inicializado con el mismo tipo, no hacer nada
    if (this.adapter && this.currentType === type) {
      console.log(`✅ Database already initialized with ${type}`);
      return;
    }

    // Desconectar adaptador anterior si existe
    if (this.adapter) {
      console.log(`Disconnecting previous ${this.currentType} adapter...`);
      await this.adapter.disconnect();
      this.adapter = null;
      this.currentType = null;
    }

    // Crear nuevo adaptador según el tipo
    switch (type) {
      case 'firebase':
        if (!validateFirebaseConfig()) {
          console.warn('⚠️ Firebase config invalid, falling back to Mock adapter');
          this.adapter = new MockAdapter();
          this.currentType = 'mock';
        } else {
          this.adapter = new FirebaseAdapter();
          this.currentType = 'firebase';
        }
        break;

      case 'mock':
        this.adapter = new MockAdapter();
        this.currentType = 'mock';
        break;

      default:
        throw new Error(`Unknown database type: ${type}`);
    }

    // Inicializar el adaptador
    await this.adapter.initialize();
    console.log(`✅ Database service initialized with ${this.currentType} adapter`);
  }

  /**
   * Obtiene el adaptador actual
   * Lanza error si no está inicializado
   */
  getAdapter(): DatabaseAdapter {
    if (!this.adapter) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.adapter;
  }

  /**
   * Obtiene el tipo de base de datos actual
   */
  getCurrentType(): DatabaseType | null {
    return this.currentType;
  }

  /**
   * Desconecta el servicio de base de datos
   */
  async disconnect(): Promise<void> {
    if (this.adapter) {
      await this.adapter.disconnect();
      this.adapter = null;
      this.currentType = null;
    }
  }

  /**
   * Cambia el tipo de base de datos en tiempo de ejecución
   * @param type - Nuevo tipo de base de datos
   */
  async switchDatabase(type: DatabaseType): Promise<void> {
    console.log(`Switching database from ${this.currentType} to ${type}`);
    await this.initialize(type);
  }
}

// Exportar instancia singleton
export const db = new DatabaseService();
