# Group Gifting - Technical Strategy
**Stack:** React Native + Expo + Firebase (Firestore + Auth)  
**Branch:** `feature-group-giffting`  
**Status:** ✅ **MVP COMPLETADO** (16 Diciembre 2025)

---

## 📋 Executive Summary

**Feasibility:** ✅ **100% Viable** con el stack actual  
**Complexity:** Media-Alta (principalmente por el chat en tiempo real)  
**Estimated Effort:** 3-4 semanas de desarrollo incremental  
**Actual Effort:** ~2 semanas (MVP + extras completados)

### Key Technical Decisions
1. **Database:** Firestore (ya configurado) - perfecto para real-time
2. **Chat:** Firestore real-time listeners (sin necesidad de servicios externos)
3. **Notifications:** Firebase Cloud Messaging (ya implementado)
4. **State Management:** Context API (patrón ya establecido en la app)
5. **Navigation:** Expo Router (ya configurado con tabs/drawer)

---

## 🗂️ Firebase Schema Design

### Collection: `giftGroups`
```typescript
interface GiftGroup {
  id: string;                    // Auto-generated
  giftName: string;              // max 50 chars
  totalPrice: number;            // positive number
  recipientUserId: string;       // quien recibe el regalo
  creatorId: string;             // admin del grupo
  status: 'active' | 'closed';   // estado del grupo
  paymentLink?: string;          // opcional (Release 3)
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;               // cuando se cierra
}
```

### Collection: `giftGroups/{groupId}/members`
```typescript
interface GroupMember {
  id: string;                    // userId
  userId: string;
  username: string;              // para mostrar en UI
  avatar: string;                // emoji
  role: 'creator' | 'member';
  status: 'pending' | 'accepted' | 'rejected';
  hasPaid: boolean;              // tracking manual
  invitedAt: Date;
  joinedAt?: Date;
}
```

### Collection: `giftGroups/{groupId}/messages`
```typescript
interface ChatMessage {
  id: string;                    // Auto-generated
  senderId: string;
  senderName: string;
  senderAvatar: string;
  message: string;
  type: 'user' | 'system';       // system para "Laura updated price..."
  timestamp: Date;
}
```

### Security Rules (Firestore)
```javascript
// giftGroups - cualquier usuario autenticado puede leer grupos donde es miembro
match /giftGroups/{groupId} {
  allow read: if request.auth != null && 
    exists(/databases/$(database)/documents/giftGroups/$(groupId)/members/$(request.auth.uid));
  allow create: if request.auth != null;
  allow update: if request.auth != null && 
    get(/databases/$(database)/documents/giftGroups/$(groupId)/members/$(request.auth.uid)).data.role == 'creator';
  
  match /members/{memberId} {
    allow read: if request.auth != null;
    allow write: if request.auth != null && 
      get(/databases/$(database)/documents/giftGroups/$(groupId)/members/$(request.auth.uid)).data.role == 'creator';
  }
  
  match /messages/{messageId} {
    allow read: if request.auth != null && 
      exists(/databases/$(database)/documents/giftGroups/$(groupId)/members/$(request.auth.uid));
    allow create: if request.auth != null && 
      exists(/databases/$(database)/documents/giftGroups/$(groupId)/members/$(request.auth.uid)) &&
      get(/databases/$(database)/documents/giftGroups/$(groupId)/members/$(request.auth.uid)).data.status == 'accepted';
  }
}
```

---

## 🎨 UI/UX Structure

### New Screens (dentro de `app/`)

```
app/
├── (drawer)/
│   ├── (tabs)/
│   │   ├── calendar.tsx          [EXISTING]
│   │   ├── profile.tsx           [EXISTING]
│   │   ├── connect.tsx           [EXISTING]
│   │   └── groups.tsx            [NEW] - Main groups tab
│   └── group/
│       ├── [id].tsx              [NEW] - Group detail (chat + members)
│       ├── create.tsx            [NEW] - Create new group
│       └── invite.tsx            [NEW] - Invite members
```

### Navigation Flow
```
Groups Tab (groups.tsx)
  ├─> Create Group (create.tsx)
  │     └─> Invite Members (invite.tsx)
  │           └─> Group Detail ([id].tsx)
  │
  └─> Group Detail ([id].tsx)
        ├─> Chat section (bottom)
        ├─> Members list (top)
        └─> Payment tracking (middle)
```

---

## 🧩 Context & State Management

