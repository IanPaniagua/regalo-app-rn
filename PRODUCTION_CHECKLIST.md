# 🚀 Checklist de Producción - Regalo App

## 📱 Configuración iOS

### Requisitos previos:
- [x] Apple Developer Account ($99/año)
- [ ] Certificados de desarrollo y distribución
- [ ] Provisioning Profiles configurados

### Pasos:
1. **Configurar en app.json**:
```json
"ios": {
  "supportsTablet": true,
  "bundleIdentifier": "com.manolodev.regalo-app",
  "googleServicesFile": "./GoogleService-Info.plist",
  "buildNumber": "1",
  "infoPlist": {
    "NSPhotoLibraryUsageDescription": "Regalo App necesita acceso a tus fotos para seleccionar imágenes de perfil.",
    "NSCameraUsageDescription": "Regalo App necesita acceso a tu cámara para tomar fotos de perfil.",
    "NSUserTrackingUsageDescription": "Regalo App usa esta información para mejorar tu experiencia."
  }
}
```

2. **Build iOS**:
```bash
# Preview (TestFlight)
eas build --platform ios --profile preview

# Production (App Store)
eas build --platform ios --profile production
```

3. **Submit a App Store**:
```bash
eas submit --platform ios
```

---

## 🤖 Configuración Android

### Requisitos previos:
- [ ] Google Play Console Account ($25 una vez)
- [ ] Keystore configurado (EAS lo crea automáticamente)

### Pasos:
1. **Configurar en app.json**:
```json
"android": {
  "package": "com.manolodev.regaloapp",
  "versionCode": 1,
  "googleServicesFile": "./google-services.json",
  "permissions": [
    "CAMERA",
    "READ_EXTERNAL_STORAGE",
    "WRITE_EXTERNAL_STORAGE",
    "NOTIFICATIONS"
  ],
  "adaptiveIcon": {
    "backgroundColor": "#E6F4FE",
    "foregroundImage": "./assets/images/android-icon-foreground.png",
    "backgroundImage": "./assets/images/android-icon-background.png",
    "monochromeImage": "./assets/images/android-icon-monochrome.png"
  }
}
```

2. **Build Android**:
```bash
# APK para testing
eas build --platform android --profile preview

# AAB para Play Store
eas build --platform android --profile production
```

3. **Submit a Play Store**:
```bash
eas submit --platform android
```

---

## 🎨 Assets Requeridos

### Iconos:
- [ ] `icon.png` - 1024x1024px (app icon principal)
- [ ] `splash-icon.png` - Logo para splash screen
- [ ] `favicon.png` - 48x48px (para web)

### Android Adaptive Icons:
- [ ] `android-icon-foreground.png` - 1024x1024px
- [ ] `android-icon-background.png` - 1024x1024px  
- [ ] `android-icon-monochrome.png` - 1024x1024px

### Verificar:
```bash
ls -la assets/images/
```

---

## 🔐 Variables de Entorno

### Archivo `.env`:
```bash
# Firebase
EXPO_PUBLIC_FIREBASE_API_KEY=your_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### ⚠️ IMPORTANTE:
- [ ] NO commitear `.env` al repositorio
- [ ] Añadir `.env` a `.gitignore`
- [ ] Configurar secrets en EAS:
```bash
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_API_KEY --value "your_key"
# Repetir para cada variable
```

---

## 🧪 Testing Pre-Producción

### 1. Testing Local:
```bash
# iOS
npx expo run:ios --configuration Release

# Android
npx expo run:android --variant release
```

### 2. Testing con EAS Build:
```bash
# Build de preview
eas build --platform all --profile preview

# Instalar en dispositivo de prueba
# iOS: TestFlight
# Android: Descargar APK desde EAS
```

### 3. Checklist de Testing:
- [ ] Login/Registro funciona
- [ ] Notificaciones push funcionan
- [ ] Calendario muestra cumpleaños correctamente
- [ ] Conexiones entre usuarios funcionan
- [ ] Invitaciones por email funcionan
- [ ] Perfil se actualiza correctamente
- [ ] App funciona sin conexión (datos en caché)
- [ ] No hay crashes en producción

---

## 📊 Monitoreo Post-Lanzamiento

### Herramientas recomendadas:
1. **Sentry** - Error tracking
2. **Firebase Analytics** - Métricas de uso
3. **Firebase Crashlytics** - Crash reports

### Configurar Sentry (opcional):
```bash
npm install @sentry/react-native
npx @sentry/wizard -i reactNative -p ios android
```

---

## 🚀 Comandos Rápidos

### Build completo (ambas plataformas):
```bash
eas build --platform all --profile production
```

### Submit completo:
```bash
eas submit --platform all
```

### Ver builds:
```bash
eas build:list
```

### Ver submissions:
```bash
eas submit:list
```

---

## ⚡ Optimizaciones Implementadas

### Caché:
- ✅ `expo-image` con `memory-disk` cache
- ✅ `AppContainer` memoizado
- ✅ Background image con caché agresivo
- ✅ AsyncStorage para preferencias

### Performance:
- ✅ React Compiler habilitado
- ✅ Typed routes para navegación
- ✅ Lazy loading de contextos
- ✅ FCM con delay para evitar race conditions

### Seguridad:
- ✅ Firebase Auth con AsyncStorage persistence
- ✅ Tokens FCM guardados en Firestore
- ✅ Validación de invitaciones con expiración
- ✅ Límites de cambios diarios en perfil

---

## 📝 Notas Finales

### Versioning:
- Incrementar `version` en `app.json` para cada release
- Incrementar `buildNumber` (iOS) y `versionCode` (Android)

### Store Listings:
- Preparar screenshots (mínimo 3 por plataforma)
- Escribir descripción de la app
- Definir keywords para SEO
- Preparar privacy policy URL

### Soporte:
- Configurar email de soporte
- Preparar FAQ
- Documentar flujos principales

---

## 🎯 Siguiente Paso

```bash
# 1. Verificar assets
ls -la assets/images/

# 2. Build de preview para testing
eas build --platform all --profile preview

# 3. Cuando esté listo:
eas build --platform all --profile production
eas submit --platform all
```
