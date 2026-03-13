

## Bug Found: Document Type String Mismatch

The ID Proof upload silently falls through to the non-API `else` branch because of a string comparison mismatch.

**Root cause:** In `handleConfirmUpload` (line 203), the condition checks `pendingDocumentType === "ID Proof"`, but the actual value passed from the component is `"id_proof"` (line 1001). Since `"id_proof" !== "ID Proof"`, the API call to `uploadCADocument` is never executed — instead it just adds the document to local state.

**Fix:** Change line 203 to compare against the correct value:

```ts
if (pendingDocumentType === "id_proof") {
```

This single-line fix will ensure ID Proof documents are actually sent to the backend via POST `/api/ca-profile/documents`.

