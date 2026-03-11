

# Fix Profile Picture Not Updating After Upload

## Problem
After uploading a cropped photo, the `ProfilePictureUpload` component doesn't visually update until a full page refresh, even though the state is being set correctly. This is likely caused by Radix Avatar's internal image loading state machine not re-evaluating when the `src` changes, or browser-level image caching of the signed URL.

## Solution
Two small changes to ensure the Avatar re-renders reliably:

### 1. `src/components/ProfilePictureUpload.tsx`
- Change the Avatar `key` to use a more unique value (e.g., include a timestamp or use the full URL) so that any URL change — even subtle ones — forces a complete remount of the Radix Avatar component.
- Current: `key={currentImage || 'no-image'}` — if URLs are similar or cached, Radix may not re-evaluate.
- New: `key={currentImage ? currentImage + Date.now() : 'no-image'}` — forces remount on every change.

Actually a simpler, cleaner approach: just append a cache-busting query param when setting the new image URL from upload, ensuring the browser fetches the fresh image.

### 2. `src/lib/api/user.ts` — `uploadProfilePhoto`
- Append a cache-busting param (`?t=<timestamp>`) to the returned `photoUrl` to prevent browser caching of the old image at the same signed URL pattern.

### Files Changed
- `src/lib/api/user.ts` — cache-bust returned URL
- `src/components/ProfilePictureUpload.tsx` — ensure unique key on Avatar

