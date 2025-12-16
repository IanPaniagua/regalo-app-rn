# RegaloApp – Group Gifting MVP

**Status:** ✅ **COMPLETED** (16 December 2025)  
**Releases:** MVP (R1) + Flexibility (R2) + Automation (R3) + Extras

The goal is to complete each activity step by step, but first we define a development strategy.

## Backbone (Main Activities)
- [x] Group Creation (Setup)
- [x] Invitation & Access (Onboarding)
- [x] Coordination & Chat (Communication)
- [x] Payment Management (Core Value)
- [x] Notifications (Engagement)

---

## Release 1 – MVP (Validation) ✅ **COMPLETADO**
**Goal:** Enable a group to organize, chat, and track payments manually but accurately.  


### Activity 1: Group Creation

#### [US 1.1] Create Group ✅
- [x] Story: As a Group Creator, I want to create a new gift group with a name and total price.
  - [x] AC 1: User can input Gift Name (max 50 chars)
  - [x] AC 2: User can input Total Price (numeric, positive)
  - [x] AC 3: Group is created with Creator as Admin and status "Active"
  - [x] **EXTRA:** Optional gift description field
  - [x] **EXTRA:** Member acceptance deadline with DatePicker

---

### Activity 2: Invitation & Access

#### [US 2.1] Invite Users ✅
- [x] Story: As a Creator, I want to invite users by username.
  - [x] AC 1: Search field for usernames
  - [x] AC 2: Invited users appear in a "Pending" list
  - [x] AC 3: Cannot invite the same user twice
  - [x] **EXTRA:** Validation prevents inviting after deadline
  - [x] **EXTRA:** Cloud Functions sync groupIds automatically

#### [US 2.2] Accept / Reject Invitation ✅
- [x] Story: As an Invitee, I want to view gift details before accepting.
  - [x] AC 1: Invitation screen shows who invited, gift name, total price
  - [x] AC 2: "Accept" adds user to group and chat
  - [x] AC 3: "Reject" removes invite; user does not join
  - [x] **EXTRA:** Dedicated pending invitations section in Groups tab
  - [x] **EXTRA:** Validation prevents accepting after deadline

---

### Activity 3: Coordination & Chat

#### [US 3.1] Group Chat ✅
- [x] Story: As a Member, I want to send and receive messages.
  - [x] AC 1: Messages appear in chronological order
  - [x] AC 2: Sender name and timestamp visible
  - [x] AC 3: Real-time updates (no refresh needed)
  - [x] **EXTRA:** System messages for group events
  - [x] **EXTRA:** Read-only chat for closed groups

---

### Activity 4: Payment Management

#### [US 4.1] Automatic Price per Person Calculation ✅
- [x] Story: As a Member, I want to see exactly how much I pay automatically.
  - [x] AC 1: System displays "Price per person"
  - [x] AC 2: Formula = Total Price / (1 Creator + Accepted Members)
  - [x] AC 3: Updates immediately when a member joins or is removed
  - [x] **EXTRA:** Shows "Estimated" before deadline, final price after
  - [x] **EXTRA:** Individual payment amount shown next to each member

#### [US 4.2] Manual Payment Tracking ✅
- [x] Story: As a Creator, I want to mark members as Paid.
  - [x] AC 1: Checkbox/toggle next to each member
  - [x] AC 2: Only Creator can change status
  - [x] AC 3: Status changes visible immediately to all members

---

## Release 2 – Flexibility & Smart Adjustments ✅ **COMPLETADO**
**Goal:** Handle real-world changes (price updates, members leaving)

### Activity 1: Group Creation (Edit Mode)

#### [US 1.2] Edit Gift Details ✅
- [x] Story: As a Creator, I want to edit gift name or total price.
  - [x] AC 1: Edit button visible only to Creator
  - [x] AC 2: Changing price recalculates price per person
  - [x] AC 3: System message in chat: "Laura updated the price to 150€"

