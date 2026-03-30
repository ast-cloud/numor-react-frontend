

## Plan: Fix Status After "Submit for Review" With Pending Updates

### Problem
In `CASettings.tsx` line 437, after `submitCAProfileForReview()`, the status is hardcoded to `"Under Review"`. This is wrong when the CA already has an approved profile with unverified updates — the correct status should be `"Updates Under Review"`. The `loadCAProfile()` function already handles this correctly via `deriveCAProfileStatus`.

### Fix

**`src/pages/CASettings.tsx`** (line 437):

Replace `setCaStatus("Under Review")` with `await loadCAProfile()`. This re-fetches both profiles and derives the correct status automatically.

### Files modified
- `src/pages/CASettings.tsx`

