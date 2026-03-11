

# Fetch Profile Photo from API

## What
Add an API helper to fetch the user's profile photo URL from `GET /api/user/profilePhoto`, then use it in both CASettings and SMESettings pages to display the current profile picture. The photo loads lazily (non-blocking).

## Technical Plan

### 1. Add API function in `src/lib/api/user.ts`
Add `fetchProfilePhoto()` that calls `GET ${config.backendHost}/api/user/profilePhoto` and returns the `photoUrl` string (or `null` on error/404).

### 2. Update `src/pages/CASettings.tsx`
- In the existing `loadUser` useEffect, call `fetchProfilePhoto()` and set `profilePicture` state with the returned URL.
- Use a separate async call so it doesn't block other data loading.

### 3. Update `src/pages/SMESettings.tsx`
- Same approach: add a useEffect that calls `fetchProfilePhoto()` on mount and sets `profilePicture`.

### 4. Lazy loading
- The `AvatarImage` in `ProfilePictureUpload` already renders an `<img>` tag. Add `loading="lazy"` to the `AvatarImage` to ensure the browser fetches the photo without blocking page render.
- The fetch call itself is async and non-blocking by nature.

### Files Changed
- `src/lib/api/user.ts` — add `fetchProfilePhoto`
- `src/pages/CASettings.tsx` — fetch photo on mount
- `src/pages/SMESettings.tsx` — fetch photo on mount
- `src/components/ProfilePictureUpload.tsx` — add `loading="lazy"` to AvatarImage

