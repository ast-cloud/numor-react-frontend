

## Plan: Enable Suspend Action for Approved Profiles with Unverified Updates

### Problem
The suspend button in the profile detail dialog is hidden for profiles in the "Approved - Unverified Updates" tab because the condition on line 744 requires `!selectedProfile?.pendingProfile`, which excludes profiles that have a pending update.

Additionally, `handleSuspend` (line 438) is a no-op — it shows a toast but never calls any API.

### Fix

**`src/components/admin/CAApplicationsReview.tsx`** — Two changes:

1. **Line 744**: Broaden the condition to show the suspend button for APPROVED profiles that either have no pending profile OR have a pending profile with status `"PENDING"` (unverified updates). Keep it hidden when pending profile status is `"UNDER_REVIEW"` (since that tab has its own approve/reject buttons).

   ```
   // Before:
   selectedProfile?.status === "APPROVED" && !selectedProfile?.pendingProfile

   // After:
   selectedProfile?.status === "APPROVED" && 
     (!selectedProfile?.pendingProfile || 
      (selectedProfile.pendingProfile as any).status !== "UNDER_REVIEW")
   ```

2. **`handleSuspend` (line 438)**: Wire it up to actually call the suspend API. Since the user indicated "use the same one used earlier," and no dedicated suspend endpoint exists in admin.ts, I need to add a `suspendCAProfileApi` function. Based on the existing pattern (approve/reject use GET), this would be `GET /api/admin/ca/caprofile/:caId/suspend`.

**`src/lib/api/admin.ts`** — Add:
```ts
export async function suspendCAProfileApi(caId: string) {
  const res = await fetch(`${config.backendHost}/api/admin/ca/caprofile/${caId}/suspend`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to suspend CA profile");
  return res.json();
}
```

Then update `handleSuspend` to call this API with loading state, error handling, toast, and count refresh — matching the pattern of `handleApprove`/`handleReject`.

### Files modified
- `src/lib/api/admin.ts`
- `src/components/admin/CAApplicationsReview.tsx`

