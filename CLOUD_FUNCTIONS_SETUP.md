# 🚀 Cloud Functions Setup - Regalo App

## Configuración de Notificaciones Push con Firebase

Este documento explica cómo configurar y desplegar las Cloud Functions para enviar notificaciones de cumpleaños.

---

## 📋 Prerrequisitos

1. **Firebase CLI instalado:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Proyecto Firebase configurado** (ya lo tienes)

3. **Plan Blaze activado** en Firebase Console:
   - Ve a Firebase Console → Billing
   - Upgrade a "Blaze (Pay as you go)"
   - **No te preocupes:** El tier gratuito es muy generoso
   - Hasta 2M invocaciones/mes gratis

---

## 🔧 PASO 1: Configurar Firebase Console

### 1.1 Habilitar Cloud Messaging

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: `regalo-app-a22e4`
3. **Project Settings** → **Cloud Messaging** tab
4. Habilita **Cloud Messaging API (V1)**
5. Copia el **Server Key** (lo necesitarás después)

### 1.2 Habilitar Cloud Functions

1. En Firebase Console → **Functions**
2. Click en **Get Started**
3. Upgrade a plan **Blaze** si no lo has hecho

---

## 💻 PASO 2: Instalar Dependencias

```bash
cd functions
npm install
```

Esto instalará:
- `firebase-functions` - SDK para Cloud Functions
- `firebase-admin` - SDK para acceder a Firestore y FCM
- `typescript` - Compilador TypeScript

---

## 🔑 PASO 3: Inicializar Firebase (si no lo has hecho)

```bash
# Desde la raíz del proyecto
firebase login
firebase init functions
```

Selecciona:
- ✅ TypeScript
- ✅ ESLint (opcional)
- ❌ No instalar dependencias ahora (ya lo hiciste)

---

## 🚀 PASO 4: Desplegar Cloud Functions

```bash
# Compilar TypeScript
cd functions
npm run build

# Desplegar a Firebase
firebase deploy --only functions
```

Esto desplegará 3 funciones:
1. **sendDailyBirthdayReminders** - Se ejecuta diariamente a las 9:00 AM
2. **sendMonthlyBirthdaySummary** - Se ejecuta el día 28 de cada mes a las 10:00 AM
3. **testBirthdayNotifications** - Función HTTP para testing

---

## 🧪 PASO 5: Testing

### Opción A: Función de Test HTTP

```bash
# Obtén la URL de la función
firebase functions:config:get

# Llama a la función de test
curl https://europe-west1-regalo-app-a22e4.cloudfunctions.net/testBirthdayNotifications
```

### Opción B: Emulador Local

```bash
cd functions
npm run serve
```

Esto inicia el emulador local en `http://localhost:5001`

---

## 📊 Monitoreo

### Ver Logs en Tiempo Real

```bash
firebase functions:log
```

### Ver Logs en Firebase Console

1. Firebase Console → **Functions**
2. Click en una función
3. **Logs** tab

---

## 🌍 Configuración de Zona Horaria

Las funciones están configuradas para **Europa/Berlín** (Alemania):

```typescript
.timeZone('Europe/Berlin')
```

**Horarios:**
- **9:00 AM CET/CEST** - Notificaciones diarias de cumpleaños
- **10:00 AM CET/CEST** - Resumen mensual (día 28)

Para cambiar a España (misma zona horaria):
- No necesitas cambiar nada, CET/CEST es la misma zona

---

## 💰 Costos Estimados

### Tier Gratuito (Blaze Plan)
- **2,000,000** invocaciones/mes gratis
- **400,000** GB-segundos gratis
- **200,000** GHz-segundos gratis

### Tu Uso Estimado
Con **1,000 usuarios**:
- Notificaciones diarias: ~30 invocaciones/mes
- Notificaciones mensuales: ~1 invocación/mes
- **Total: ~31 invocaciones/mes** ✅ Muy por debajo del límite

Con **10,000 usuarios**:
- **Total: ~310 invocaciones/mes** ✅ Aún gratis

Con **100,000 usuarios**:
- **Total: ~3,100 invocaciones/mes**
- Costo adicional: ~$0.40/mes (después del tier gratuito)

---

## 🔍 Troubleshooting

### Error: "Insufficient permissions"
```bash
firebase login --reauth
```

### Error: "Billing account not configured"
- Ve a Firebase Console → Billing
- Activa el plan Blaze

### Funciones no se ejecutan
- Verifica los logs: `firebase functions:log`
- Verifica que las funciones estén desplegadas: Firebase Console → Functions

### Notificaciones no llegan
- Verifica que los usuarios tengan `fcmToken` en Firestore
- Verifica permisos de notificaciones en la app
- Revisa los logs para errores

---

## 📱 Siguiente Paso: Integrar en React Native

Ahora necesitas:
1. Instalar `expo-notifications` en la app
2. Solicitar permisos de notificaciones
3. Obtener FCM token
4. Guardar token en Firestore (campo `fcmToken` en `users`)

Continúa con el siguiente archivo: `NOTIFICATIONS_REACT_NATIVE.md`

---

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs: `firebase functions:log`
2. Verifica Firebase Console → Functions
3. Prueba con el emulador local primero
4. Verifica que Firestore tenga datos de prueba

---

## ✅ Checklist de Configuración

- [ ] Firebase CLI instalado
- [ ] Plan Blaze activado
- [ ] Cloud Messaging API habilitada
- [ ] Dependencias instaladas (`npm install`)
- [ ] Funciones desplegadas (`firebase deploy --only functions`)
- [ ] Función de test ejecutada exitosamente
- [ ] Logs verificados (sin errores)
- [ ] Listo para integrar en React Native ✨
