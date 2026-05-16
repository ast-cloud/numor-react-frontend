# Sub-Accounts with Per-Module Permissions

Let SME owners invite employees as `SUB_ACCOUNT` users with granular read/write permissions on Dashboard, Income, Expenses, and Settings. Sub-accounts belong to the owner's organization and see only what they're allowed to.

## Permissions model

Stored as JSONB on the user (only when role is `SUB_ACCOUNT`, else `null`):

```json
{
  "dashboard": { "read": true,  "write": false },
  "income":    { "read": true,  "write": true  },
  "expense":   { "read": true,  "write": true  },
  "settings":  { "read": false, "write": false }
}
```

Semantics:

- `read: false` → route is blocked, sidebar item hidden.
- `read: true, write: false` → page is view-only (create/edit/delete buttons hidden, forms disabled).
- `write: true` implies `read: true` (enforced in UI + backend).

## Frontend changes

### 1. Auth + role plumbing

- `src/lib/authStore.ts`: add `"SUB_ACCOUNT"` to `UserRole`.
- `src/hooks/use-auth.tsx`:
  - Map backend role `SUB_ACCOUNT` → `SUB_ACCOUNT`.
  - Extend `AuthUser` with `permissions: ModulePermissions | null`.
  - Parse `permissions` from `/api/user/me`.
  - Expose helpers `can(module, action)` and `isSubAccount`.
  - `resolveActiveRole`: a `SUB_ACCOUNT` user's active role is always `SUB_ACCOUNT` (no switcher).

### 2. New permission types + guard

- `src/lib/permissions.ts`: type `ModuleKey = "dashboard"|"income"|"expense"|"settings"`, type `ModulePermissions`, default-all-false factory, `can(perms, module, action)`.
- `src/components/PermissionGuard.tsx`: redirects to first allowed module (or `/sme/no-access`) if `read` is false for the route's module.

### 3. Routing (`src/App.tsx`)

Wrap each SME child route with `PermissionGuard module="dashboard|income|expense|settings"`. Sub-account uses the same `/sme/*` routes — no separate URL space.

### 4. Sidebar (`src/components/Sidebar.tsx`)

- Filter `regularNavItems` by `can(module, "read")` for sub-accounts.
- Hide Settings link if `settings.read` is false.
- Hide CA Connect for sub-accounts entirely (owner-only feature).

### 5. Module pages — write gating

In `DashboardHome`, `Income`, `Expenses`, `SMESettings`, `Clients`:

- Hide "Create / Add / Edit / Delete" buttons when `!can(module, "write")`.
- Disable form submit + inputs in dialogs (or don't render the dialog trigger).

### 6. Sub-Accounts management UI (owners only)

- New section in `src/pages/SMESettings.tsx` titled "Team & Permissions", hidden when `isSubAccount`.
- Lists existing sub-accounts (name, email, permissions summary, status) with Edit / Disable / Delete actions.
- "Add Sub-Account" dialog (`src/components/AddSubAccountDialog.tsx`): name, email, password, confirm password, and a 4-row × 2-column permission grid (read/write per module) with the rule "write auto-enables read".
- "Edit Sub-Account" dialog: same grid, no password (separate reset action).
- New API client `src/lib/api/subAccounts.ts` wrapping the endpoints below.

### 7. Top-right role switcher

`DashboardLayout`: don't render the Regular/CA switcher for `SUB_ACCOUNT`.

## Backend APIs (for you to implement)

All require Bearer JWT. Owner-only endpoints must verify caller has `SME_USER` role and is the organization owner.

### User-facing

1. `**GET /api/user/me**` *(existing — extend)*
  Add `role: "SUB_ACCOUNT"` and `permissions: {...} | null` to the response.
2. `**POST /api/auth/login**` *(existing — extend)*
  Returned user payload must include `role` and `permissions`. Sub-accounts log in via the same endpoint.

### Owner-only sub-account management (suggested prefix `/api/sub-accounts`)

3. `**GET /api/sub-accounts**` — list sub-accounts in caller's organization.
  Response: `[{ id, name, email, permissions, isDisabled, createdAt }]`.
4. `**POST /api/sub-accounts**` — create.
  Body: `{ name, email, password, permissions }`.
   Server: creates user with role `SUB_ACCOUNT`, links to caller's organization, stores `permissions` JSONB. Validates email uniqueness, password strength, and that every `write:true` also has `read:true`.
5. `**PATCH /api/sub-accounts/:id/permissions**` — update permissions JSONB.
  Body: `{ permissions }`. Same write⇒read validation.
6. `**PATCH /api/sub-accounts/:id/disable**` — toggle `isDisabled` (locks login).
7. `**POST /api/sub-accounts/:id/reset-password**` — owner sets a new password.
  Body: `{ newPassword }`.
8. `**DELETE /api/sub-accounts/:id**` — remove sub-account.

### Server-side enforcement (important)

Permission JSONB alone in the UI is not enough — the backend must also check `permissions[module].write` on every mutating endpoint a sub-account hits (invoices, expenses, clients, organization update, etc.), and `read` on every list/detail endpoint. Otherwise a sub-account could call the API directly. Return `403` when denied.

### Data model hints

- `users.role` enum: add `SUB_ACCOUNT`.
- `users.permissions JSONB NULL` (only set for `SUB_ACCOUNT`).
- `users.organization_id` (already exists) — sub-account inherits owner's org so they see the same data scope.
- `users.parent_user_id` (optional) — convenient for "list sub-accounts created by this owner".

## Open question

- Should a disabled sub-account's existing JWT be invalidated immediately, or wait for natural expiry? (Affects whether you need a token-revocation list.)