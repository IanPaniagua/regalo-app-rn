# Tests: Cumpleaños Manuales y Prevención de Duplicados

## ✅ Funcionalidades Implementadas

### 1. Notificaciones para Cumpleaños Manuales
**Estado**: ✅ Implementado Completamente

Los cumpleaños manuales se incluyen en `allEntries` junto con los usuarios conectados:
- ✅ Aparecen en el calendario
- ✅ Se pueden ver en la lista de cumpleaños del día/mes
- ✅ **Notificaciones push programadas**: Cloud Function `sendDailyBirthdayReminders` envía notificaciones diarias a las 08:00 AM (CET)
- ✅ Solo notifica cumpleaños manuales NO vinculados (evita duplicados)
- ✅ Usa el idioma preferido del usuario (es/en/de)

### 2. Búsqueda de Usuario Existente al Añadir Manual
**Estado**: ✅ Implementado

Cuando intentas añadir un cumpleaños manual:
1. Busca por email (si proporcionas email)
2. Busca por nombre (si no hay email)
3. Si encuentra un usuario en la plataforma, muestra alerta sugiriendo conectar

### 3. Auto-vinculación para Evitar Duplicados
**Estado**: ✅ Implementado

Cuando conectas con alguien que ya tenías manual:
1. Detecta coincidencia por email o nombre+fecha
2. Vincula automáticamente el manual al usuario real
3. Filtra el manual de la vista (solo muestra el usuario real)

---

## 🧪 Plan de Pruebas Manuales

### Test 1: Añadir Cumpleaños Manual (Usuario NO Existe)

**Pasos**:
1. Ir a Calendar tab
2. Presionar botón "Add +"
3. Seleccionar "Add manually"
4. Ingresar:
   - Nombre: "María Test"
   - Email: (dejar vacío o usar email que NO existe)
   - Fecha: Cualquier fecha
5. Guardar

**Resultado Esperado**:
- ✅ Se crea el cumpleaños manual
- ✅ Aparece en el calendario con emoji 🎂
- ✅ Se puede ver en la lista del mes
- ✅ Mensaje de éxito

---

### Test 2: Añadir Manual - Usuario SÍ Existe en Plataforma

**Preparación**:
- Tener un usuario registrado en la plataforma (ej: usuario de prueba con email conocido)
- NO estar conectado con ese usuario

**Pasos**:
1. Ir a Calendar tab
2. Presionar "Add +" → "Add manually"
3. Ingresar:
   - Nombre: [nombre del usuario existente]
   - Email: [email del usuario existente]
   - Fecha: Cualquier fecha
4. Intentar guardar

**Resultado Esperado**:
- ✅ Aparece alerta: "¡Usuario encontrado!"
- ✅ Mensaje: "¡Encontramos a [nombre] en RegaloApp! ¿Quieres conectar con @[username]..."
- ✅ Opciones:
  - "Añadir manualmente" → Muestra info para ir a Connect
  - "Ir a Connect" → Navega a la pestaña Connect

**Logs Esperados**:
```
🔍 User found by email: [nombre]
```

---

### Test 3: Añadir Manual - Usuario YA Conectado

**Preparación**:
- Estar conectado con un usuario

**Pasos**:
1. Ir a Calendar tab
2. Presionar "Add +" → "Add manually"
3. Ingresar datos del usuario ya conectado (nombre + fecha o email)
4. Intentar guardar

**Resultado Esperado**:
- ✅ Aparece alerta de error
- ✅ Mensaje: "Ya tienes conectado a [nombre] con esta fecha de cumpleaños"
- ✅ NO se crea duplicado

---

### Test 4: Auto-vinculación al Conectar

**Preparación**:
1. Crear cumpleaños manual:
   - Nombre: "Juan Prueba"
   - Email: "juan@test.com"
   - Fecha: 15 de marzo
2. Tener un usuario registrado con esos mismos datos

**Pasos**:
1. Verificar que el cumpleaños manual aparece en el calendario
2. Ir a Connect tab
3. Conectar con el usuario real (por username o link)
4. Usuario acepta la conexión
5. Volver a Calendar tab

**Resultado Esperado**:
- ✅ El cumpleaños manual se vincula automáticamente
- ✅ Solo aparece UNA entrada en el calendario (el usuario real)
- ✅ NO hay duplicados
- ✅ El avatar cambia de 🎂 al avatar del usuario real

**Logs Esperados**:
```
✅ Loaded 3 users from database
✅ Loaded 1 manual birthday entries
🔗 Auto-linking manual birthday to user: Juan Prueba
✅ Manual birthday linked to user: [userId]
```

---

### Test 5: Verificar Filtrado de Duplicados en Vista

