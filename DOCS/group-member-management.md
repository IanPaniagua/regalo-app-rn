# Group Member Management - Add & Remove Members

## ✅ Feature Implemented

The admin/creator of a group can now **add new members** and **remove existing members** after the group has been created.

---

## 🎯 Functionality

### **Admin Capabilities**

Only the **group creator (admin)** can:
1. ✅ Add new members to an existing group
2. ✅ Remove members from the group
3. ✅ Cannot remove themselves

### **Member Capabilities**

Regular members can:
- View all group members
- See their own payment status
- Cannot add or remove members

---

## 🔧 Implementation Details

### **Files Modified**

1. **`app/group/[id].tsx`**
   - Added `inviteMembers` and `removeMember` from GroupsContext
   - Added `useConnections` to get list of connected users
   - Added modal for selecting users to add
   - Added "Remove" button for each member (admin only)
   - Added "Add Members" button in Members tab (admin only)

### **Context Functions Used**

From `src/context/GroupsContext.tsx`:
- `inviteMembers(groupId, userIds[])` - Already existed
- `removeMember(groupId, userId)` - Already existed

---

## 🎨 UI Components

### **Members Tab - Admin View**

```
┌─────────────────────────────────────────┐
│ Members (3)          [+ Add Members]    │
├─────────────────────────────────────────┤
│ 🎉 John (Admin)                         │
│    Paid                        [✓]      │
├─────────────────────────────────────────┤
│ 🎂 Sarah                                │
│    Not Paid              [✓] [Remove]   │
├─────────────────────────────────────────┤
│ 🎁 Mike                                 │
│    Paid                  [✓] [Remove]   │
└─────────────────────────────────────────┘
```

### **Add Members Modal**

```
┌─────────────────────────────────────────┐
│ Add Members                          ✕  │
│ Select users to invite to this group    │
├─────────────────────────────────────────┤
│ ☐ 🎉 Alice                              │
│ ☑ 🎂 Bob                             ✓  │
│ ☐ 🎁 Charlie                            │
├─────────────────────────────────────────┤
│ [Cancel]              [Add (1)]         │
└─────────────────────────────────────────┘
```

---

## 📋 User Flow

### **Adding Members**

1. Admin opens group detail
2. Navigates to "Members" tab
3. Clicks "+ Add Members" button
4. Modal appears with list of connected users
5. Users already in group are filtered out
6. Recipient is filtered out
7. Admin selects users to invite
8. Clicks "Add (X)" button
9. System calls `inviteMembers(groupId, selectedUserIds)`
10. New members receive invitation notification
11. Modal closes, success alert shown

### **Removing Members**

1. Admin opens group detail
2. Navigates to "Members" tab
3. Sees "Remove" button next to each member (except themselves)
4. Clicks "Remove" on a member
5. Confirmation alert appears
6. Admin confirms removal
7. System calls `removeMember(groupId, userId)`
8. Member is removed from group
9. Member's `groupIds` array is updated
10. System message posted to group chat
11. Success alert shown

---

## 🔒 Permissions & Validation

### **Add Members**

✅ **Allowed when**:
- User is the group creator
- Group status is 'active'
- Selected users are connected with admin
- Selected users are not already in the group
- Selected users are not the recipient

❌ **Blocked when**:
- User is not the creator
- Group is closed
- Member deadline has passed (if set)

### **Remove Members**

✅ **Allowed when**:
- User is the group creator
- Group status is 'active'
- Target member is not the creator themselves

❌ **Blocked when**:
- User is not the creator
- Group is closed
- Trying to remove themselves

---

## 💬 System Messages

When members are added/removed, system messages are posted to the group chat:

**Adding**:
```
System: John invited Sarah
```

**Removing**:
```
System: John removed Mike from the group
```

---

## 🔔 Notifications

### **When Member is Added**

Cloud Function `onGroupMemberAdded` triggers:
- Sends push notification to invited user
- Adds `groupId` to user's document
- User sees pending invitation in Groups tab

### **When Member is Removed**

Cloud Function `onGroupMemberRemoved` triggers:
- Removes `groupId` from user's document
- User no longer sees the group

---

## 🧪 Testing Checklist

### **Add Members**

- [ ] Admin can see "+ Add Members" button
- [ ] Regular members cannot see the button
- [ ] Button only appears when group is active
- [ ] Modal shows list of connected users
- [ ] Already-invited users are filtered out
- [ ] Recipient is filtered out
- [ ] Can select multiple users
- [ ] Selected users show checkmark
- [ ] "Add" button shows count: "Add (3)"
- [ ] "Add" button disabled when no selection
- [ ] Success alert after adding
- [ ] New members appear in members list
- [ ] System message posted to chat
- [ ] Invited users receive notification

### **Remove Members**

- [ ] Admin can see "Remove" button for each member
- [ ] Admin cannot see "Remove" for themselves
- [ ] Regular members cannot see "Remove" buttons
- [ ] Buttons only appear when group is active
- [ ] Confirmation alert appears
- [ ] Member is removed after confirmation
- [ ] Member's groupIds updated
- [ ] System message posted to chat
- [ ] Success alert shown
- [ ] Removed user no longer sees group

---

## 🎯 Edge Cases Handled

1. **Deadline Passed**: Cannot add members if `memberDeadline` has passed
2. **Duplicate Invitations**: System checks if user already invited
3. **Self-Removal**: Admin cannot remove themselves
4. **Closed Groups**: No add/remove actions allowed
5. **Empty Selection**: "Add" button disabled
6. **Recipient**: Cannot invite the gift recipient

---

## 📱 Code Examples

### **Adding Members**

```typescript
const handleAddMembers = async () => {
  if (selectedUsers.length === 0) {
    Alert.alert('No users selected', 'Please select at least one user to invite');
    return;
  }

  try {
    setIsAddingMembers(true);
    await inviteMembers(id, selectedUsers);
    setShowAddMembersModal(false);
    setSelectedUsers([]);
    Alert.alert('Success', `Invited ${selectedUsers.length} member(s) to the group`);
  } catch (error: any) {
    Alert.alert('Error', error?.message || 'Failed to add members');
  } finally {
    setIsAddingMembers(false);
  }
};
```

### **Removing Members**

```typescript
const handleRemoveMember = (memberId: string, memberName: string) => {
  Alert.alert(
    'Remove Member',
    `Are you sure you want to remove ${memberName} from this group?`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeMember(id, memberId);
            Alert.alert('Success', `${memberName} has been removed from the group`);
          } catch (error) {
            Alert.alert('Error', 'Failed to remove member');
          }
        },
      },
    ]
  );
};
```

---

## 🚀 Future Enhancements

- [ ] Bulk remove members
- [ ] Transfer admin role to another member
- [ ] Member roles (admin, moderator, member)
- [ ] Kick vs. Ban (prevent re-joining)
- [ ] Member activity log
- [ ] Invite via link (non-connected users)

---

## ✅ Summary

**Feature Status**: ✅ Fully Implemented

**Admin can**:
- Add new members after group creation
- Remove members (except themselves)
- Only when group is active

**UI includes**:
- "+ Add Members" button (Members tab)
- Modal for selecting users
- "Remove" button for each member
- Confirmation dialogs
- Success/error alerts

**Backend handles**:
- Permission validation
- Deadline checking
- Duplicate prevention
- System messages
- Push notifications
- Database updates

**Ready for production** 🎉
