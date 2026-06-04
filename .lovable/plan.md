## Goal

Replace the broken `GET /api/sub-accounts` call (returning 404) with `GET /api/user/subAccounts`, and map the new response shape into the existing `SubAccount` UI.

## Changes

### `src/lib/api/subAccounts.ts`
- Update `listSubAccounts()` to call `/api/user/subAccounts` instead of `/api/sub-accounts`.
- Map response fields to the existing `SubAccount` shape:
  - `id`, `name`, `email`, `permissions`, `createdAt` → pass through
  - `isDisabled` → derive as `!item.isActive`
- Keep the `json.data ?? json` unwrap fallback already in `authedFetch`.

No other files need changes — `SubAccountsSection.tsx` already renders this shape, and gating on `isOrgOwner` is already in place from the previous change.

## Out of scope

- Enable/disable, edit-permissions, delete, reset-password endpoints still point at `/api/sub-accounts/:id/...`. They will be updated when the user provides the new endpoints; this plan only fixes the list call.
