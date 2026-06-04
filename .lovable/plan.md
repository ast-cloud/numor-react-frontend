
## Goal

The `/api/user/me` response no longer uses a `SUB_ACCOUNT` role to identify invited members. Instead every user now carries `isOrgOwner: boolean` plus a `permissions` object. Owners get full access; non-owners are gated by their per-module read/write flags. The Team & Permissions section must only appear for owners.

## Changes

### 1. `src/hooks/use-auth.tsx`
- Add `isOrgOwner: boolean` on `AuthUser` and read it from the `/api/user/me` payload (`data.isOrgOwner ?? false`).
- Always normalize `permissions` from the payload (not only for sub-accounts), so the `can()` check has data to work with for non-owners.
- Expose `isOrgOwner` on the context. Keep `isSubAccount` as a backwards-compat alias defined as `!isOrgOwner` so existing consumers (Sidebar, PermissionGuard, SMESettings) continue to behave correctly — non-owners are treated like sub-accounts for gating purposes.
- Drop the `SUB_ACCOUNT` special cases in `resolveActiveRole` / `setActiveRole`: role switching now keys off `isOrgOwner` (non-owners cannot switch roles).

### 2. `src/lib/permissions.ts`
- Rename the third arg semantically (still a boolean) and update the rule to: `if (isOrgOwner) return true; else check permissions[module][action]`. Call site in `use-auth` passes `isOrgOwner`.

### 3. `src/pages/SMESettings.tsx`
- Gate `<SubAccountsSection />` on `isOrgOwner` instead of `!isSubAccount`.
- Gate the Company Details card edit/read on `isOrgOwner || can("organizationSettings", ...)` — same effective behavior, just sourced from the new flag.

### 4. `src/components/PermissionGuard.tsx` and `src/components/Sidebar.tsx`
- Replace `isSubAccount` reads with `!isOrgOwner` (or keep using the alias). No UI changes; just renamed source of truth.

### 5. `src/lib/authStore.ts`
- Leave the `SUB_ACCOUNT` union member in place for now (harmless); the runtime no longer emits it. Optionally remove in a follow-up.

## Result

- Team & Permissions card hides for non-owners.
- Expenses/Income/Dashboard/OrganizationSettings routes and write actions respect the `permissions` map for non-owners; owners bypass all checks.
- No new API calls — single source of truth is the existing `/api/user/me` response.
