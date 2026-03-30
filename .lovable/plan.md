

## Plan: Merge pendingProfile Over currentProfile Instead of Replacing

### Problem
Line 143 in `CASettings.tsx` does `const data = (pendingProfile ?? currentProfile)`. When a verified CA saves changes, the backend creates a `pendingProfile` with only the modified fields — all other fields are null. On reload, the code picks the entire `pendingProfile`, so unchanged fields become empty strings.

### Fix

**`src/pages/CASettings.tsx`** (line 143):

Replace:
```ts
const data = (pendingProfile ?? currentProfile) as Record<string, unknown> | null;
```

With:
```ts
const data = pendingProfile
  ? { ...currentProfile, ...Object.fromEntries(Object.entries(pendingProfile).filter(([, v]) => v != null)) }
  : currentProfile;
```

This merges non-null fields from `pendingProfile` on top of `currentProfile`, so unchanged fields retain their original values.

### Files modified
- `src/pages/CASettings.tsx`

