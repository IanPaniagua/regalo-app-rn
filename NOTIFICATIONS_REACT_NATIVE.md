# 📱 React Native - Push Notifications Setup

## Integración de Notificaciones Push en la App

Este documento explica cómo integrar las notificaciones push en tu app React Native.

---

## 📦 PASO 1: Instalar Dependencias

```bash
# Desde la raíz del proyecto
npx expo install expo-notifications expo-device expo-constants
```

---

## 🔧 PASO 2: Configurar app.json

Agrega la configuración de notificaciones en `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#D4AF37",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ],
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#D4AF37",
      "androidMode": "default",
      "androidCollapsedTitle": "Regalo App"
    },
    "android": {
      "googleServicesFile": "./google-services.json"
    },
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    }
  }
}
```

---

## 📄 PASO 3: Descargar Archivos de Configuración

### Android: google-services.json

1. Firebase Console → Project Settings → General
2. Scroll down a "Your apps"
3. Click en el ícono de Android
4. Download `google-services.json`
5. Colócalo en la raíz del proyecto

### iOS: GoogleService-Info.plist

1. Firebase Console → Project Settings → General
2. Click en el ícono de iOS
3. Download `GoogleService-Info.plist`
4. Colócalo en la raíz del proyecto

---

## 💻 PASO 4: Código ya creado ✅

Ya he creado los siguientes archivos:

1. **`src/context/NotificationsContext.tsx`** - Context para manejar notificaciones
2. **`src/database/types.ts`** - Actualizado con campos `fcmToken` y `fcmTokenUpdatedAt`
3. **`app/_layout.tsx`** - Actualizado con `NotificationsProvider`

---

## 🔔 PASO 5: Solicitar Permisos al Usuario

Puedes solicitar permisos en cualquier pantalla. Ejemplo en el Profile:

```typescript
import { useNotifications } from '@/src/context/NotificationsContext';

export default function ProfileScreen() {
  const { requestPermissions, isPermissionGranted } = useNotifications();

  const handleEnableNotifications = async () => {
    const granted = await requestPermissions();
    if (granted) {
      Alert.alert('✅ Notificaciones activadas', 'Recibirás recordatorios de cumpleaños');
    } else {
      Alert.alert('❌ Permisos denegados', 'No podrás recibir notificaciones');
    }
  };

  return (
    <View>
      {!isPermissionGranted && (
        <AppButton
          title="Activar notificaciones"
          onPress={handleEnableNotifications}
        />
      )}
    </View>
  );
}
```

---

## 🧪 PASO 6: Testing

### Test Local (sin Cloud Functions)

```typescript
import * as Notifications from 'expo-notifications';

// Programar notificación de prueba
await Notifications.scheduleNotificationAsync({
  content: {
    title: "🎉 ¡Hoy es el cumpleaños de Juan!",
    body: "Cumple 25 años. No olvides felicitarlo 🎂",
    data: { type: 'birthday', userId: 'test-123' },
  },
  trigger: { seconds: 5 }, // En 5 segundos
});
```

### Test con Cloud Functions

1. Despliega las Cloud Functions
2. Abre la app en un dispositivo físico
3. Acepta permisos de notificaciones
4. Verifica que el token se guarde en Firestore:
   ```
   Firestore → users → [tu-user-id] → fcmToken
   ```
5. Llama a la función de test:
   ```bash
   curl https://europe-west1-regalo-app-a22e4.cloudfunctions.net/testBirthdayNotifications
   ```

---

## 📱 Flujo Completo

```
Usuario abre la app
  ├─ NotificationsContext se inicializa
  ├─ Solicita permisos (si no los tiene)
  │
Usuario acepta permisos
  ├─ Obtiene Expo Push Token
  ├─ Guarda token en Firestore (campo fcmToken)
  │
Cloud Function se ejecuta (9:00 AM diaria)
  ├─ Lee cumpleaños del día desde Firestore
  ├─ Para cada cumpleaños:
  │   ├─ Encuentra conexiones del usuario
  │   ├─ Obtiene tokens FCM de conexiones
  │   └─ Envía notificación push
  │
Usuario recibe notificación
  ├─ Toca la notificación
  └─ App navega a la pantalla correspondiente
```

---

## 🌍 Zona Horaria

Las notificaciones se envían en **hora de Alemania (CET/CEST)**:
- **9:00 AM** - Notificaciones diarias
- **10:00 AM** - Resumen mensual (día 28)

Esto funciona automáticamente para España también (misma zona horaria).

---

## 🔍 Troubleshooting

### "No recibo notificaciones"

1. **Verifica permisos:**
   ```typescript
   const { status } = await Notifications.getPermissionsAsync();
   console.log('Permission status:', status);
   ```

2. **Verifica token en Firestore:**
   - Firebase Console → Firestore → users → [user-id]
   - Debe tener campo `fcmToken`

3. **Verifica logs de Cloud Functions:**
   ```bash
   firebase functions:log
   ```

4. **Usa dispositivo físico:**
   - Notificaciones push NO funcionan en simulador/emulador

### "Token no se guarda en Firestore"

- Verifica que el usuario esté autenticado
- Verifica reglas de Firestore (deben permitir escritura en `users`)
- Revisa logs de la app

### "Cloud Functions fallan"

- Verifica que el plan Blaze esté activo
- Verifica que Cloud Messaging API esté habilitada
- Revisa logs: `firebase functions:log`

---

## 💰 Costos

### Notificaciones Push (FCM)
- **Gratis** - Sin límite de notificaciones

### Cloud Functions
- **Tier gratuito:** 2M invocaciones/mes
- **Tu uso:** ~30-300 invocaciones/mes
- **Costo:** $0 (dentro del tier gratuito)

### Estimación con 10,000 usuarios:
- Invocaciones diarias: ~10
- Invocaciones mensuales: ~300
- **Costo total: $0** ✅

---

## ✅ Checklist Final

- [ ] Dependencias instaladas (`expo-notifications`, `expo-device`, `expo-constants`)
- [ ] `app.json` configurado con plugin de notificaciones
- [ ] `google-services.json` descargado y colocado en raíz (Android)
- [ ] `GoogleService-Info.plist` descargado y colocado en raíz (iOS)
- [ ] `NotificationsContext` creado
- [ ] `NotificationsProvider` agregado a `_layout.tsx`
- [ ] Tipo `User` actualizado con `fcmToken`
- [ ] Cloud Functions desplegadas
- [ ] Permisos solicitados en la app
- [ ] Token guardado en Firestore
- [ ] Notificación de prueba recibida ✨

---

## 🚀 Próximos Pasos

1. **Instalar dependencias:**
   ```bash
   npx expo install expo-notifications expo-device expo-constants
   ```

2. **Descargar archivos de configuración:**
   - `google-services.json` (Android)
   - `GoogleService-Info.plist` (iOS)

3. **Configurar `app.json`** (ver arriba)

4. **Rebuild de la app:**
   ```bash
   npx expo prebuild --clean
   npx expo run:ios
   # o
   npx expo run:android
   ```

5. **Desplegar Cloud Functions:**
   ```bash
   cd functions
   npm install
   npm run build
   firebase deploy --only functions
   ```

6. **Testing en dispositivo físico**

---

## 📚 Recursos

- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Firebase Cloud Functions](https://firebase.google.com/docs/functions)
- [Cron Schedule Format](https://crontab.guru/)

---

¡Listo! Ahora tienes un sistema completo de notificaciones push escalable para miles de usuarios. 🎉
