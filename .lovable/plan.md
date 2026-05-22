# Support rectangular organization logos

Today `CompanyLogoUpload` forces a 1:1 crop and outputs a 512×512 PNG. The display box in settings is also a fixed square. To safely allow rectangular logos (wide or tall) without breaking any layout, the changes are scoped to the upload flow, the canvas export, and any place the logo is rendered.

## Changes

### 1. Cropper — allow non-square crops
File: `src/components/CompanyLogoUpload.tsx`
- Remove the hardcoded `aspect={1}` on `<Cropper>`. Either:
  - **Option A (recommended):** Offer 3 preset aspect choices in the crop dialog — `Square (1:1)`, `Wide (16:9 or 3:1)`, `Tall (3:4)` — via a small toggle group. Defaults to the image's natural aspect.
  - Option B: free-form crop (no aspect lock). Simpler but users can produce awkward shapes.
- Keep `cropShape="rect"` and grid on.

### 2. Canvas export — preserve aspect ratio
File: `src/components/CompanyLogoUpload.tsx` (`getCroppedImg`)
- Replace the fixed 512×512 output with a "fit inside a max box" approach:
  - Max bounding box e.g. 1024×1024.
  - Scale `pixelCrop.width × pixelCrop.height` down proportionally so the longest side ≤ 1024.
  - Set canvas to the scaled width/height (not forced square).
- Output PNG to keep transparency.

### 3. Display containers — use `object-contain` in a flexible box
Anywhere the logo renders, the container must accept any aspect ratio without distorting or clipping.

- `src/components/CompanyLogoUpload.tsx` preview tile (currently `w-24 h-24` with `object-contain` — already safe, keep as is; the logo will letterbox inside the square tile, which is correct).
- `src/pages/SMESettings.tsx` — no direct `<img>`, uses the component, so nothing to change.
- `src/templates/invoice.html` — currently renders the text `NUMOR` in `.logo`. When/if the org logo is wired into invoices, render as `<img class="logo" src="{{logo}}" />` with CSS `max-height: 60px; max-width: 200px; width: auto; height: auto; object-fit: contain;` so wide and tall logos both fit the header without breaking layout. (Out of scope unless you want it wired now — flag only.)

### 4. Upload guardrails
File: `src/components/CompanyLogoUpload.tsx`
- Keep the 2MB / image-type validation.
- Add minimum dimension check (e.g. reject < 100px on shortest side) to avoid blurry uploads.
- Optional: cap maximum aspect ratio at ~8:1 to prevent absurd banners that would still break layouts.

## Why this is safe
- The settings preview tile keeps its square footprint; rectangular logos letterbox inside via `object-contain` (no distortion, no overflow).
- The exported file preserves aspect ratio, so downstream consumers (invoice PDF, header, etc.) receive a clean rectangular PNG instead of a stretched square.
- All current call sites of the logo URL continue to work — only the image's intrinsic dimensions change.

## Out of scope (flag for follow-up)
- Wiring `organizationLogo` into the invoice HTML template / PDF renderer (currently hardcoded text).
- Backend storage — no changes needed; it already accepts arbitrary PNGs.
