

## Plan: Integrate CA Profile Counts API

### What changes

1. **`src/lib/api/admin.ts`** — Add `fetchCAProfileCounts()` function that calls `GET /api/admin/ca-profiles/counts` and returns the counts data.

2. **`src/components/admin/CAApplicationsReview.tsx`** — 
   - Fetch counts from the API on mount using `useEffect`
   - Replace all hardcoded `.length` counts (from local mock data) with API-returned values
   - Map API response keys to tabs:
     - Summary cards: `pendingReview`, `verified` (Approved), `allRejected`, `suspended`, `unverified`
     - Main tab labels: same as above
     - Sub-tab labels: `underReview` (New Profiles), `updatesUnderReview` (Updates), `rejected` (Rejected Profiles), `updatesRejected` (Rejected Updates)
   - Show loading state while counts are being fetched
   - Keep existing local mock data for table content (only counts come from API for now)

### Technical details

**API helper:**
```typescript
export async function fetchCAProfileCounts() {
  const res = await fetch(`${config.backendHost}/api/admin/ca-profiles/counts`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch CA profile counts');
  const json = await res.json();
  return json.data ?? json;
}
```

**Response mapping to UI:**
| API Key | UI Location |
|---------|------------|
| `pendingReview` | Pending Review card + main tab |
| `underReview` | Pending > New Profiles sub-tab |
| `updatesUnderReview` | Pending > Updates sub-tab |
| `verified` | Approved card + tab |
| `allRejected` | Rejected card + main tab |
| `rejected` | Rejected > Rejected Profiles sub-tab |
| `updatesRejected` | Rejected > Rejected Updates sub-tab |
| `suspended` | Suspended card + tab |
| `unverified` | Unverified card + tab |
| `total` | Available for future use |

**Component state:** Store counts in a `counts` state object with a default of all zeros, updated via `useEffect` on mount.