### Activity 2: Invitation & Access (Management)

#### [US 2.3] Remove Member ✅
- [x] Story: As a Creator, I want to remove a member who backed out.
  - [x] AC 1: Remove option visible only to Creator
  - [x] AC 2: Removed user loses access to chat
  - [x] AC 3: Price per person updates automatically

### Activity 4: Payment Management (Visuals)

#### [US 4.3] Payment Progress Bar ✅
- [x] Story: As a Member, I want a visual progress bar for payments.
  - [x] AC 1: Shows % Paid Members / Total Members
  - [x] AC 2: Turns green when 100% is reached

---

## Release 3 – Automation & Closure ✅ **COMPLETADO**
**Goal:** Reduce friction and close the loop

### Activity 4: Payment Management (Facilitation)

#### [US 4.4] Payment Link Sharing ✅
- [x] Story: As a Creator, I want to add a payment link for easy payment.
  - [x] AC 1: Optional Payment Link field in settings
  - [x] AC 2: Clickable and visible to all members
  - [x] AC 3: System validates URL format

### Activity 5: Closure & History

#### [US 5.1] Close Group ✅
- [x] Story: As a Creator, I want to close the group after birthday.
  - [x] AC 1: "Close Group" available for admin (no payment requirement)
  - [x] AC 2: Group moves to History tab
  - [x] AC 3: Chat becomes read-only
  - [x] **EXTRA:** Confirmation dialog with translations
  - [x] **EXTRA:** Visual "Closed" badge in header

#### [US 5.2] Gift History ✅
- [x] Story: As a User, I want to see past gifts.
  - [x] AC 1: Past Gifts section/tab
  - [x] AC 2: Shows Gift Name, Date, Recipient, Final Price
  - [x] **EXTRA:** Toggle between Active/History with counters

---

## Summary
- ✅ MVP: Core flow + automatic calculation  
- ✅ Release 2: Flexibility & error handling  
- ✅ Release 3: Quality of life (payment links + history)
- ✅ **Extras:** Multilingual support + Enhanced UX features

---

## 🎁 Extra Features Implemented

During development, several additional features were implemented that were not originally planned:

### 1. **Full Multilingual System**
- Support for 3 languages: Spanish, English, German
- All group-related screens translated
- Variable interpolation in translations
- Dynamic change based on user preference

### 2. **Gift Description**
- Optional field when creating a group
- Allows explaining the context of the gift
- Visible in the group detail screen

### 3. **Member Acceptance Deadline**
- DatePicker to select the acceptance deadline
- Validation: no invites/acceptances allowed after the deadline
- Note "(Don't pay before)" next to the date
- Estimated vs final price calculation based on the deadline

### 4. **Estimated vs Final Price**
- Before the deadline: shows estimated price (includes all invited members)
- After the deadline: shows final price (only accepted members)
- Dynamic label "(Estimated)" or "Per Person"

### 5. **Recipient's Birthday**
- Displayed in the group header
- Format: "Birthday: January 15"
- Retrieved automatically from the user's profile

### 6. **Improved Invitation System**
- Dedicated section for pending invitations
- Clear UI for accept/reject actions
- States: pending, accepted, rejected
- Cloud Functions for automatic synchronization

### 7. **Individual Amount per Member**
- Each member can see how much they have to pay
- Visible in the members list
- Automatically updated in real time

### 8. **Active/History Toggle**
- Easy switch between active and closed groups
- Counter of groups in each section
- Persistence of the selected state

### 9. **Cloud Functions for Notifications**
- Automatic synchronization of groupIds
- Remote push notifications
- Handling of group events

### 10. **Improved Debug Logging**
- Detailed logs for troubleshooting
- Faster issue identification
- Better development experience

---

You should always keep the project's Definition of Done (DoD) in mind for each release and user story, including acceptance criteria and code quality.
The DoD is in @DoD.txt