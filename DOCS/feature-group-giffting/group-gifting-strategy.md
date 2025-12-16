# Group Gifting - Technical Strategy
**Stack:** React Native + Expo + Firebase (Firestore + Auth)  
**Branch:** `feature-group-giffting`  
**Status:** ✅ **MVP COMPLETED** (16 December 2025)

---

## 📋 Executive Summary

**Feasibility:** ✅ **100% Viable** with the current stack  
**Complexity:** Medium-High (mainly because of real-time chat)  
**Estimated Effort:** 3–4 weeks of incremental development  
**Actual Effort:** ~2 weeks (MVP + extra features completed)

### Key Technical Decisions
1. **Database:** Firestore (already configured) – perfect for real-time
2. **Chat:** Firestore real-time listeners (no external service required)
3. **Notifications:** Firebase Cloud Messaging (already implemented)
4. **State Management:** Context API (pattern already established in the app)
5. **Navigation:** Expo Router (already configured with tabs/drawer)

---

## 🗂️ Firebase Schema Design

### Collection: `giftGroups`
```typescript
interface GiftGroup {
  id: string;                    // Auto-generated
  giftName: string;              // max 50 chars
  totalPrice: number;            // positive number
  recipientUserId: string;       // gift recipient
  creatorId: string;             // group admin
  status: 'active' | 'closed';   // group status
  paymentLink?: string;          // optional (Release 3)
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
  username: string;              // used in UI
  avatar: string;                // emoji
  role: 'creator' | 'member';
  status: 'pending' | 'accepted' | 'rejected';
  hasPaid: boolean;              // manual tracking
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
  type: 'user' | 'system';       // system for "Laura updated the price..."
  timestamp: Date;
}
```

