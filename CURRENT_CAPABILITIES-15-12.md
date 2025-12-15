# RegaloApp — Current App Capabilities (as of today)

This document describes what the app can do **right now**, based on the current codebase and implemented screens/flows.

---

## App Overview

RegaloApp is a birthday-centric app that helps you:

- Keep track of birthdays in a calendar view
- Create a profile (with hobbies and gift preferences)
- Connect with other users (via username invitations)
- Manage notifications, language, and theme
- Control basic privacy (hide your age)
- Log out or delete your account

The app uses a database abstraction that can run on **Firebase** (primary) or fall back to a **Mock adapter** if Firebase config is missing/invalid.

---

## Authentication & Session

- **Create account (sign up)** using **email + password** (Firebase Auth).
- **Log in** using email + password.
- **Auto-login**:
  - Credentials are stored locally (AsyncStorage) and used to automatically sign the user back in.
  - If stored credentials fail, they are cleared and the user is considered logged out.
- **Log out**:
  - Signs out from Firebase Auth.
  - Clears locally stored user data and credentials.
- **Delete account**:
  - Deletes all connections where the user participates.
  - Deletes the user profile from Firestore.
  - Deletes the Firebase Auth account (can require “recent login”, as usual with Firebase).

---

## Navigation / Main Areas

The app uses a **Drawer** with a **Tab** navigator inside.

### Tabs (Main Home)
- **Calendar**
- **Profile**
- **Connect**

### Drawer screens
- **Home** (the tab navigator)
- **Settings**
- **Privacy Policy**
- **Account**
- (Hidden/internal routes: `profile`, `calendar`, `logout`)

---

## Onboarding / Create Profile Flow

From the Welcome screen you can create a profile. The flow is multi-step and stores data temporarily until the final step:

1. **Basic info**
   - Name
   - Birthdate (date picker; normalized to avoid timezone issues)
2. **Hobbies**
   - Choose from predefined hobby options
   - Add custom hobbies manually
   - Can skip
3. **Gift preferences**
   - Choose from predefined gift preference options
   - Add custom preferences manually
   - Can skip
4. **Avatar**
   - Pick an emoji avatar from a large predefined list
5. **Username**
   - Must match:
     - 3–20 characters
     - letters / numbers / underscore only
   - Availability is checked with debounce against the database
   - Stored normalized to lowercase
6. **Email & password**
   - Email format validation
   - Password minimum length: **8**
   - Confirm password required
   - Creates:
     - Firebase Auth user
     - Firestore user profile (using the Auth UID as the document ID)

After creation, the user is redirected into the app (Calendar tab).

---

## Calendar (Birthdays)

The Calendar tab provides:

- **Monthly calendar view**
  - Navigate to previous/next month
  - Shows markers/avatars on days with birthdays
- **Day details modal**
  - Tap a day to see birthdays on that date
  - Tap a user (non-manual entries) to open a profile modal
- **Month summary**
  - Shows total birthdays in the current month
  - Opens a modal list of all birthdays that month

### Manual birthday entries
You can add birthdays manually (not tied to a real user):

- Add a name + date
- Stored under the logged-in user profile (`manualBirthdays`)
- Manual entries:
  - Show in the calendar
  - Use a fixed avatar (`🎂`)
  - Do not open the “real user profile” modal

---

## Connections (Social / Network)

The Connect tab supports:

- **Invite by username**
  - Enter `@username` to send a connection request
- **Pending invitations**
  - View incoming requests
  - Accept / reject requests
- **Accepted connections list**
  - View connected users
  - Open a connected user profile modal
  - Disconnect a user (removes the connection)
- **Badge + in-app notification behavior**
  - The tabs show a badge count (`notificationCount`)
  - An in-app banner notification can appear when new pending invitations arrive
  - Badge count is synced to the OS badge number (via `expo-notifications`)

### Invitation links (deep links)
The context also supports creating and sharing invite links via deep links, but the current UI is primarily built around **username invitations**.

---

## Profile Management

In Profile tab you can view and edit:

- **Avatar** (emoji selection modal)
- **Name**
- **Username**
  - Same validation rules as in onboarding
  - Availability checked (debounced) when editing
- **Hobbies**
  - Select predefined hobbies
  - Add custom hobbies
- **Gift preferences**
  - Select predefined gift preferences
  - Add custom custom entries

### Read-only fields
- **Email** is displayed but not editable.
- **Birthdate** is displayed but not editable.

### Privacy: hide age
- Toggle “Hide age”
- If enabled, the app shows **next birthday date (day + month)** instead of age in relevant places.
- There is a **daily change limit** mechanism:
  - “Hide age” changes are limited to **3 changes** (tracked with a counter + last change date).
  - Name changes are also limited to **3 changes** per day (same mechanism).

---

## Settings

The Settings screen supports:

- **Theme toggle**
  - Switch between dark and light mode
- **Notifications toggle**
  - Enables/disables notifications at app level
  - If the OS permission is not granted, the app requests it
  - If disabled, the app clears the saved push token from Firestore
- **Language selection**
  - Supported languages: **Spanish (es), English (en), German (de)**
  - Changing language requires restarting the app to fully apply changes (the UI warns about it)

---

## Notifications (Push)

The app integrates notifications using `expo-notifications`:

- Requests and tracks OS notification permission
- Retrieves an **Expo push token** (requires a physical device)
- Saves the token to the user in Firestore (`fcmToken`, `fcmTokenUpdatedAt`)
- Handles notifications in foreground (alerts/sounds/badges enabled)
- Handles notification taps and can open a birthday-related modal:
  - `type === 'birthday'` (optionally includes a `userId`)
  - `type === 'monthly_summary'` (opens the modal without a specific user)

---

## Privacy Policy Screen

- Shows an in-app privacy policy and links to a hosted full policy page.
- Mentions use of Firebase services (Auth, Firestore, Messaging) and data categories.

---

## Data & Storage Summary

- **Backend**: Firebase (Auth + Firestore) via a database adapter abstraction.
- **Local storage** (AsyncStorage):
  - Stored user profile data
  - Stored credentials for auto-login
  - Notification preference toggle
  - App language selection

---

## Known Constraints / Notes (current behavior)

- **Push notifications** require a **physical device** (Expo limitation).
- Language change UX indicates you must **restart** the app to apply fully.
- Some UI strings are still Spanish hardcoded in places (e.g. Avatar selection title text, some logout dialogs), even though the app supports i18n.