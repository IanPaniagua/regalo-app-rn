# Firebase Setup Instructions

## 1. Habilitar Autenticación Anónima (Recomendado)

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Authentication** → **Sign-in method**
4. Habilita **Anonymous**
5. Guarda

## 2. Configurar Reglas de Firestore

### Opción A: Desarrollo (Acceso abierto - SOLO PARA DESARROLLO)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Opción B: Con Autenticación (Recomendado para producción)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      // Permitir solo usuarios autenticados
      allow read, write: if request.auth != null;
    }
  }
}
```

### Opción C: Reglas Específicas (Más seguro)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios: solo lectura propia y escritura propia
    match /users/{userId} {
      allow read: if true; // Cualquiera puede leer usuarios
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Conexiones: solo usuarios autenticados
    match /connections/{connectionId} {
      allow read, write: if request.auth != null;
    }
    
    // Invitaciones: solo usuarios autenticados
    match /connection_invitations/{invitationId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 3. Aplicar las Reglas

1. Ve a **Firestore Database** → **Rules**
2. Copia y pega las reglas que prefieras
3. Click en **Publish**

## Estado Actual

- ✅ Firebase inicializado
- ⚠️ Auth anónima deshabilitada (opcional)
- ❌ Reglas de Firestore muy restrictivas

## Solución Rápida

Para desarrollo rápido, usa la **Opción A** (acceso abierto).
Para producción, usa la **Opción B** o **Opción C** y habilita autenticación anónima.
