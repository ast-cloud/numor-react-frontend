Change the invoice creation payload so that `customFields` only contains `name` and `value`, matching the requested shape:

```json
"customFields": [
  { "name": "PO Number", "value": "PO-9876" },
  { "name": "Project Code", "value": "PROJ-42" }
]
```

### What will change
- In `src/components/CreateInvoiceDialog.tsx`, update the `buildPayload` function's `customFields` mapping to drop `definitionId` from the outgoing JSON.
- Internal state will still keep `definitionId` so that checkbox selection and value updates continue to work correctly.

### Out of scope
- No changes to the custom field UI, definitions API, or the preview template, which already receives only `name` and `value`.