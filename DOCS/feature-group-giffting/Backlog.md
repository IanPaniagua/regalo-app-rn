# Group Gifting Feature - Backlog

**Last Updated:** December 17, 2025  
**Status:** Active Development

---

## 📋 Pending User Stories

### US-NOTIF-1: Unread Message Indicators

**As a** group member  
**I want to** see a visual indicator when there are unread messages in a group  
**So that** I can quickly identify which groups need my attention without opening each one

#### Acceptance Criteria

- **AC 1:** Red circle badge appears on group card when unread messages exist
  - Badge displays on the top-right corner of the group card
  - Badge is visible in both Active and History group lists
  - Badge color: Red (#EF4444) for high visibility

- **AC 2:** Badge shows unread message count
  - Display numeric count (e.g., "3") when count ≤ 99
  - Display "99+" when count > 99
  - Badge size adjusts to accommodate 1-3 digits

- **AC 3:** Badge updates in real-time
  - Badge appears immediately when new message arrives
  - Badge updates when user opens the group chat
  - Badge clears when user views all messages in the group

- **AC 4:** Unread state persists across app sessions
  - Unread count stored in Firestore under user's group membership
  - Last read timestamp tracked per user per group
  - State syncs automatically via Firebase real-time listeners

- **AC 5:** Badge behavior for different message types
  - User messages trigger badge update
  - System messages (e.g., "User joined") trigger badge update
  - Own messages do not trigger badge for the sender

- **AC 6:** Badge clears when group is viewed
  - Opening group detail screen marks messages as read
  - Last read timestamp updates to current time
  - Badge disappears from group card immediately

#### Technical Requirements

- **Data Model:**
  ```typescript
  interface GroupMember {
    // ... existing fields
    lastReadAt?: Date;
    unreadCount?: number;
  }
  ```

- **Firebase:**
  - Cloud Function to calculate unread count per user
  - Real-time listener for message updates
  - Batch update for marking messages as read

- **UI Components:**
  - Reusable `UnreadBadge` component
  - Position: absolute, top-right of group card
  - Styling: matches app theme (dark mode compatible)

#### Definition of Done

- [ ] Badge component created and styled
- [ ] Firestore schema updated with lastReadAt field
- [ ] Cloud Function for unread count calculation deployed
- [ ] Real-time listeners implemented in GroupsContext
- [ ] Badge appears/disappears correctly in all scenarios
- [ ] Manual testing on iOS and Android
- [ ] No performance degradation with multiple groups
- [ ] Translations added for accessibility (if needed)

#### Dependencies

- Existing GroupsContext
- Firebase Cloud Functions
- Firestore security rules update (read access to lastReadAt)

#### Estimated Effort

**Medium** (3-5 days)
- Day 1: Data model and Firestore setup
- Day 2: Cloud Function for unread count
- Day 3: UI component and integration
- Day 4: Testing and edge cases
- Day 5: Polish and documentation

---

## 🔮 Future Considerations

### Potential Enhancements

- **Push Notifications:** Send push notification when unread count > 0
- **Sound/Vibration:** Optional alert when new message arrives while app is open
- **Message Preview:** Show last message preview on group card
- **Mute Groups:** Allow users to mute notifications for specific groups
- **Read Receipts:** Show who has read messages (privacy considerations)

### Related Features

- **US-NOTIF-2:** In-app notification center for all group activities
- **US-NOTIF-3:** Email digest for unread messages (daily/weekly)
- **US-CHAT-1:** Message reactions and emoji support
- **US-CHAT-2:** Reply to specific messages (threading)

---

## 📝 Notes

- This feature builds on the existing real-time chat infrastructure
- Consider performance impact with large number of groups (100+)
- Ensure badge is accessible (screen reader support)
- Test with slow network conditions
- Consider offline behavior (badge should persist)

---

## 🎯 Success Metrics

Once implemented, track:
- **Engagement:** % increase in group chat activity
- **Response Time:** Average time to respond to messages
- **User Feedback:** Satisfaction with notification system
- **Performance:** Badge update latency (target: <500ms)

