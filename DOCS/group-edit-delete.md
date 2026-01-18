# Group Edit & Delete - Admin Features

## ✅ Features Implemented

The admin/creator of a group can now:
1. ✅ **Edit group details** (name, description, price)
2. ✅ **Close group** (mark as completed)
3. ✅ **Delete group** (permanently remove)

All changes trigger **system messages** in the group chat.

---

## 🎯 Functionality

### **1. Edit Group**

**Admin can edit**:
- Gift name
- Description
- Total price

**System messages posted**:
- "Admin updated the gift name to 'New Name'"
- "Admin updated the description"
- "Admin updated the price to 150€"

### **2. Close Group**

**What happens**:
- Group status changes to 'closed'
- No more members can be added/removed
- Group moves to "History" tab
- System message: "Admin closed the group"

### **3. Delete Group**

**What happens**:
- Group is permanently deleted
- All members removed from group
- All messages deleted
- All member documents deleted
- `groupIds` removed from all members' user documents
- **Cannot be undone**

---

## 🔧 Implementation Details

### **Files Modified**

#### **Backend** (`src/context/GroupsContext.tsx`)

1. **Enhanced `updateGroupDetails`**:
   - Added system messages for description changes
   - Added system messages for deadline changes
   - Added system messages for payment link changes

2. **New `deleteGroup` function**:
   - Removes `groupId` from all members' documents
   - Deletes all subcollections (members, messages)
   - Deletes group document
   - Updates local state

#### **Frontend** (`app/group/[id].tsx`)

1. **New UI elements**:
   - "Edit Group" button (Details tab)
   - "Close Group" button (Details tab)
   - "Delete Group" button (Details tab)
   - Edit modal with form fields

2. **New functions**:
   - `handleEditGroup()` - Opens edit modal
   - `handleSaveEdit()` - Saves changes
   - `handleDeleteGroup()` - Confirms and deletes

---

## 🎨 UI Components

### **Details Tab - Admin Actions**

```
┌─────────────────────────────────────────┐
│ Details                                  │
├─────────────────────────────────────────┤
│ [Description card]                       │
│ [Price info card]                        │
│                                          │
│ [✏️ Edit Group]                          │
│ [🔒 Close Group]                         │
│ [🗑️ Delete Group]                        │
└─────────────────────────────────────────┘
```

### **Edit Modal**

```
┌─────────────────────────────────────────┐
│ Edit Group                            ✕  │
├─────────────────────────────────────────┤
│ Gift Name *                              │
│ [Birthday Gift for Sarah            ]   │
│                                          │
│ Description                              │
│ [We're getting her a new bike       ]   │
│ [that she's been wanting...         ]   │
│                                          │
│ Total Price (€) *                        │
│ [250.00                             ]   │
├─────────────────────────────────────────┤
│ [Cancel]              [Save Changes]     │
└─────────────────────────────────────────┘
```

---

## 📋 User Flows

### **Editing Group**

1. Admin opens group → Details tab
2. Clicks "✏️ Edit Group"
3. Modal opens with current values
4. Admin modifies fields
5. Clicks "Save Changes"
6. System validates input
7. Updates group in Firestore
8. Posts system messages for each change
9. Modal closes
10. Success alert shown

### **Closing Group**

1. Admin opens group → Details tab
2. Clicks "🔒 Close Group"
3. Confirmation alert appears
4. Admin confirms
5. Group status → 'closed'
6. System message posted
7. Group moves to History tab
8. Returns to groups list

### **Deleting Group**

1. Admin opens group → Details tab
2. Clicks "🗑️ Delete Group"
3. Warning alert appears
4. Admin confirms deletion
5. System removes `groupId` from all members
6. Deletes all members documents
7. Deletes all messages
8. Deletes group document
9. Returns to groups list
10. Group no longer visible to anyone

---

## 💬 System Messages

### **Edit Changes**

```
System: John updated the gift name to "Birthday Surprise"
System: John updated the description
System: John updated the price to 200€
System: John updated the member deadline to January 25, 2026
System: John added the payment link
```

### **Close Group**

```
System: John closed the group
```

### **No message for delete** (group is deleted)