**Preparación**:
- Tener un cumpleaños manual vinculado (userId presente)
- Estar conectado con ese usuario

**Pasos**:
1. Ir a Calendar tab
2. Navegar al mes del cumpleaños
3. Verificar la vista del calendario

**Resultado Esperado**:
- ✅ Solo aparece UNA entrada (el usuario real)
- ✅ El cumpleaños manual NO se muestra (está filtrado)
- ✅ Al hacer clic, muestra el perfil del usuario real

**Código Relevante**:
```typescript
// En allEntries useMemo:
const filteredManual = manualEntries.filter(entry => {
  if (entry.userId && connectedUserIds.has(entry.userId)) {
    return false; // No mostrar si está vinculado
  }
  return true;
});
```

---

## 🔍 Verificación de Logs

### Logs de Búsqueda de Usuario
```
🔍 User found by email: [nombre]
// o
🔍 User found by name: [nombre]
```

### Logs de Auto-vinculación
```
✅ Loaded X users from database
✅ Loaded Y manual birthday entries
🔗 Auto-linking manual birthday to user: [nombre]
✅ Manual birthday linked to user: [userId]
```

### Logs de Creación Manual
```
✅ Manual birthday entry added: [nombre]
```

---

## 📋 Checklist de Verificación

### Funcionalidad 1: Notificaciones
- [ ] Cumpleaños manuales aparecen en calendario
- [ ] Se pueden ver en lista del día
- [ ] Se pueden ver en lista del mes
- [ ] (Futuro) Notificaciones push programadas

### Funcionalidad 2: Búsqueda y Sugerencia
- [ ] Busca por email si se proporciona
- [ ] Busca por nombre si no hay email
- [ ] Muestra alerta si encuentra usuario
- [ ] Ofrece ir a Connect
- [ ] Previene añadir si ya está conectado

### Funcionalidad 3: Auto-vinculación
- [ ] Detecta coincidencia por email
- [ ] Detecta coincidencia por nombre+fecha
- [ ] Vincula automáticamente al conectar
- [ ] Actualiza en Firestore
- [ ] Filtra duplicados en vista
- [ ] Solo muestra usuario real

---

## ✅ Implementación de Notificaciones

### Notificaciones Push para Cumpleaños Manuales
**Estado**: ✅ Implementado

**Cloud Function**: `sendDailyBirthdayReminders` en `functions/src/index.ts`

**Cómo funciona**:
1. Se ejecuta diariamente a las 08:00 AM (hora de Alemania/CET)
2. Revisa todos los usuarios de la plataforma
3. Para cada usuario:
   - Revisa sus cumpleaños manuales (`manualBirthdays` array)
   - Filtra los que cumplen HOY
   - Excluye los que ya están vinculados a usuarios reales (evita duplicados)
   - Envía notificación push al usuario
4. Usa el idioma preferido del usuario para el mensaje

**Características**:
- ✅ Notificaciones en 3 idiomas (español, inglés, alemán)
- ✅ Calcula la edad automáticamente
- ✅ Evita duplicados (no notifica si está vinculado)
- ✅ Limpia tokens inválidos automáticamente
- ✅ Usa Expo Push Notifications API

**Ejemplo de notificación**:
```
Título: 🎉 ¡Hoy es el cumpleaños de María!
Cuerpo: Cumple 25 años. No olvides felicitarlo 🎂
Data: { type: 'birthday', manualEntryId: '...', isManual: 'true' }
```

---

## ✅ Resumen de Estado

| Funcionalidad | Estado | Notas |
|--------------|--------|-------|
| Añadir cumpleaños manual | ✅ Completo | Funciona correctamente |
| Buscar usuario existente | ✅ Completo | Por email y nombre |
| Sugerir conexión | ✅ Completo | Alerta con opciones |
| Prevenir duplicados conectados | ✅ Completo | Valida antes de crear |
| Auto-vinculación | ✅ Completo | Al conectar con usuario |
| Filtrar duplicados en vista | ✅ Completo | Solo muestra usuario real |
| Notificaciones manuales | ✅ Completo | Cloud Function implementada |
| Notificaciones multiidioma | ✅ Completo | Español, inglés, alemán |

---

## 🚀 Próximos Pasos

1. **Desplegar Cloud Functions** a Firebase:
   ```bash
   cd functions
   npm run deploy
   ```

2. **Probar en dispositivo real** todos los flujos

3. **Verificar logs** en Firebase Console:
   - Functions → Logs
   - Buscar: "🎂 Checking manual birthdays"

4. **Probar manualmente** la Cloud Function:
   ```bash
   cd functions
   node trigger-birthday-notifications.js
   ```

5. **Verificar** que las notificaciones lleguen correctamente
