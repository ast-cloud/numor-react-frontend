

## Plan: Use Display Labels as Stored Values for Specializations

### Problem
The `SPECIALIZATIONS` array in `CASettings.tsx` uses short internal keys (e.g., `"tax"`, `"audit"`) as `value` while showing different labels (e.g., `"Tax Advisory"`, `"Audit & Assurance"`). The API receives the short keys, not the display strings.

### Fix

**`src/pages/CASettings.tsx`** (line 214–221):

Change `value` to match `label` for every specialization:

```ts
const SPECIALIZATIONS = [
  { value: "Tax Advisory", label: "Tax Advisory" },
  { value: "Audit & Assurance", label: "Audit & Assurance" },
  { value: "Corporate Finance", label: "Corporate Finance" },
  { value: "Financial Consulting", label: "Financial Consulting" },
  { value: "Bookkeeping & Accounting", label: "Bookkeeping & Accounting" },
  { value: "Regulatory Compliance", label: "Regulatory Compliance" },
];
```

No other changes needed — the rest of the code already references `spec.value` for storage and comparison, and `spec.label` only for display in badges (which will now match anyway).

### Files modified
- `src/pages/CASettings.tsx`