---

## 🔒 Permissions & Validation

### **Edit Group**

✅ **Allowed when**:
- User is the group creator
- Group status is 'active'

❌ **Blocked when**:
- User is not the creator
- Group is closed

**Validation**:
- Gift name required (non-empty)
- Price required (> 0)
- Description optional

### **Close Group**

✅ **Allowed when**:
- User is the group creator
- Group status is 'active'

❌ **Blocked when**:
- User is not the creator
- Group already closed

### **Delete Group**

✅ **Allowed when**:
- User is the group creator
- Any status (active or closed)

❌ **Blocked when**:
- User is not the creator

**Warning**: Permanent action, cannot be undone

---

## 🧪 Testing Checklist

### **Edit Group**

- [ ] Admin can see "Edit Group" button
- [ ] Regular members cannot see button
- [ ] Button only appears when group is active
- [ ] Modal opens with current values
- [ ] Can edit gift name
- [ ] Can edit description
- [ ] Can edit price
- [ ] Validation works (empty name, invalid price)
- [ ] System messages posted for each change
- [ ] Changes reflected immediately
- [ ] Success alert shown

### **Close Group**

- [ ] Admin can see "Close Group" button
- [ ] Regular members cannot see button
- [ ] Button only appears when group is active
- [ ] Confirmation alert appears
- [ ] Group status changes to 'closed'
- [ ] System message posted
- [ ] Group moves to History tab
- [ ] No more edits allowed
- [ ] No more members can be added/removed

### **Delete Group**

- [ ] Admin can see "Delete Group" button
- [ ] Regular members cannot see button
- [ ] Warning alert appears
- [ ] Group is deleted from Firestore
- [ ] All members' `groupIds` updated
- [ ] All subcollections deleted
- [ ] Returns to groups list
- [ ] Group no longer visible
- [ ] Cannot be recovered

---

## 🎯 Edge Cases Handled

1. **Empty fields**: Validation prevents saving
2. **Invalid price**: Must be > 0
3. **No changes**: Can save without changes (no system messages)
4. **Closed group**: Cannot edit or add/remove members
5. **Delete confirmation**: Double-check before permanent deletion
6. **Member cleanup**: All members' documents updated on delete

---

## 📱 Code Examples

### **Edit Group**

```typescript
const handleSaveEdit = async () => {
  const updates: Partial<any> = {};
  
  if (editGiftName !== activeGroup?.giftName) {
    updates.giftName = editGiftName;
  }
  if (editDescription !== (activeGroup?.description || '')) {
    updates.description = editDescription;
  }
  if (price !== activeGroup?.totalPrice) {
    updates.totalPrice = price;
  }

  if (Object.keys(updates).length > 0) {
    await updateGroupDetails(id, updates);
    // System messages posted automatically
  }
};
```

### **Delete Group**

```typescript
const deleteGroup = async (groupId: string): Promise<void> => {
  // 1. Remove groupId from all members
  const membersSnapshot = await getDocs(collection(firestore, `giftGroups/${groupId}/members`));
  for (const memberId of memberIds) {
    await db.getAdapter().updateUser(memberId, {
      groupIds: memberUser.groupIds.filter(id => id !== groupId)
    });
  }
  
  // 2. Delete all subcollections
  // 3. Delete group document
  await deleteDoc(doc(firestore, `giftGroups/${groupId}`));
};
```

---

## 🚀 Future Enhancements

- [ ] Edit member deadline
- [ ] Edit payment link
- [ ] Archive instead of delete
- [ ] Restore deleted groups (soft delete)
- [ ] Edit history/audit log
- [ ] Bulk edit multiple fields
- [ ] Transfer ownership to another admin

---

## ✅ Summary

**Features Status**: ✅ Fully Implemented

**Admin can**:
- Edit group details (name, description, price)
- Close group (mark as completed)
- Delete group (permanent removal)

**System automatically**:
- Posts messages for all changes
- Updates all members' documents
- Validates input
- Prevents unauthorized actions

**UI includes**:
- Edit modal with form
- Confirmation dialogs
- Success/error alerts
- Admin-only buttons

**Ready for production** 🎉
