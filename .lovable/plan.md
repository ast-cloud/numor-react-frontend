## Goal
Replace `react-easy-crop` with `react-image-crop` in `src/components/CompanyLogoUpload.tsx` so the user can freely drag/resize the crop box (no fixed aspect ratio) on the company logo.

## Scope
- Only `CompanyLogoUpload.tsx` changes. `ProfilePictureUpload.tsx` keeps `react-easy-crop` (still needs round 1:1 crop).
- No backend or upload-flow changes — `uploadOrganizationLogo` still receives a base64 PNG data URL.

## Changes

1. **Install** `react-image-crop`.

2. **Rewrite the crop dialog body** in `CompanyLogoUpload.tsx`:
   - Remove `Cropper`, aspect presets (`AspectPreset`, `ASPECT_VALUES`), zoom slider, and related state (`crop`, `zoom`, `croppedAreaPixels`, `aspectPreset`).
   - Add state: `crop: Crop | undefined`, `completedCrop: PixelCrop | undefined`, `imgRef: HTMLImageElement | null`.
   - Render `<ReactCrop crop={crop} onChange={setCrop} onComplete={setCompletedCrop}>` wrapping an `<img ref={imgRef} src={rawImage} onLoad={...}>`. No `aspect` prop = free-form drag/resize.
   - On image load, initialize `crop` to a sensible default (e.g. centered 80% rectangle in pixel units).
   - Keep the dashed preview tile, Upload/Change/Remove buttons, file size/type validation, and toasts unchanged.
   - Import `react-image-crop/dist/ReactCrop.css` once (in this file).

3. **Rewrite `getCroppedImg`** to accept the source `HTMLImageElement` + `PixelCrop`:
   - Convert percent crop to pixels using the image's natural vs displayed size (`naturalWidth / width` scale factor).
   - Draw the cropped region to a canvas, preserving aspect, fit longest side within `MAX = 1024` (same cap as before).
   - Return `canvas.toDataURL("image/png", 0.95)` — unchanged output format.

4. **`handleCropConfirm`** uses `imgRef.current` + `completedCrop` instead of `rawImage` + `croppedAreaPixels`. Disable Apply until `completedCrop` has width/height > 0.

5. **Dialog layout**: keep `sm:max-w-sm max-w-[92vw] max-h-[90vh] overflow-y-auto`. The crop area becomes the image itself inside a `bg-muted rounded-lg` container; no fixed 260/300px height — the image scales to fit container width with `max-h-[60vh] object-contain`.

## Technical notes
- `react-image-crop` v11 API: `<ReactCrop crop onChange onComplete aspect? minWidth? minHeight? keepSelection>`. Omit `aspect` for free crop. `PixelCrop` has `{x,y,width,height,unit:'px'}`.
- Scale factor for canvas draw: `scaleX = img.naturalWidth / img.width; scaleY = img.naturalHeight / img.height;` then source rect = `crop.{x,y,width,height} * scale`.
- CSS import (`react-image-crop/dist/ReactCrop.css`) is required for handle styling.

## Out of scope
- Profile picture cropper (`ProfilePictureUpload.tsx`).
- Upload API, validation rules, and surrounding settings UI.
