

## Plan: Rename Internal Tab Values to Match Count API Keys

### What changes

**`src/components/admin/CAApplicationsReview.tsx`** — Rename all internal tab `value` attributes to use the count API key names. Display labels remain unchanged.

### Tab value mapping

| Current value | New value | Display label |
|---|---|---|
| `pending-review` | `pendingReview` | Pending Review |
| `new-profiles` | `underReview` | New Profiles |
| `updates` | `updatesUnderReview` | Updates |
| `approved` | `verified` | Approved |
| `rejected` (main) | `allRejected` | Rejected |
| `rejected-profiles` | `rejected` | Rejected Profiles |
| `rejected-updates` | `updatesRejected` | Rejected Updates |
| `suspended` | `suspended` | (no change) |
| `unverified` | `unverified` | (no change) |

### Affected lines

Update `defaultValue`, `TabsTrigger value=`, and `TabsContent value=` props throughout the component (~18 string replacements). No logic, layout, or display text changes.

### Backend reference (not implemented here — for your backend)

```javascript
// GET /api/admin/ca-profiles?tab=underReview&page=1&limit=20
router.get('/ca-profiles', async (req, res) => {
  const { tab = 'underReview', page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const whereClause = getWhereClause(tab);
  if (!whereClause) return res.status(400).json({ success: false, error: 'Invalid tab' });

  const includeClause = getIncludeClause(tab);
  const selectClause = getSelectClause(tab);

  const [profiles, total] = await Promise.all([
    prisma.cAProfile.findMany({
      where: whereClause, skip, take,
      ...(selectClause ? { select: selectClause } : { include: includeClause }),
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.cAProfile.count({ where: whereClause }),
  ]);

  res.json({
    success: true,
    data: { profiles, total, page: Number(page), limit: take,
            totalPages: Math.ceil(total / take) },
  });
});

function getWhereClause(tab) {
  switch (tab) {
    case 'unverified':         return { status: 'PENDING', pendingProfile: null };
    case 'underReview':        return { status: 'UNDER_REVIEW', pendingProfile: null };
    case 'verified':           return { status: 'APPROVED', pendingProfile: null };
    case 'rejected':           return { status: 'REJECTED', pendingProfile: null };
    case 'suspended':          return { status: 'SUSPENDED' };
    case 'unverifiedUpdates':  return { status: 'APPROVED', pendingProfile: { status: 'PENDING' } };
    case 'updatesUnderReview': return { status: 'APPROVED', pendingProfile: { status: 'UNDER_REVIEW' } };
    case 'updatesRejected':    return { status: 'APPROVED', pendingProfile: { status: 'REJECTED' } };
    default: return null;
  }
}

function getIncludeClause(tab) {
  const base = { user: { select: { name: true, email: true, phone: true } },
                 documents: true };
  if (['updatesUnderReview', 'updatesRejected', 'unverifiedUpdates'].includes(tab)) {
    return { ...base, pendingProfile: { include: { documents: true } } };
  }
  return base;
}

function getSelectClause(tab) {
  if (tab === 'unverified') {
    return {
      id: true, createdAt: true,
      user: { select: { name: true, email: true, phone: true } },
    };
  }
  return null;
}
```

### Files modified
- `src/components/admin/CAApplicationsReview.tsx` — rename tab value strings only

