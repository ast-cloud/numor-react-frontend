

## Plan: Re-fetch CA Profile Status After Every Save Action

### Problem
After saving address or professional details, the backend may create a `pendingProfile`, changing the derived status (e.g., "Verified" → "Unverified Updates"). But the code never re-fetches the profile after save — it only updates the local form state. The status badge stays stale until a full page refresh. Only "Submit for Review" manually sets `setCaStatus("Under Review")`.

### Fix

**`src/pages/CASettings.tsx`** — Extract the CA profile loading logic (lines 136–170) into a reusable `loadCAProfile` function, then call it after every successful save:

1. Move the `loadCAProfile` async function out of the `useEffect` so it can be called independently (define it at component scope with `useCallback` or just as a standalone async function).
2. Call `loadCAProfile()` after each successful save:
   - After `updateCAProfileAPI(payload)` in `handleSaveProfessional` (~line 380)
   - After `updateCAProfileAPI(payload)` in the address save handler (~line 711)
   - After `uploadCADocument` and `deleteCADocument` calls
3. This re-fetches `currentProfile` and `pendingProfile`, re-derives the status via `deriveCAProfileStatus`, and updates all form state — keeping the UI in sync without a page refresh.

### Files modified
- `src/pages/CASettings.tsx`

