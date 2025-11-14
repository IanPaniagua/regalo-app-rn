# Database Service - Arquitectura Modular

Esta es una capa de abstracción de base de datos completamente modular que te permite cambiar fácilmente entre diferentes proveedores (Firebase, MongoDB, Supabase, etc.) sin modificar el código de tu aplicación.

## 🏗️ Arquitectura

```
src/database/
├── types.ts              # Interfaces y tipos compartidos
├── config.ts             # Configuración de Firebase
├── DatabaseService.ts    # Servicio principal (Singleton)
├── index.ts              # Punto de entrada único
└── adapters/
    ├── FirebaseAdapter.ts  # Implementación para Firebase
    └── MockAdapter.ts      # Implementación mock para desarrollo
```

## 🚀 Uso Básico

### 1. Inicializar el servicio

```typescript
import { db } from '@/src/database';

// En tu componente raíz o App.tsx
useEffect(() => {
  const initDB = async () => {
    // Usar Firebase (producción)
    await db.initialize('firebase');
    
    // O usar Mock (desarrollo/testing)
    // await db.initialize('mock');
  };
  
  initDB();
}, []);
```

### 2. Usar el servicio en tu aplicación

```typescript
import { db } from '@/src/database';

// Crear usuario
const newUser = await db.getAdapter().createUser({
  name: 'Juan Pérez',
  email: 'juan@ejemplo.com',
  birthdate: new Date(1990, 5, 15),
  hobbies: ['Deportes', 'Lectura'],
  avatar: '👤',
});

// Obtener usuario por email
const user = await db.getAdapter().getUserByEmail('juan@ejemplo.com');

// Obtener cumpleaños de un día específico
const birthdays = await db.getAdapter().getBirthdaysByDate(new Date(2024, 10, 15));

// Actualizar usuario
await db.getAdapter().updateUser(user.id, {
  hobbies: ['Deportes', 'Lectura', 'Música'],
});

// Eliminar usuario
await db.getAdapter().deleteUser(user.id);
```

## 🔄 Cambiar de Base de Datos

### En tiempo de desarrollo
```typescript
// Cambiar a Mock para testing
await db.switchDatabase('mock');

// Volver a Firebase
await db.switchDatabase('firebase');
```

### Cambiar permanentemente
Solo necesitas modificar una línea en tu inicialización:

```typescript
// De Firebase
await db.initialize('firebase');

// A Mock
await db.initialize('mock');
```

## 🔌 Añadir un Nuevo Adaptador

Para añadir soporte para otra base de datos (ej: Supabase, MongoDB):

### 1. Crear el adaptador

```typescript
// src/database/adapters/SupabaseAdapter.ts
import { DatabaseAdapter, User, BirthdayEvent } from '../types';
import { createClient } from '@supabase/supabase-js';

export class SupabaseAdapter implements DatabaseAdapter {
  private client: any;
  
  async initialize(): Promise<void> {
    this.client = createClient(
      process.env.EXPO_PUBLIC_SUPABASE_URL!,
      process.env.EXPO_PUBLIC_SUPABASE_KEY!
    );
  }
  
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const { data, error } = await this.client
      .from('users')
      .insert([userData])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
  
  // ... implementar resto de métodos
}
```

### 2. Registrar en DatabaseService

```typescript
// src/database/DatabaseService.ts
import { SupabaseAdapter } from './adapters/SupabaseAdapter';

export type DatabaseType = 'firebase' | 'mock' | 'supabase'; // Añadir nuevo tipo

// En el switch del método initialize:
case 'supabase':
  this.adapter = new SupabaseAdapter();
  this.currentType = 'supabase';
  break;
```

### 3. Usar el nuevo adaptador

```typescript
await db.initialize('supabase');
```

## 📋 API Completa

### Métodos de Usuario

- `createUser(userData)` - Crear nuevo usuario
- `getUser(id)` - Obtener usuario por ID
- `getUserByEmail(email)` - Obtener usuario por email
- `updateUser(id, data)` - Actualizar usuario
- `deleteUser(id)` - Eliminar usuario
- `getAllUsers()` - Obtener todos los usuarios

### Métodos de Cumpleaños

- `getBirthdaysByDate(date)` - Obtener cumpleaños de un día específico
- `getBirthdaysByMonth(year, month)` - Obtener cumpleaños de un mes

### Métodos de Utilidad

- `initialize()` - Inicializar conexión
- `disconnect()` - Cerrar conexión

## 🔒 Variables de Entorno

Asegúrate de tener estas variables en tu `.env.local`:

```env
# Firebase
EXPO_PUBLIC_FIREBASE_API_KEY=tu_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

## ✅ Ventajas de esta Arquitectura

1. **Modular**: Cambia de base de datos sin tocar el código de la app
2. **Testeable**: Usa Mock adapter para tests sin conexión real
3. **Type-safe**: TypeScript garantiza consistencia
4. **Escalable**: Añade nuevos adaptadores fácilmente
5. **Singleton**: Una sola instancia de conexión en toda la app
6. **Fallback automático**: Si Firebase falla, usa Mock automáticamente

## 🧪 Testing

```typescript
// En tus tests
beforeAll(async () => {
  await db.initialize('mock');
});

afterAll(async () => {
  await db.disconnect();
});

test('crear usuario', async () => {
  const user = await db.getAdapter().createUser({
    name: 'Test User',
    email: 'test@test.com',
    birthdate: new Date(),
    hobbies: [],
  });
  
  expect(user.id).toBeDefined();
  expect(user.name).toBe('Test User');
});
```

## 📝 Notas

- El servicio usa un patrón Singleton para garantizar una sola conexión
- Firebase convierte automáticamente Date ↔ Timestamp
- Mock adapter guarda datos en memoria (se pierden al reiniciar)
- Todos los métodos son asíncronos y devuelven Promises
