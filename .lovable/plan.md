

## Fix: Document fileKey Missing After Upload

### Problem
When a document is uploaded, a `newDocument` object is created from the upload API response and added to local state. If the upload API response doesn't include `fileKey` (or uses a different field name), `doc.fileKey` is `undefined`. The delete button's onClick uses `doc.fileKey || doc.id`, so it falls back to the document `id` instead of the actual file key.

After a page refresh, `fetchCADocuments()` loads documents with correct `fileKey` values from the backend, which is why deletion works after refresh.

### Root Cause
The `loadDocuments` function (which fetches documents with proper `fileKey`) only runs on initial mount inside `useEffect`. After upload, `loadCAProfile()` is called but documents are not re-fetched.

### Fix
**`src/pages/CASettings.tsx`** -- After a successful upload (line 296), also re-fetch the documents list so the state has correct `fileKey` values from the backend. Extract the `loadDocuments` logic into a reusable function and call it after upload (and after delete).

Specifically:
1. Move the `loadDocuments` function out of the `useEffect` and wrap it in `useCallback`
2. Call `loadDocuments()` after upload success (line 296) and after delete success (line 320)
3. Remove the manual local state update on upload (`pendingSetDocuments`) since `loadDocuments` will refresh the full list

This ensures the documents always have the correct `fileKey` from the backend response, regardless of what the upload API returns.

### Files modified
- `src/pages/CASettings.tsx`

