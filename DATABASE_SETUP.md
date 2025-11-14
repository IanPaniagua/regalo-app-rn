# 🗄️ Configuración de Base de Datos

## 🚀 Inicio Rápido

### Cambiar entre Mock y Firebase

Edita `src/database/database.config.ts`:

```typescript
// Para desarrollo (Mock - datos en memoria)
export const DATABASE_TYPE: DatabaseType = 'mock';

// Para producción (Firebase)
export const DATABASE_TYPE: DatabaseType = 'firebase';
```

## 📋 Configuración Actual

**Base de datos activa**: `mock` (desarrollo)

## 🔧 Configurar Firebase

### 1. Variables de Entorno

Asegúrate de que `.env.local` tenga las credenciales correctas:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=tu_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

### 2. Estructura de Firestore

La app creará automáticamente esta estructura:

```
firestore/
└── users/
    └── {userId}/
        ├── name: string
        ├── email: string
        ├── birthdate: timestamp
        ├── hobbies: array
        ├── avatar: string
        ├── createdAt: timestamp
        └── updatedAt: timestamp
```

### 3. Reglas de Firestore (Recomendadas)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios
    match /users/{userId} {
      // Permitir lectura a todos los usuarios autenticados
      allow read: if request.auth != null;
      
      // Permitir escritura solo al propietario
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🧪 Testing

### Usar Mock para Tests

```typescript
import { db } from '@/src/database';

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
    hobbies: ['Testing'],
  });
  
  expect(user.id).toBeDefined();
});
```

## 📊 Monitoreo

### Ver qué base de datos está activa

```typescript
import { db } from '@/src/database';

console.log('Database type:', db.getCurrentType()); // 'mock' o 'firebase'
```

### Cambiar en tiempo de ejecución (para debugging)

```typescript
// Cambiar a Mock
await db.switchDatabase('mock');

// Cambiar a Firebase
await db.switchDatabase('firebase');
```

## 🔄 Migración de Datos

### De Mock a Firebase

1. Exporta datos de Mock:
```typescript
const users = await db.getAdapter().getAllUsers();
console.log(JSON.stringify(users, null, 2));
```

2. Cambia a Firebase:
```typescript
await db.switchDatabase('firebase');
```

3. Importa datos:
```typescript
for (const user of users) {
  await db.getAdapter().createUser(user);
}
```

## ⚠️ Troubleshooting

### Error: "Database not initialized"
- Asegúrate de que `db.initialize()` se llame en `app/_layout.tsx`
- Verifica que la app haya terminado de cargar

### Firebase no conecta
- Verifica las variables de entorno en `.env.local`
- Revisa que el proyecto de Firebase esté activo
- Comprueba las reglas de Firestore
- La app automáticamente usará Mock como fallback

### Datos no aparecen en el calendario
- Verifica que los usuarios tengan `birthdate` válido
- Llama a `refreshUsers()` desde `BirthdaysContext`
- Comprueba los logs en la consola

## 📝 Logs Útiles

La app muestra estos logs en la consola:

- `✅ Database initialized: mock` - Base de datos iniciada correctamente
- `✅ User created: {id}` - Usuario creado
- `✅ Loaded X users from database` - Usuarios cargados
- `⚠️ Fallback to Mock database` - Firebase falló, usando Mock
- `❌ Error ...` - Error en operación

## 🎯 Próximos Pasos

1. **Desarrollo**: Usa `mock` para desarrollo rápido
2. **Testing**: Mantén `mock` para tests automatizados
3. **Staging**: Cambia a `firebase` para pruebas con datos reales
4. **Producción**: Asegúrate de usar `firebase` con reglas de seguridad

## 📚 Documentación Completa

Ver `src/database/README.md` para documentación técnica completa.
