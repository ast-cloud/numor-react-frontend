## Goal
When confirming a draft invoice from the preview step, call the create endpoint (with the existing id in the payload) instead of the update endpoint, and update the button label.

## Changes — `src/components/CreateInvoiceDialog.tsx`

### 1. `handleConfirmInvoice` (around lines 621–647)
Replace the edit-mode branch so it always calls `createInvoice`, including the existing invoice id in the payload when in edit mode (draft confirmation):

```ts
const payload = buildPayload(undefined);
const finalPayload = isEditMode && editInvoiceId
  ? { ...payload, id: editInvoiceId }
  : payload;
const data = await createInvoice(finalPayload);
await pollPdfStatus(data.id);
```

Remove the `updateInvoice` call from this function. Keep `updateInvoice` import (still used by `handleSaveAsDraft`).

### 2. Button label (line 717–727)
Change the confirm button text so both edit-mode (draft) and create-mode show "Confirm & Create Invoice":

```tsx
{confirmingInvoice ? (
  <>... Generating PDF...</>
) : (
  "Confirm & Create Invoice"
)}
```

### 3. Toast (line 633)
Change to always say "Invoice created" regardless of `isEditMode`.

## Notes
- `handleSaveAsDraft` (Save as Draft button) is unchanged — it still uses `updateInvoice` for existing drafts.
- Backend will detect the `id` in the create payload and treat it as PDF generation for an already-existing draft.