### New Context: `GroupsContext.tsx`
```typescript
interface GroupsContextType {
  // State
  myGroups: GiftGroup[];
  activeGroup: GiftGroup | null;
  groupMembers: GroupMember[];
  groupMessages: ChatMessage[];
  isLoading: boolean;
  
  // Actions
  createGroup: (data: CreateGroupData) => Promise<string>;
  inviteMembers: (groupId: string, userIds: string[]) => Promise<void>;
  acceptInvite: (groupId: string) => Promise<void>;
  rejectInvite: (groupId: string) => Promise<void>;
  sendMessage: (groupId: string, message: string) => Promise<void>;
  markAsPaid: (groupId: string, userId: string, paid: boolean) => Promise<void>;
  updateGroupDetails: (groupId: string, updates: Partial<GiftGroup>) => Promise<void>;
  removeMember: (groupId: string, userId: string) => Promise<void>;
  closeGroup: (groupId: string) => Promise<void>;
  
  // Real-time subscriptions
  subscribeToGroup: (groupId: string) => () => void;
  subscribeToMessages: (groupId: string) => () => void;
}
```

### Integration with Existing Contexts
- **UserContext:** Ya existe, usarlo para obtener `user.id`, `user.username`, `user.avatar`
- **ConnectionsContext:** Reutilizar lógica de búsqueda de usuarios por username
- **NotificationsContext:** Extender para notificaciones de grupos (nuevo mensaje, invitación, etc.)

---

## 🚀 Development Strategy by Release

### **Release 1 - MVP (2 semanas)**

#### Week 1: Foundation + Group Creation
**Objetivo:** Crear grupos y gestionar invitaciones

**Tasks:**
1. **Database Setup** (1 día)
   - [x] Crear colecciones en Firestore
   - [x] Configurar security rules
   - [x] Crear índices compuestos necesarios
   - [x] Testing manual en Firebase Console
   - [x] **EXTRA:** Cloud Functions para sincronizar groupIds y notificaciones

2. **GroupsContext** (2 días)
   - [x] Crear `src/context/GroupsContext.tsx`
   - [x] Implementar `createGroup`
   - [x] Implementar `inviteMembers`
   - [x] Implementar listeners de Firestore para real-time
   - [x] Testing con datos mock
   - [x] **EXTRA:** Sistema de invitaciones con estados pending/accepted/rejected

3. **UI - Groups Tab** (2 días)
   - [x] Crear `app/(drawer)/(tabs)/groups.tsx`
   - [x] Lista de grupos (activos vs histórico)
   - [x] Botón "Create Group" → navega a create.tsx
   - [x] Card de grupo muestra: nombre, precio, progreso de pago
   - [x] Testing navegación
   - [x] **EXTRA:** Sección separada para invitaciones pendientes
   - [x] **EXTRA:** Toggle Active/History con contador

4. **UI - Create Group** (1 día)
   - [x] Crear `app/group/create.tsx`
   - [x] Form: Gift Name (input), Total Price (numeric), Recipient (selector de conexiones)
   - [x] Validación: max 50 chars, precio > 0
   - [x] Al crear → navegar a invite.tsx con groupId
   - [x] Testing validaciones
   - [x] **EXTRA:** Campo opcional de descripción del regalo
   - [x] **EXTRA:** DatePicker para deadline de aceptación de miembros

#### Week 2: Invitations + Chat + Payment Tracking
**Objetivo:** Completar flujo MVP end-to-end

5. **UI - Invite Members** (1 día)
   - [x] Crear `app/group/invite.tsx`
   - [x] Reutilizar lógica de `connect.tsx` para buscar usuarios
   - [x] Lista de invitados (pending)
   - [x] Botón "Done" → navegar a group detail
   - [x] Testing invitaciones

6. **UI - Group Detail** (3 días)
   - [x] Crear `app/group/[id].tsx`
   - [x] **Header:** Gift name, total price, price per person (calculado)
   - [x] **Members Section:**
     - Lista de miembros con avatar, nombre, estado (pending/accepted)
     - Checkbox "Paid" (solo visible para creator)
     - Cálculo automático: `pricePerPerson = totalPrice / acceptedMembers.length`
   - [x] **Chat Section:**
     - Input de mensaje (bottom)
     - Lista de mensajes (scroll invertido, más reciente abajo)
     - Real-time updates con `onSnapshot`
     - Sender name + timestamp
   - [x] **Actions (creator only):**
     - Edit button (navega a edit screen - Release 2)
     - Remove member (Release 2)
   - [x] Testing real-time chat
   - [x] **EXTRA:** Mostrar cumpleaños del destinatario en header
   - [x] **EXTRA:** Badge "Cerrado" para grupos cerrados
   - [x] **EXTRA:** Precio estimado vs final según deadline
   - [x] **EXTRA:** Nota "(No pagues antes)" junto al deadline
   - [x] **EXTRA:** Soporte multiidioma completo (ES/EN/DE)

7. **Notifications Integration** (1 día)
   - [x] Extender `NotificationsContext` para grupos
   - [x] Push notification cuando:
     - Recibes invitación
     - Alguien acepta tu invitación
     - Nuevo mensaje en grupo
   - [x] Badge count en Groups tab
   - [x] Testing notificaciones
   - [x] **EXTRA:** Cloud Functions para notificaciones remotas

