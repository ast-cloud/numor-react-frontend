## Fix: Phone Number Not Saving in SME and CA Settings

### Root Cause

Both `SMESettings.tsx` and `CASettings.tsx` have `handleSaveProfile` functions with a `// TODO: Call profile update API when available` comment. They show a success toast but never actually call any backend API to persist the phone number (or name). The phone value is lost on page refresh.

### Plan

1. **Add `updateUserProfile` API function in `src/lib/api/user.ts**`
  - PUT to `/api/users/update`with `{ name, phone }`
  - Follow the same pattern as `updateOrganization`
2. **Update `SMESettings.tsx` `handleSaveProfile**`
  - Call `updateUserProfile({ name, phone })` instead of just showing a toast
  - Add loading state and error handling (like `handleSaveCompany` already does)
3. **Update `CASettings.tsx` `handleSaveProfile**`
  - Same: call `updateUserProfile({ name, phone })` with loading/error handling
4. **Populate phone from backend on load**
  - Both pages need to fetch the user's phone from `/api/user/me` on mount (the response already includes `phone`)
  - Initialize `profileData.phone` from the fetched data instead of empty string

### Questions needed

The backend endpoint for updating user profile needs to be confirmed. Common patterns would be `PUT /api/user/update` or `PUT /api/user/me`.