### Security Rules (Firestore)
```javascript
// giftGroups – any authenticated user can read groups where they are a member
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

### **Release 1 - MVP (2 weeks)**

#### Week 1: Foundation + Group Creation
**Goal:** Create groups and manage invitations

**Tasks:**
1. **Database Setup** (1 day)
   - [x] Create collections in Firestore
   - [x] Configure security rules
   - [x] Create required composite indexes
   - [x] Manual testing in Firebase Console
   - [x] **EXTRA:** Cloud Functions to sync `groupIds` and notifications

2. **GroupsContext** (2 days)
   - [x] Create `src/context/GroupsContext.tsx`
   - [x] Implement `createGroup`
   - [x] Implement `inviteMembers`
   - [x] Implement Firestore listeners for real-time updates
   - [x] Testing with mock data
   - [x] **EXTRA:** Invitation system with pending/accepted/rejected states

3. **UI - Groups Tab** (2 days)
   - [x] Create `app/(drawer)/(tabs)/groups.tsx`
   - [x] List of groups (active vs history)
   - [x] "Create Group" button → navigates to `create.tsx`
   - [x] Group card shows: name, price, payment progress
   - [x] Navigation testing
   - [x] **EXTRA:** Separate section for pending invitations
   - [x] **EXTRA:** Active/History toggle with counters

4. **UI - Create Group** (1 day)
   - [x] Create `app/group/create.tsx`
   - [x] Form: Gift Name (input), Total Price (numeric), Recipient (connections selector)
   - [x] Validation: max 50 chars, price > 0
   - [x] On create → navigate to `invite.tsx` with `groupId`
   - [x] Validation testing
   - [x] **EXTRA:** Optional gift description field
   - [x] **EXTRA:** DatePicker for member acceptance deadline

#### Week 2: Invitations + Chat + Payment Tracking
**Goal:** Complete end-to-end MVP flow

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

### **Release 2 - Flexibility (1 week)**

#### Week 3: Edit Mode + Member Management
**Goal:** Handle changes in active groups

8. **Edit Group Details** (2 days)
   - [ ] Create `app/group/edit/[id].tsx` - **NOT IMPLEMENTED**
   - [x] Backend: `updateGroupDetails` function exists in GroupsContext
   - [x] Backend: System messages for price/name changes work
   - [ ] UI: No edit screen created
   - [ ] UI: No edit button in group detail screen

9. **Remove Member** (1 day)
   - [ ] Add "Remove" button in group detail (creator only) - **NOT IMPLEMENTED**
   - [x] Backend: `removeMember` function exists in GroupsContext
   - [x] Backend: Removes member doc, updates groupIds, sends system message
   - [ ] UI: No remove button in member list
   - [ ] UI: No confirmation dialog

10. **Payment Progress Bar** (1 day)
    - [x] Visual component in group detail
    - [x] Calculation: `(paidMembers / totalMembers) * 100`
    - [x] Turns green at 100%
    - [x] Calculation testing
    - [x] **EXTRA:** Show individual amount per member

**Deliverable Release 2:** ⚠️ **PARTIALLY COMPLETED**
- ❌ Edit group name and price (backend ready, no UI screen)
- ❌ Remove members (backend ready, no UI button)
- ✅ Payment progress bar
- ✅ System messages in chat
- ✅ **EXTRA:** Deadline validation for inviting/accepting
- ✅ **EXTRA:** Dynamic estimated vs final price calculation

---

### **Release 3 - Automation (1 week)**

#### Week 4: Payment Links + History

11. **Payment Link** (1 day)
    - [ ] Add `paymentLink` field in edit screen - **NOT IMPLEMENTED**
    - [x] Backend: `paymentLink` field exists in GiftGroup model
    - [x] Backend: `updateGroupDetails` can save it
    - [ ] UI: No input field to add payment link
    - [ ] UI: No display of payment link in group detail
    - [ ] UI: No URL validation in form

12. **Close Group** (2 days)
    - [x] "Close Group" button in group detail
    - [x] Validation: only available for admin (no 100% paid requirement)
    - [x] On close:
      - Update status to `closed`
      - Save `closedAt` timestamp
      - Chat becomes read-only
      - Group moves to "History" tab
    - [x] Close flow testing
    - [x] **EXTRA:** Confirmation dialog with translations
    - [x] **EXTRA:** Visual "Closed" badge in header

13. **Gift History** (2 days)
    - [x] "Past Gifts" tab/section in `groups.tsx`
    - [x] Firestore query: `where('status', '==', 'closed')`
    - [x] Card shows: Gift Name, Recipient, Date, Final Price
    - [x] On tap → group detail (read-only)
    - [x] History testing
    - [x] **EXTRA:** Active/History toggle with group counters

**Deliverable Release 3:** ⚠️ **PARTIALLY COMPLETED**
- ❌ Payment links (backend ready, no UI to add/display)
- ✅ Close groups
- ✅ Gift history
- ✅ **EXTRA:** Show recipient's birthday
- ✅ **EXTRA:** Estimated price before deadline

**DoD Compliance:**
- ✅ Full multilingual system (ES/EN/DE) - Required by DoD
- ✅ No hardcoded strings - All text extractable
- ✅ Dynamic text rendering with variable interpolation

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
- [x] Price calculation logic
- [x] URL validation for payment links

### Integration Tests
- [ ] Firestore security rules
- [ ] Real-time listeners
- [ ] Notification triggers

### E2E Tests (Manual)
- [ ] Full flow: Create → Invite → Accept → Chat → Pay → Close
- [ ] Permissions: Creator vs Member actions
- [ ] Real-time: Multiple users in the same group

---

## 📱 Platform Considerations

### Mobile (iOS/Android)
- ✅ Everything works natively
- ✅ Full push notifications
- ✅ Real-time chat works smoothly

### Web
- ✅ Firestore real-time works
- ⚠️ Push notifications are limited (handled in `NotificationsContext`)
- ✅ Chat functional
- 💡 Consider: add polling fallback if web has issues with listeners

---

## 🚨 Potential Challenges & Solutions

### Challenge 1: Chat Performance with Many Messages
**Problem:** Loading all messages can be slow  
**Solution:** 
- Implement pagination (load last 50 messages)
- Use `limitToLast(50)` in query
- "Load more" button for older messages

### Challenge 2: Price Calculation When Someone Leaves
**Problem:** What happens if someone already paid and then leaves?  
**Solution:**
- Option A: Do not allow removal if they already paid (simpler for MVP)
- Option B: Recalculate and notify everyone (Release 2)
- **Recommendation:** Option A for MVP

### Challenge 3: Chat Notification Spam
**Problem:** Too many notifications if chat is very active  
**Solution:**
- Group notifications per group
- Mute notifications if the user is on the group screen
- Implement "mute group" (Release 3)

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
1. **GroupCard** – For group list
2. **MemberListItem** – To show members with checkbox
3. **ChatMessage** – For messages (user vs system)
4. **ChatInput** – Message input with send button
5. **PaymentProgressBar** – Visual progress bar
6. **PriceDisplay** – Show total price and per person

---

## 📝 Definition of Done (DoD) Checklist

For each User Story:
- [ ] Code implemented and functional
- [ ] Firestore security rules updated
- [ ] UI matches design (Dark Mode + Gold theme)
- [ ] Loading states implemented
- [ ] Error handling (try/catch + user feedback)
- [ ] Real-time updates working
- [ ] Notifications configured
- [ ] Manual testing on iOS/Android/Web
- [ ] Code review
- [ ] Documentation updated

---

## 🎯 Success Metrics (Post-Launch)

- **Adoption:** % de usuarios que crean al menos 1 grupo
- **Engagement:** Mensajes promedio por grupo
- **Completion:** % de grupos que llegan a 100% paid
- **Time to Close:** Días promedio desde creación hasta cierre

---

## 🔄 Migration Strategy (if there are existing users)

Not applicable for MVP – this is a new feature, no data to migrate.

---

## 📚 Next Steps

1. **Review este documento** con el equipo
2. **Crear tickets** en vuestro sistema (GitHub Issues, Jira, etc.)
3. **Setup Firebase** (colecciones + rules)
4. **Empezar con Release 1, Week 1, Task 1**

---

## 💡 Future Enhancements (Post-Release 3)

- [ ] Integration with payment gateways (Stripe, PayPal)
- [ ] Automatic reminders for unpaid members
- [ ] Recurring groups (same gift every year)
- [ ] Gift suggestions based on hobbies/preferences
- [ ] Share photos of the gift in the group
- [ ] Voting to choose between multiple gift options

---

**Document created:** 16 December 2025  
**Stack:** React Native + Expo + Firebase  
**Estimated Total Effort:** 3–4 weeks (1 full-time developer)
