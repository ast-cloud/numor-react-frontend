

## Plan: Add Empty Field Validation to CA Settings Save Actions

### Problem
Users can save fields with empty values in the profile, address, and professional sections without any error.

### Fix

**`src/pages/CASettings.tsx`** — Add validation checks at the start of each save handler:

1. **`handleSaveProfile` (~line 332)**: Check `profileData.name` and `profileData.phone` are non-empty before saving.

2. **`handleSaveProfessional` (~line 359)**: Check `membershipNumber`, `experience`, `bio`, and `hourlyFee` are non-empty (specialization/languages already validated).

3. **Address save handler (~line 707)**: Check `streetAddress`, `city`, `state`, `zipCode`, and `country` are non-empty.

Each check shows a destructive toast like: `"Please fill in all required fields before saving."` and returns early.

### Files modified
- `src/pages/CASettings.tsx`

