

## Plan: Replace System Health Card with Pending CA Applications and Recent Signups

### What changes

**File: `src/pages/AdminDashboard.tsx`**

1. Replace the single "System Health" card (lines 111-120) with two new cards:
   - **Pending CA Applications** — shows `pendingCAApplications.length` with a `Clock` icon
   - **Recent Signups** — counts users with `createdAt` within the last 7 days, using a `UserPlus` icon

2. Change the grid from `lg:grid-cols-4` to `lg:grid-cols-5` (or keep 4 and drop one of the existing cards). Since 5 columns may be tight, we'll keep the 4-column grid and split the System Health slot into two cards, making it a 5-card grid (`lg:grid-cols-5`).

3. Add imports for `Clock` and `UserPlus` from lucide-react.

4. Compute `recentSignups` by filtering `allUsers` where `createdAt` is within the last 7 days.

### Technical details

```typescript
// Recent signups calculation
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
const recentSignups = allUsers.filter(u => u.createdAt && new Date(u.createdAt) >= sevenDaysAgo);
```

The pending CA applications count already exists via `pendingCAApplications` variable.

