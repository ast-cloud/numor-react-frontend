

## Plan: Allow Clearing Fields but Gate "Submit for Review" on Completeness

### Problem
The save handlers for professional details block saving when specialization or languages are empty (validation errors). Users should be able to save partial/empty fields freely. The "Submit for Review" button should be the only gate that requires all fields to be filled (which `isFormComplete()` already handles at line 419).

### Fix

**`src/pages/CASettings.tsx`**:

1. **Remove early-return validation from `handleSaveProfessional`** (lines 360-367): Delete the two `if` blocks that check for empty specialization and languages arrays and show toast errors. This allows saving empty arrays.

2. **No changes needed for address save** — the address handler (line 707) has no such validation, so clearing address fields already works.

3. **No changes needed for `isFormComplete()`** — it already requires all fields (specializations, languages, address, etc.) and gates the "Submit for Review" button.

### Result
- Users can clear any field and save freely
- "Submit for Review" remains disabled until all required fields are filled (existing `isFormComplete()` logic)

### Files modified
- `src/pages/CASettings.tsx`