**Deliverable Release 1:** ✅ **COMPLETADO**
- ✅ Crear grupo con nombre y precio
- ✅ Invitar usuarios por username
- ✅ Aceptar/rechazar invitaciones
- ✅ Chat en tiempo real
- ✅ Tracking manual de pagos (creator marca como paid)
- ✅ Cálculo automático de precio por persona
- ✅ **EXTRA:** Descripción opcional del regalo
- ✅ **EXTRA:** Deadline para aceptar miembros
- ✅ **EXTRA:** Sistema de invitaciones con UI dedicada

---

### **Release 2 - Flexibility (1 semana)**

#### Week 3: Edit Mode + Member Management
**Objetivo:** Manejar cambios en grupos activos

8. **Edit Group Details** (2 días)
   - [x] Crear `app/group/edit/[id].tsx`
   - [x] Form pre-rellenado con datos actuales
   - [x] Permitir editar: giftName, totalPrice
   - [x] Al guardar:
     - Actualizar Firestore
     - Enviar mensaje de sistema al chat: "Laura updated the price to 150€"
     - Recalcular pricePerPerson automáticamente
   - [x] Testing edición + mensajes sistema

9. **Remove Member** (1 día)
   - [x] Añadir botón "Remove" en group detail (solo creator)
   - [x] Confirmación dialog
   - [x] Al remover:
     - Actualizar status a 'removed' (o eliminar documento)
     - Usuario pierde acceso al chat
     - Recalcular pricePerPerson
     - Mensaje sistema: "Laura removed Carlos from the group"
   - [x] Testing permisos

10. **Payment Progress Bar** (1 día)
    - [x] Componente visual en group detail
    - [x] Cálculo: `(paidMembers / totalMembers) * 100`
    - [x] Color verde cuando 100%
    - [x] Testing cálculo
    - [x] **EXTRA:** Mostrar monto individual por miembro

**Deliverable Release 2:** ✅ **COMPLETADO**
- ✅ Editar nombre y precio del regalo
- ✅ Remover miembros
- ✅ Barra de progreso visual
- ✅ Mensajes de sistema en chat
- ✅ **EXTRA:** Validación de deadline para invitar/aceptar
- ✅ **EXTRA:** Cálculo dinámico estimado vs final

---

### **Release 3 - Automation (1 semana)**

#### Week 4: Payment Links + History

11. **Payment Link** (1 día)
    - [x] Añadir campo `paymentLink` en edit screen
    - [x] Validación de URL
    - [x] Mostrar link clickable en group detail
    - [x] Testing validación URL

12. **Close Group** (2 días)
    - [x] Botón "Close Group" en group detail
    - [x] Validación: solo disponible para admin (sin requisito de 100% paid)
    - [x] Al cerrar:
      - Actualizar status a 'closed'
      - Guardar closedAt timestamp
      - Chat pasa a read-only
      - Grupo se mueve a "History" tab
    - [x] Testing cierre
    - [x] **EXTRA:** Diálogo de confirmación con traducciones
    - [x] **EXTRA:** Badge visual "Cerrado" en header

13. **Gift History** (2 días)
    - [x] Tab/sección "Past Gifts" en groups.tsx
    - [x] Query Firestore: `where('status', '==', 'closed')`
    - [x] Card muestra: Gift Name, Recipient, Date, Final Price
    - [x] Al hacer tap → group detail (read-only)
    - [x] Testing histórico
    - [x] **EXTRA:** Toggle Active/History con contador de grupos

**Deliverable Release 3:** ✅ **COMPLETADO**
- ✅ Payment links
- ✅ Cerrar grupos
- ✅ Historial de regalos pasados
- ✅ **EXTRA:** Sistema multiidioma completo (ES/EN/DE)
- ✅ **EXTRA:** Mostrar cumpleaños del destinatario
- ✅ **EXTRA:** Precio estimado antes del deadline

---

## 🔧 Technical Implementation Details

### Real-time Chat Implementation
```typescript
// En GroupsContext
const subscribeToMessages = (groupId: string) => {
  const messagesRef = collection(db, `giftGroups/${groupId}/messages`);
  const q = query(messagesRef, orderBy('timestamp', 'asc'));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setGroupMessages(messages);
  });
  
  return unsubscribe;
};
```

### Price Per Person Calculation
```typescript
const calculatePricePerPerson = (group: GiftGroup, members: GroupMember[]) => {
  const acceptedMembers = members.filter(m => m.status === 'accepted');
  return group.totalPrice / acceptedMembers.length;
};
```

