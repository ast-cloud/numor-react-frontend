## Problem

After uploading and parsing an expense, the "Item Price" field shows the pre-tax total. It only becomes the tax-inclusive value after the user edits any field (qty/unit price/tax), because the recalculation formula `qty * unitPrice * (1 + tax/100)` only runs in the on-change handlers.

## Root cause

In `src/pages/Expenses.tsx` (around line 855–862), the OCR prefill maps each parsed item with:

```ts
itemPrice: String(item.total ?? item.totalPrice ?? item.itemPrice ?? "")
```

The backend's `total`/`totalPrice` from OCR is the pre-tax amount, so the initial display doesn't include tax. The same pattern applies in `handleEditReceipt` (line 897–904) when reopening a saved receipt.

## Fix

Compute `itemPrice` from the parsed `quantity`, `unitPrice`, and `taxRate` using the same formula already used in the on-change handlers, instead of trusting the API's `total` field.

### Change 1 — OCR prefill (`handleFileUpload`, ~line 855)

```ts
const prefillBillItems: BillItem[] = items.map((item: any) => {
  const quantity = Number(item.quantity) || 1;
  const unitPrice = Number(item.unitPrice ?? item.unit_price_before_tax ?? 0) || 0;
  const taxRate = Number(item.taxRate ?? item.taxPercent ?? item.tax_percentage ?? 0) || 0;
  const computed = Math.round(quantity * unitPrice * (1 + taxRate / 100) * 100) / 100;
  return {
    name: item.itemName || item.name || "",
    quantity: String(item.quantity || 1),
    unitType: normalizeUnitType(item.unitType),
    unitPrice: String(item.unitPrice ?? item.unit_price_before_tax ?? 0),
    taxRate: String(item.taxRate ?? item.taxPercent ?? item.tax_percentage ?? ""),
    itemPrice: String(computed),
  };
});
```

### Change 2 — Edit receipt prefill (`handleEditReceipt`, ~line 897)

Apply the same computation so the displayed Item Price stays tax-inclusive on reopen, regardless of how `totalPrice` was stored:

```ts
const prefillBillItems: BillItem[] = (receipt.items || []).map((item) => {
  const quantity = Number(item.quantity) || 1;
  const unitPrice = Number(item.unitPrice) || 0;
  const taxRate = Number(item.taxRate) || 0;
  const computed = Math.round(quantity * unitPrice * (1 + taxRate / 100) * 100) / 100;
  return {
    name: item.itemName || "",
    quantity: String(item.quantity ?? "1"),
    unitType: normalizeUnitType(item.unitType),
    unitPrice: String(item.unitPrice ?? ""),
    taxRate: String(item.taxRate ?? ""),
    itemPrice: String(computed),
  };
});
```

## Scope

- File: `src/pages/Expenses.tsx` only.
- Frontend / presentation only — no API or submission logic changes (submission already sends `parseFloat(item.itemPrice)` as `total`, which now correctly includes tax from the start).
