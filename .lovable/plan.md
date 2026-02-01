
# Auto-set Currency and Tax Type Based on Seller's Country

## Overview
When a seller selects their country in the invoice creation form, the system will automatically set the appropriate default currency and tax type based on the country's standard practices.

## Country-to-Currency/Tax Mapping

| Country | Currency | Tax Type |
|---------|----------|----------|
| India | INR | GST |
| UAE | AED | VAT |
| US | USD | Sales Tax |
| UK | GBP | VAT |
| EU Countries (27) | EUR | VAT |

## Implementation Steps

### 1. Create a Country-to-Defaults Mapping
Add a lookup object that maps each country to its default currency and tax type:

```text
const countryDefaults: Record<string, { currency: string; taxType: string }> = {
  "India": { currency: "INR", taxType: "GST" },
  "UAE": { currency: "AED", taxType: "VAT" },
  "US": { currency: "USD", taxType: "Sales Tax" },
  "UK": { currency: "GBP", taxType: "VAT" },
  // All 27 EU countries mapped to EUR and VAT
  "Austria": { currency: "EUR", taxType: "VAT" },
  "Belgium": { currency: "EUR", taxType: "VAT" },
  // ... (all other EU countries)
};
```

### 2. Update the Seller Country Change Handler
Modify the `handleSellerChange` function to detect when the country field changes and automatically update the currency and tax type:

```text
const handleSellerChange = (field: keyof SellerInfo, value: string) => {
  setFormData((prev) => {
    const updatedSeller = { ...prev.seller, [field]: value };
    
    // If country changed, update currency and tax type
    if (field === "country" && countryDefaults[value]) {
      return {
        ...prev,
        seller: updatedSeller,
        currency: countryDefaults[value].currency,
        taxType: countryDefaults[value].taxType,
      };
    }
    
    return { ...prev, seller: updatedSeller };
  });
};
```

### 3. Update Initial Form Data
Set the initial currency and tax type based on the default seller's country (UAE):

```text
const initialFormData: InvoiceFormData = {
  // ...
  currency: "AED",  // Changed from USD to match UAE default
  taxType: "VAT",   // Already VAT for UAE
  // ...
};
```

## File Changes

| File | Change |
|------|--------|
| `src/components/CreateInvoiceDialog.tsx` | Add country-to-defaults mapping, update `handleSellerChange` to auto-set currency/tax type, update initial form data |

## User Experience
- User selects a country from the seller's address dropdown
- Currency and Tax Type fields automatically update to match the country's defaults
- User can still manually override the auto-selected values if needed
- Provides a smoother invoice creation experience with sensible defaults
