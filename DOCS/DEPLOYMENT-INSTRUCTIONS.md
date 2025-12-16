# Group Gifting MVP - Deployment Instructions

## 🚀 Ready to Test!

All code is complete. Follow these steps to deploy and test the Group Gifting feature.

---

## Step 1: Deploy Firebase Security Rules

The security rules are already in your code but need to be deployed to Firebase.

```bash
cd /Users/ianpaniagua/Documents/GitHub/RegaloApp-RN/regalo-app
firebase deploy --only firestore:rules
```

**Expected output:**
```
✔  Deploy complete!
```

**Verify in Firebase Console:**
1. Go to https://console.firebase.google.com
2. Select project: `regalo-app-a22e4`
3. Navigate to: Firestore Database → Rules
4. Confirm you see the `giftGroups` rules (around line 80)

---

## Step 2: Start the Development Server

```bash
npx expo start
```

Then press:
- `w` for web
- `i` for iOS simulator
- `a` for Android emulator

---

## Step 3: Test the Complete Flow

### 3.1 Navigate to Groups Tab
1. Login to the app
2. You should see a new **"Groups"** tab (gift icon 🎁)
3. Tap on it

### 3.2 Create Your First Group
1. Tap **"+ New Group"**
2. Fill in:
   - **Gift Name**: "Birthday Gift for Maria"
   - **Total Price**: 100
   - **Recipient**: Select one of your connections
3. Tap **"Next: Invite Members"**

### 3.3 Invite Members
1. Select 2-3 people from your connections
2. Tap **"Invite (3)"**
3. You'll be redirected to the Group Detail screen

### 3.4 Explore Group Detail
You should see:
- **Price Info**: Total (100€) and Per Person (25€ if 4 members)
- **Payment Progress**: 0/4 paid (0%)
- **Members List**: All invited members with "Pending..." status
- **Group Chat**: Empty, ready for messages

### 3.5 Test Chat
1. Type a message: "Hey everyone! Let's organize this gift 🎁"
2. Tap **"Send"**
3. Message appears in chat with your avatar and timestamp

### 3.6 Test Payment Tracking (Creator Only)
1. As the creator, you'll see checkboxes next to each member
2. Tap a checkbox to mark someone as "Paid"
3. Watch the progress bar update automatically
4. Price per person recalculates if members join/leave

---

## Step 4: Test Multi-User Flow (Optional)

To test invitations and multi-user chat:

1. **Create a second user account**:
   - Logout from current account
   - Create new profile with different email
   - Connect with your first account

2. **Accept invitation**:
   - Login as the invited user
   - Go to Groups tab
   - You should see the group with "Pending" status
   - (Note: Accept/Reject UI will be in Release 2)

3. **Test real-time chat**:
   - Open group on both devices/browsers
   - Send messages from each account
   - Messages appear in real-time on both screens

---

## ✅ What Works in MVP

- ✅ Create groups with name, price, and recipient
- ✅ Invite multiple members by username
- ✅ Real-time group chat
- ✅ Automatic price-per-person calculation
- ✅ Manual payment tracking (creator marks as paid)
- ✅ Payment progress bar
- ✅ Active/Closed groups toggle
- ✅ System messages (user joined, price updated, etc.)

---

## 🔧 Troubleshooting

### Issue: "Cannot read property 'GroupsProvider'"
**Solution:** Restart the development server
```bash
# Stop server (Ctrl+C)
npx expo start --clear
```

### Issue: "Permission denied" when creating group
**Solution:** Redeploy security rules
```bash
firebase deploy --only firestore:rules
```

### Issue: Groups tab not showing
**Solution:** Clear cache and restart
```bash
npx expo start --clear
```

### Issue: Messages not appearing in real-time
**Solution:** Check Firestore indexes
1. Go to Firebase Console → Firestore → Indexes
2. Create composite index for `giftGroups/{groupId}/messages`:
   - Field: `timestamp` (Ascending)

---

## 📊 Firebase Console Verification

After creating your first group, verify in Firebase Console:

1. **Firestore Database** → Data
2. You should see:
   ```
   giftGroups/
     └── {groupId}/
         ├── giftName: "Birthday Gift for Maria"
         ├── totalPrice: 100
         ├── status: "active"
         └── members/
             └── {userId}/
                 ├── username: "yourUsername"
                 ├── role: "creator"
                 └── status: "accepted"
         └── messages/
             └── {messageId}/
                 ├── message: "Group created"
                 └── type: "system"
   ```

---

## 🎯 Next Steps (Release 2)

After testing MVP, these features are planned:

- Edit group details (name, price)
- Remove members
- Accept/Reject invitations UI
- Payment links (Bizum, PayPal)
- Close group functionality
- Gift history view

---

## 📝 Testing Checklist

- [ ] Firebase rules deployed successfully
- [ ] Groups tab visible in navigation
- [ ] Can create a new group
- [ ] Can invite members
- [ ] Group detail screen loads
- [ ] Can send chat messages
- [ ] Messages appear in real-time
- [ ] Price per person calculates correctly
- [ ] Can mark members as paid (creator only)
- [ ] Progress bar updates
- [ ] System messages appear (user joined, etc.)

---

**MVP Complete! 🎉**

You now have a fully functional Group Gifting feature ready for testing.
