

## Plan: Fix "3 pending" Badge to Use Real API Data

### Problem
`AdminDashboard.tsx` imports `getPendingApplications()` from `caApplicationsStore.ts` — a mock in-memory store with 3 hardcoded pending entries. This produces the incorrect "3 pending" badge and card count, ignoring the real backend data.

### Fix

**`src/pages/AdminDashboard.tsx`**:
1. Remove the `import { getPendingApplications }` from `caApplicationsStore`
2. Import `fetchCAProfileCounts` from `@/lib/api/admin`
3. Add a `counts` state (with zeros default) and fetch real counts via `useEffect`
4. Replace `pendingCAApplications.length` with `counts.pendingReview` (sum of `underReview + updatesUnderReview`) for:
   - The "Pending CA Applications" stats card
   - The "X pending" badge next to "CA Applications" heading

### Technical detail
The counts API returns `underReview` and `updatesUnderReview` separately. The `pendingReview` aggregate field from the API can be used directly for the badge and card.

### Files modified
- `src/pages/AdminDashboard.tsx`

