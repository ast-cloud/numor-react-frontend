## Goal

Let org owners manage invoice custom fields (each: name + list of predefined values) from SME Settings. These values will later power dropdown suggestions in the invoice creation form (out of scope for this task).

## Changes

### 1. New API module — `src/lib/api/invoiceCustomFields.ts`

Functions calling `{backendHost}/api/organizations/custom-fields` with Bearer token:

- `fetchInvoiceCustomFields()` → `GET /` → returns `CustomField[]` (uses `json.data ?? json` fallback per project convention)
- `createInvoiceCustomField({ name, predefinedValues })` → `POST /`
- `updateInvoiceCustomField(id, { name, predefinedValues })` → `PUT /:id`
- `deleteInvoiceCustomField(id)` → `DELETE /:id`

Type:

```ts
interface InvoiceCustomField {
  id: string;
  name: string;
  predefinedValues: string[];
}
```

Only the `POST` endpoint was confirmed by the user. List/update/delete assume standard REST on the same base — if the actual endpoints differ, swap the URLs/methods in this one file.

### 2. New component — `src/components/InvoiceCustomFieldsSection.tsx`

A `Card` matching the existing settings styling (same header/edit-button pattern as Company Details). Contents:

- Loading state with spinner; error toast on fetch failure.
- List of existing fields, each row showing the field name and its values as small badges, with Edit and Delete (with confirm) icon buttons.
- "Add Custom Field" button opens a dialog with:
  - **Name** input
  - **Predefined values** editor: list of value inputs with per-row remove button + "Add value" button (Enter on the last input also adds a row)
  - Save (POST or PUT) / Cancel
- Permissions: read gated by `can("organizationSettings", "read")`; add/edit/delete buttons gated by `can("organizationSettings", "write") || isOrgOwner` — same pattern already used in `SMESettings.tsx`.
- Toasts for success/failure on every mutation. Local state refetch (or in-place update) after each mutation.

### 3. Mount in settings — `src/pages/SMESettings.tsx`

Render `<InvoiceCustomFieldsSection />` immediately after the Company Details card, wrapped in `canReadSettings` like the existing card. Section title: **"Invoices"**, description: **"Manage custom fields used on your invoices"**.

4. Get custom fields endpoint - curl -X GET [http://localhost:3000/api/organizations/custom-fields](http://localhost:3000/api/organizations/custom-fields) 
5. Update custom fields endpoint example - curl -X PUT [http://localhost:3000/api/organizations/custom-fields/123](http://localhost:3000/api/organizations/custom-fields/123) \
   -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Department",
      "predefinedValues": ["Sales", "Engineering", "HR", "Marketing"]
    }'
6. Delete a custom field example - curl -X DELETE [http://localhost:3000/api/organizations/custom-fields/123](http://localhost:3000/api/organizations/custom-fields/123) \
    -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
  &nbsp;
  &nbsp;
  &nbsp;

## Out of scope

- Surfacing these fields inside the invoice creation form / preview / PDF. (Will be a follow-up once this CRUD UI is in place.)