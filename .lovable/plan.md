

## Plan: Only Send Modified Fields in CA Profile PUT Requests

### Problem
Both the address and professional save handlers currently send all fields that have a value, even if they haven't changed. This should only send fields that differ from their original values.

### Changes

**`src/pages/CASettings.tsx`** — two save handlers need updating:

1. **Address save (inline handler, ~line 686-691)**: Compare each field in `addressData` against `originalAddressData`. Only include fields where the value differs.

2. **`handleSaveProfessional` (~line 355-366)**: Compare each field in `professionalData` against `originalProfessionalData`. Only include fields where the value differs. For arrays (`specializations`, `languages`), compare by sorting and joining.

Both handlers should skip the API call entirely if no fields changed, showing a toast like "No changes to save".

### Technical detail

```text
// Address save — replace lines 686-691
const payload: Record<string, unknown> = {};
if (addressData.streetAddress !== originalAddressData.streetAddress) payload.streetAddress = addressData.streetAddress;
if (addressData.city !== originalAddressData.city) payload.city = addressData.city;
if (addressData.state !== originalAddressData.state) payload.state = addressData.state;
if (addressData.zipCode !== originalAddressData.zipCode) payload.zipCode = addressData.zipCode;
if (addressData.country !== originalAddressData.country) payload.country = addressData.country;

if (Object.keys(payload).length === 0) {
  // no changes — skip API call, just exit edit mode
  setIsEditingAddress(false);
  return;
}

// Professional save — replace lines 358-364
const payload: Record<string, unknown> = {};
if (professionalData.membershipNumber !== originalProfessionalData.membershipNumber)
  payload.registrationNo = professionalData.membershipNumber;
if (professionalData.experience !== originalProfessionalData.experience)
  payload.experienceYears = parseInt(professionalData.experience, 10);
if (JSON.stringify([...professionalData.specialization].sort()) !== JSON.stringify([...originalProfessionalData.specialization].sort()))
  payload.specializations = professionalData.specialization;
if (professionalData.bio !== originalProfessionalData.bio)
  payload.bio = professionalData.bio;
if (professionalData.hourlyFee !== originalProfessionalData.hourlyFee)
  payload.hourlyFee = Number(professionalData.hourlyFee);
if (JSON.stringify([...professionalData.languages].sort()) !== JSON.stringify([...originalProfessionalData.languages].sort()))
  payload.languages = professionalData.languages;

if (Object.keys(payload).length === 0) {
  setIsEditingProfessional(false);
  return;
}
```

### Files modified
- `src/pages/CASettings.tsx`

