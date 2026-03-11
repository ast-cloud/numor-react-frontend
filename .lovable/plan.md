

# Upload Profile Photo on Crop Apply

## Current Behavior
When the user crops and clicks "Apply", the image is converted to a base64 data URL via `canvas.toDataURL()` and stored **only in React state** (in-memory). Nothing is uploaded to the backend — a refresh loses it.

## Plan

### 1. Add `uploadProfilePhoto` API function (`src/lib/api/user.ts`)
- `POST` to `${config.backendHost}/api/user/profilePhoto`
- Convert the base64 data URL to a `File`/`Blob`, attach it as `file` in a `FormData`
- Return the new `photoUrl` from the response on success

### 2. Update `ProfilePictureUpload.tsx` — upload on crop confirm
- In `handleCropConfirm`, after cropping the image, call `uploadProfilePhoto(croppedBase64)`
- Only call `onImageChange(newUrl)` after a successful upload response
- Show a loading state ("Uploading...") on the Apply button during the request
- On failure, show an error toast and don't update the image state
- On success, use the returned `photoUrl` as the new image (server URL instead of base64)

### Files Changed
- `src/lib/api/user.ts` — add `uploadProfilePhoto`
- `src/components/ProfilePictureUpload.tsx` — call upload in `handleCropConfirm`

