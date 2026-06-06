## Goal
When a user has `income.write = false` (and is not org owner), they should be unable to add, edit, or delete clients — they can only view them. This mirrors how the dashboard edit controls were gated.

## Changes

### 1. `src/components/ClientsView.tsx`
- Import `useAuth` and compute `canWrite = can("income", "write")`.
- Hide the "Add Client" button when `!canWrite`.
- Pass `canWrite` down to `ClientCard` (as e.g. `readOnly={!canWrite}`) so each card hides its Edit and Delete actions when the user lacks write permission.
- As a safety net, no-op `handleAddClient`, `handleEditClient`, `handleSaveClient`, and `handleDeleteClient` if `!canWrite`.

### 2. `src/components/clients/ClientCard.tsx`
- Accept a new `readOnly?: boolean` prop.
- When `readOnly`, hide the Edit and Delete buttons (and any inline save/cancel for new rows) and render fields as read-only.

### 3. `src/components/CreateInvoiceDialog.tsx`
- Gate the "Add Client" affordance that opens `AddClientDialog` behind `can("income", "write")`. If the user lacks write permission, hide that trigger so the dialog cannot be opened. (The dialog component itself stays unchanged.)

### 4. (Optional consistency) `src/pages/Income.tsx`
- If the Income page exposes a "Manage Clients" / navigation entry that leads to `Clients`, keep it visible (viewing is allowed) but ensure any "create invoice"/edit actions there already follow `can("income", "write")`. No behavioral change required for read-only viewing of clients.

## Notes
- Org owners (`isOrgOwner = true`) keep full access because `can()` already short-circuits to true for owners.
- No backend / API changes; purely UI gating using the existing `useAuth().can` helper and `permissions.ts`.
