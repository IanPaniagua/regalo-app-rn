# Firebase Setup for Group Gifting Feature

## 1. Deploy Security Rules

The security rules have been added to `firestore.rules`. Deploy them to Firebase:

```bash
firebase deploy --only firestore:rules
```

**Verify deployment:**
- Go to [Firebase Console](https://console.firebase.google.com)
- Select your project: `regalo-app-a22e4`
- Navigate to Firestore Database → Rules
- Confirm the `giftGroups` rules are present

---

## 2. Create Firestore Indexes

Some queries require composite indexes. Create them manually or wait for Firebase to suggest them.

### Required Indexes:

#### Index 1: Query groups by user membership
- **Collection:** `giftGroups`
- **Fields indexed:**
  - `creatorId` (Ascending)
  - `status` (Ascending)
  - `createdAt` (Descending)

#### Index 2: Query messages by timestamp
- **Collection:** `giftGroups/{groupId}/messages`
- **Fields indexed:**
  - `timestamp` (Ascending)

**How to create:**
1. Go to Firebase Console → Firestore Database → Indexes
2. Click "Create Index"
3. Add the fields as specified above
4. Click "Create"

**Alternative:** Run a query in the app and Firebase will provide a link to auto-create the index.

---

## 3. Test Security Rules (Optional but Recommended)

### Test in Firebase Console:

1. Go to Firestore Database → Rules
2. Click "Rules Playground"
3. Test scenarios:

**Scenario 1: User can read their own group**
```
Location: /giftGroups/{groupId}
Operation: get
Auth: Authenticated as user123
Simulate: Should ALLOW if user123 is in /giftGroups/{groupId}/members/user123
```

**Scenario 2: User cannot read groups they're not in**
```
Location: /giftGroups/{groupId}
Operation: get
Auth: Authenticated as user456
Simulate: Should DENY if user456 is NOT in /giftGroups/{groupId}/members/
```

**Scenario 3: Only creator can update group**
```
Location: /giftGroups/{groupId}
Operation: update
Auth: Authenticated as user123
Simulate: Should ALLOW only if creatorId == user123
```

---

## 4. Initial Data Structure (for testing)

You can manually create a test group in Firebase Console:

### Collection: `giftGroups`
Document ID: `test-group-001`
```json
{
  "giftName": "Birthday Gift for Maria",
  "totalPrice": 100,
  "recipientUserId": "user-maria-id",
  "creatorId": "your-user-id",
  "status": "active",
  "createdAt": "2025-12-16T10:00:00.000Z",
  "updatedAt": "2025-12-16T10:00:00.000Z"
}
```

### Subcollection: `giftGroups/test-group-001/members`
Document ID: `your-user-id`
```json
{
  "userId": "your-user-id",
  "username": "yourUsername",
  "avatar": "🎉",
  "role": "creator",
  "status": "accepted",
  "hasPaid": false,
  "invitedAt": "2025-12-16T10:00:00.000Z",
  "joinedAt": "2025-12-16T10:00:00.000Z"
}
```

### Subcollection: `giftGroups/test-group-001/messages`
Document ID: (auto-generated)
```json
{
  "senderId": "system",
  "senderName": "System",
  "senderAvatar": "🎁",
  "message": "Group created",
  "type": "system",
  "timestamp": "2025-12-16T10:00:00.000Z"
}
```

---

## 5. Verification Checklist

- [ ] Security rules deployed successfully
- [ ] Indexes created (or will be created on first query)
- [ ] Test group created in Firebase Console
- [ ] Test member added to group
- [ ] Test message added to group
- [ ] Rules Playground tests passed

---

## Next Steps

Once Firebase is set up, proceed to:
- **Task 2:** Create `GroupsContext.tsx` with TypeScript interfaces
- **Task 3:** Build Groups tab UI
- **Task 4:** Build Create Group screen

---

**Setup completed:** ✅ Ready for development
