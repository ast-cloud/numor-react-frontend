## Goal
Disable the "Create Invoice" button in the new invoice creation dialog until a client is selected.

## Change
In `src/components/CreateInvoiceDialog.tsx` (line 1718), update the Create Invoice button:

```tsx
<Button onClick={handlePreview} disabled={!selectedClientId}>Create Invoice</Button>
```

`selectedClientId` is already tracked in state and set by `handleClientSelect` / `handleClientCreated`, so it's the correct signal that a saved client has been chosen (also covers the "add new client" flow, which sets it after creation).

## Notes
- "Save as Draft" button is left unchanged (drafts can be saved without a client).
- No other logic changes.