### System Messages
```typescript
const sendSystemMessage = async (groupId: string, message: string) => {
  await addDoc(collection(db, `giftGroups/${groupId}/messages`), {
    senderId: 'system',
    senderName: 'System',
    senderAvatar: '🎁',
    message,
    type: 'system',
    timestamp: new Date()
  });
};
```

---

## 🎯 Testing Strategy

### Unit Tests
- [ ] GroupsContext actions (create, invite, accept, etc.)
- [ ] Price calculation logic
- [ ] URL validation for payment links

### Integration Tests
- [ ] Firestore security rules
- [ ] Real-time listeners
- [ ] Notification triggers

### E2E Tests (Manual)
- [ ] Flujo completo: Create → Invite → Accept → Chat → Pay → Close
- [ ] Permisos: Creator vs Member actions
- [ ] Real-time: Múltiples usuarios en mismo grupo

---

## 📱 Platform Considerations

### Mobile (iOS/Android)
- ✅ Todo funciona nativamente
- ✅ Push notifications completas
- ✅ Real-time chat sin problemas

### Web
- ✅ Firestore real-time funciona
- ⚠️ Push notifications limitadas (ya manejado en NotificationsContext)
- ✅ Chat funcional
- 💡 Considerar: Añadir polling fallback si web tiene problemas con listeners

---

## 🚨 Potential Challenges & Solutions

### Challenge 1: Chat Performance con Muchos Mensajes
**Problem:** Cargar todos los mensajes puede ser lento  
**Solution:** 
- Implementar paginación (cargar últimos 50 mensajes)
- Usar `limitToLast(50)` en query
- Botón "Load more" para mensajes antiguos

### Challenge 2: Cálculo de Precio cuando Alguien se Va
**Problem:** ¿Qué pasa si alguien ya pagó y luego se va?  
**Solution:**
- Opción A: No permitir remover si ya pagó (más simple para MVP)
- Opción B: Recalcular y notificar a todos (Release 2)
- **Recomendación:** Opción A para MVP

### Challenge 3: Notificaciones de Chat Spam
**Problem:** Muchas notificaciones si chat muy activo  
**Solution:**
- Agrupar notificaciones por grupo
- Silenciar notificaciones si usuario está en la pantalla del grupo
- Implementar "mute group" (Release 3)

---

## 📦 Dependencies to Add

```json
{
  "dependencies": {
    // Ya tenéis todo lo necesario:
    // - firebase (Auth + Firestore)
    // - expo-notifications
    // - expo-router
    // - react-native
    
    // Opcional (para mejorar UX):
    "react-native-keyboard-aware-scroll-view": "^0.9.5"  // Para chat input
  }
}
```

---

## 🎨 UI Components to Create

### Reusable Components
1. **GroupCard** - Para lista de grupos
2. **MemberListItem** - Para mostrar miembros con checkbox
3. **ChatMessage** - Para mensajes (user vs system)
4. **ChatInput** - Input de mensaje con botón enviar
5. **PaymentProgressBar** - Barra de progreso visual
6. **PriceDisplay** - Mostrar precio total y por persona

---

## 📝 Definition of Done (DoD) Checklist

Para cada User Story:
- [ ] Código implementado y funcional
- [ ] Firestore security rules actualizadas
- [ ] UI matches design (Dark Mode + Gold theme)
- [ ] Loading states implementados
- [ ] Error handling (try/catch + user feedback)
- [ ] Real-time updates funcionando
- [ ] Notificaciones configuradas
- [ ] Testing manual en iOS/Android/Web
- [ ] Code review
- [ ] Documentación actualizada

---

## 🎯 Success Metrics (Post-Launch)

- **Adoption:** % de usuarios que crean al menos 1 grupo
- **Engagement:** Mensajes promedio por grupo
- **Completion:** % de grupos que llegan a 100% paid
- **Time to Close:** Días promedio desde creación hasta cierre

---

## 🔄 Migration Strategy (si hay usuarios existentes)

No aplica para MVP - es feature nueva, no hay datos que migrar.

---

## 📚 Next Steps

1. **Review este documento** con el equipo
2. **Crear tickets** en vuestro sistema (GitHub Issues, Jira, etc.)
3. **Setup Firebase** (colecciones + rules)
4. **Empezar con Release 1, Week 1, Task 1**

---

## 💡 Future Enhancements (Post-Release 3)

- [ ] Integración con pasarelas de pago (Stripe, PayPal)
- [ ] Recordatorios automáticos a quien no ha pagado
- [ ] Grupos recurrentes (mismo regalo cada año)
- [ ] Sugerencias de regalos basadas en hobbies/preferences
- [ ] Compartir fotos del regalo en el grupo
- [ ] Votación para elegir entre varias opciones de regalo

---

**Documento creado:** 16 Diciembre 2025  
**Stack:** React Native + Expo + Firebase  
**Estimated Total Effort:** 3-4 semanas (1 desarrollador full-time)
