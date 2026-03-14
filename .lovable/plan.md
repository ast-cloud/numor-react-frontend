

## Fix: PDF downloading instead of previewing

### Problem
The Supabase signed URLs contain a `&download=` query parameter (visible in the example URLs from the API response). This header instructs the browser to download the file rather than render it inline, so the iframe triggers a download instead of displaying the PDF.

### Solution
Strip the `download` query parameter from the URL before passing it to the `<iframe>` (and `<img>`). Create a small helper that removes `download` from the URL's search params, then use the cleaned URL in both the `<img>` and `<iframe>` `src` attributes.

### Changes

**`src/pages/CASettings.tsx`** (lines ~1099-1111):
- Add a helper inside the preview rendering block:
  ```ts
  const previewUrl = previewDoc?.url?.replace(/[&?]download=?[^&]*/gi, '') || '';
  ```
- Use `previewUrl` instead of `previewDoc.url` in both the `<img src>` and `<iframe src>`.

This is a one-line derived variable plus two `src` attribute changes. No other files affected.

