# 📚 Guía de Documentación - RegaloApp

> **Propósito**: Este documento sirve como índice estructurado para documentar todo el código de RegaloApp. Marca cada sección conforme la documentes.

---

## 📋 Índice General

- [1. Configuración del Proyecto](#1-configuración-del-proyecto)
- [2. Arquitectura de la Aplicación](#2-arquitectura-de-la-aplicación)
- [3. Navegación y Rutas](#3-navegación-y-rutas)
- [4. Contextos y Estado Global](#4-contextos-y-estado-global)
- [5. Base de Datos y Servicios](#5-base-de-datos-y-servicios)
- [6. Componentes UI](#6-componentes-ui)
- [7. Pantallas (Screens)](#7-pantallas-screens)
- [8. Tema y Estilos](#8-tema-y-estilos)
- [9. Hooks Personalizados](#9-hooks-personalizados)
- [10. Tipos y Interfaces](#10-tipos-y-interfaces)
- [11. Firebase y Cloud Functions](#11-firebase-y-cloud-functions)
- [12. Configuración de Plataformas](#12-configuración-de-plataformas)

---

## 1. Configuración del Proyecto

### 1.1 Archivos de Configuración Principal
- [ ] `package.json` - Dependencias y scripts del proyecto
- [ ] `app.json` - Configuración de Expo
- [ ] `tsconfig.json` - Configuración de TypeScript
- [ ] `babel.config.js` - Configuración de Babel
- [ ] `tailwind.config.js` - Configuración de TailwindCSS/NativeWind
- [ ] `eas.json` - Configuración de Expo Application Services

### 1.2 Variables de Entorno
- [ ] `.env` - Variables de entorno (Firebase, API keys, etc.)

### 1.3 Documentación Existente
- [ ] `README.md` - Introducción al proyecto
- [ ] `STYLE_GUIDE.md` - Guía de estilos
- [ ] `TODO.md` - Lista de tareas pendientes
- [ ] `FIREBASE_SETUP.md` - Configuración de Firebase
- [ ] `DATABASE_SETUP.md` - Configuración de base de datos
- [ ] `CLOUD_FUNCTIONS_SETUP.md` - Configuración de Cloud Functions
- [ ] `NOTIFICATIONS_REACT_NATIVE.md` - Notificaciones en React Native
- [ ] `NOTIFICATIONS_SUMMARY.md` - Resumen de notificaciones
- [ ] `PRODUCTION_CHECKLIST.md` - Checklist para producción

---

## 2. Arquitectura de la Aplicación

### 2.1 Estructura de Carpetas
- [ ] Documentar estructura general del proyecto
- [ ] Explicar convenciones de nombres
- [ ] Describir organización de archivos

### 2.2 Patrones de Diseño
- [ ] Context API para estado global
- [ ] Adapter Pattern para base de datos
- [ ] Component composition
- [ ] Custom hooks

---

## 3. Navegación y Rutas

### 3.1 Layout Principal
- [ ] `app/_layout.tsx` - Layout raíz de la aplicación

### 3.2 Navegación por Drawer
- [ ] `app/(drawer)/_layout.tsx` - Layout del drawer
- [ ] `app/(drawer)/account.tsx` - Pantalla de cuenta
- [ ] `app/(drawer)/calendar.tsx` - Pantalla de calendario (drawer)
- [ ] `app/(drawer)/logout.tsx` - Funcionalidad de logout
- [ ] `app/(drawer)/privacy.tsx` - Pantalla de privacidad
- [ ] `app/(drawer)/profile.tsx` - Pantalla de perfil (drawer)
- [ ] `app/(drawer)/settings.tsx` - Pantalla de configuración

### 3.3 Navegación por Tabs
- [ ] `app/(drawer)/(tabs)/_layout.tsx` - Layout de tabs
- [ ] `app/(drawer)/(tabs)/calendar.tsx` - Tab de calendario
- [ ] `app/(drawer)/(tabs)/connect.tsx` - Tab de conexiones
- [ ] `app/(drawer)/(tabs)/profile.tsx` - Tab de perfil

### 3.4 Flujo de Autenticación
- [ ] `app/index.tsx` - Pantalla inicial
- [ ] `app/welcome.tsx` - Pantalla de bienvenida
- [ ] `app/login.tsx` - Pantalla de login
- [ ] `app/forgot-password.tsx` - Recuperación de contraseña

### 3.5 Flujo de Creación de Perfil
- [ ] `app/create-profile/_layout.tsx` - Layout del flujo
- [ ] `app/create-profile/index.tsx` - Inicio del flujo
- [ ] `app/create-profile/username.tsx` - Selección de username
- [ ] `app/create-profile/email.tsx` - Configuración de email
- [ ] `app/create-profile/avatar.tsx` - Selección de avatar
- [ ] `app/create-profile/hobbies.tsx` - Selección de hobbies
- [ ] `app/create-profile/gift-preferences.tsx` - Preferencias de regalos

### 3.6 Otras Rutas
- [ ] `app/invite/[id].tsx` - Pantalla de invitación dinámica
- [ ] `app/modal.tsx` - Modal genérico

---

## 4. Contextos y Estado Global

### 4.1 Context Providers
- [ ] `src/context/UserContext.tsx` - Gestión del usuario autenticado
- [ ] `src/context/ConnectionsContext.tsx` - Gestión de conexiones entre usuarios
- [ ] `src/context/BirthdaysContext.tsx` - Gestión de cumpleaños
- [ ] `src/context/NotificationsContext.tsx` - Gestión de notificaciones
- [ ] `src/context/LanguageContext.tsx` - Gestión de idioma/internacionalización

### 4.2 Integración de Contextos
- [ ] Documentar cómo se integran los contextos
- [ ] Explicar el flujo de datos entre contextos
- [ ] Describir dependencias entre contextos

---

## 5. Base de Datos y Servicios

### 5.1 Capa de Base de Datos
- [ ] `src/database/index.ts` - Exportaciones principales
- [ ] `src/database/DatabaseService.ts` - Servicio principal de base de datos
- [ ] `src/database/types.ts` - Tipos de base de datos
- [ ] `src/database/config.ts` - Configuración de base de datos
- [ ] `src/database/database.config.ts` - Configuración adicional
- [ ] `src/database/README.md` - Documentación de la capa de datos

### 5.2 Adapters
- [ ] `src/database/adapters/FirebaseAdapter.ts` - Adapter para Firebase
- [ ] `src/database/adapters/MockAdapter.ts` - Adapter para testing/desarrollo

### 5.3 Servicios
- [ ] `src/services/firebase.ts` - Inicialización y configuración de Firebase
- [ ] `src/services/auth.service.ts` - Servicio de autenticación

### 5.4 Patrones de Acceso a Datos
- [ ] Documentar operaciones CRUD
- [ ] Explicar manejo de errores
- [ ] Describir estrategias de caché

---

## 6. Componentes UI

### 6.1 Componentes Base (UI System)
- [ ] `src/components/ui/index.ts` - Exportaciones de componentes UI
- [ ] `src/components/ui/AppButton.tsx` - Botón personalizado
- [ ] `src/components/ui/AppCard.tsx` - Card personalizada
- [ ] `src/components/ui/AppContainer.tsx` - Container personalizado
- [ ] `src/components/ui/AppSection.tsx` - Sección personalizada
- [ ] `src/components/ui/AppStatusBar.tsx` - Status bar personalizada
- [ ] `src/components/ui/AppText.tsx` - Texto personalizado
- [ ] `src/components/ui/AppTitle.tsx` - Título personalizado

### 6.2 Componentes Funcionales
- [ ] `src/components/BirthdayNotificationModal.tsx` - Modal de notificación de cumpleaños
- [ ] `src/components/CelebrationModal.tsx` - Modal de celebración
- [ ] `src/components/HeaderLogo.tsx` - Logo del header
- [ ] `src/components/InAppNotification.tsx` - Notificación in-app
- [ ] `src/components/UserProfileModal.tsx` - Modal de perfil de usuario

### 6.3 Componentes Legacy/Expo
- [ ] `components/external-link.tsx`
- [ ] `components/haptic-tab.tsx`
- [ ] `components/hello-wave.tsx`
- [ ] `components/parallax-scroll-view.tsx`
- [ ] `components/themed-text.tsx`
- [ ] `components/themed-view.tsx`
- [ ] `components/ui/collapsible.tsx`
- [ ] `components/ui/icon-symbol.tsx`
- [ ] `components/ui/icon-symbol.ios.tsx`

### 6.4 Sistema de Diseño
- [ ] Documentar props comunes
- [ ] Explicar variantes y estados
- [ ] Describir accesibilidad

---

## 7. Pantallas (Screens)

### 7.1 Pantallas de Autenticación
- [ ] Documentar flujo de login
- [ ] Documentar flujo de registro
- [ ] Documentar recuperación de contraseña

### 7.2 Pantallas Principales
- [ ] Documentar pantalla de calendario
- [ ] Documentar pantalla de conexiones
- [ ] Documentar pantalla de perfil

### 7.3 Pantallas de Configuración
- [ ] Documentar pantalla de cuenta
- [ ] Documentar pantalla de ajustes
- [ ] Documentar pantalla de privacidad

### 7.4 Flujos de Usuario
- [ ] Documentar onboarding
- [ ] Documentar creación de perfil
- [ ] Documentar gestión de conexiones

---

## 8. Tema y Estilos

### 8.1 Sistema de Tema
- [ ] `src/theme/index.ts` - Exportaciones del tema
- [ ] `src/theme/ThemeProvider.tsx` - Provider del tema
- [ ] `src/theme/colors.ts` - Paleta de colores
- [ ] `src/theme/typography.ts` - Tipografía

### 8.2 Estilos Globales
- [ ] Documentar tema claro/oscuro
- [ ] Explicar tokens de diseño
- [ ] Describir responsive design

---

## 9. Hooks Personalizados

### 9.1 Hooks de Lógica de Negocio
- [ ] `src/hooks/useDailyChangeLimit.ts` - Hook para límite de cambios diarios

### 9.2 Hooks de Utilidad
- [ ] Documentar otros hooks en `/hooks` (root)

---

## 10. Tipos y Interfaces

### 10.1 Tipos de Dominio
- [ ] `src/types/birthday.ts` - Tipos relacionados con cumpleaños
- [ ] `src/types/images.d.ts` - Declaraciones de tipos para imágenes

### 10.2 Tipos de Base de Datos
- [ ] Documentar interfaces de entidades
- [ ] Documentar tipos de consultas
- [ ] Documentar tipos de respuestas

---

## 11. Firebase y Cloud Functions

### 11.1 Cloud Functions
- [ ] `functions/src/index.ts` - Funciones cloud principales
- [ ] `functions/package.json` - Dependencias de functions

### 11.2 Scripts de Utilidad
- [ ] `functions/check-auth-users.js` - Verificar usuarios autenticados
- [ ] `functions/check-connection-details.js` - Verificar detalles de conexión
- [ ] `functions/check-tokens.js` - Verificar tokens
- [ ] `functions/delete-auth-user.js` - Eliminar usuario autenticado
- [ ] `functions/manual-test.js` - Tests manuales

### 11.3 Reglas de Seguridad
- [ ] `firestore.rules` - Reglas de Firestore (producción)
- [ ] `firestore-dev.rules` - Reglas de Firestore (desarrollo)

### 11.4 Integración
- [ ] Documentar triggers
- [ ] Documentar callable functions
- [ ] Documentar scheduled functions

---

## 12. Configuración de Plataformas

### 12.1 iOS
- [ ] `ios/` - Configuración específica de iOS
- [ ] `GoogleService-Info.plist` - Configuración de Firebase para iOS

### 12.2 Android
- [ ] `android/` - Configuración específica de Android
- [ ] `google-services.json` - Configuración de Firebase para Android

### 12.3 Assets
- [ ] `assets/images/` - Imágenes y recursos
  - [ ] Iconos de aplicación
  - [ ] Splash screens
  - [ ] Backgrounds
  - [ ] Logo

---

## 📝 Notas de Documentación

### Convenciones a Seguir
1. **Formato**: Usar Markdown con sintaxis clara
2. **Comentarios en Código**: JSDoc para funciones y componentes
3. **Ejemplos**: Incluir ejemplos de uso cuando sea relevante
4. **Diagramas**: Usar Mermaid para flujos complejos
5. **Idioma**: Documentar en español

### Prioridades
1. 🔴 **Alta**: Contextos, Servicios, Base de Datos
2. 🟡 **Media**: Componentes UI, Pantallas principales
3. 🟢 **Baja**: Componentes legacy, Scripts de utilidad

### Checklist de Documentación por Archivo
Para cada archivo documentado, incluir:
- [ ] Propósito del archivo
- [ ] Dependencias principales
- [ ] Exports/API pública
- [ ] Ejemplos de uso
- [ ] Notas especiales (edge cases, limitaciones, etc.)

---

## 🎯 Progreso General

**Total de Secciones**: 12  
**Secciones Completadas**: 0  
**Progreso**: 0%

---

## 📌 Próximos Pasos

1. Comenzar por la sección 4 (Contextos) - son fundamentales
2. Continuar con sección 5 (Base de Datos y Servicios)
3. Documentar sección 6 (Componentes UI)
4. Seguir con sección 3 (Navegación)
5. Completar el resto según prioridad

---

**Última actualización**: 2025-11-24  
**Versión del proyecto**: 1.0.1
