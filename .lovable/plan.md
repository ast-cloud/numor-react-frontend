

## Problem

In `handleInvoiceClick` (lines 254-298), the code expects nested `detail.seller` and `detail.client` objects, but the API returns **flat fields** like `sellerName`, `sellerStreetAddress`, `sellerCity`, etc. There are **no client fields** in the detail response at all — only `clientId`.

### Current code vs API reality

| Code expects | API actually returns |
|---|---|
| `detail.seller.name` | `detail.sellerName` |
| `detail.seller.streetAddress` | `detail.sellerStreetAddress` |
| `detail.seller.city` | `detail.sellerCity` |
| `detail.seller.state` | `detail.sellerState` |
| `detail.seller.zipCode` | `detail.sellerZipCode` |
| `detail.seller.country` | `detail.sellerCountry` |
| `detail.seller.taxId` | `detail.sellerTaxId` |
| `detail.seller.email` | `detail.sellerEmail` |
| `detail.seller.phone` | `detail.sellerPhone` |
| `detail.client.name` | ❌ Not in response |
| `detail.client.email` | ❌ Not in response |
| `detail.client.phone` | ❌ Not in response |
| `detail.client.streetAddress` | ❌ Not in response |
| `detail.client.city` | ❌ Not in response |
| `detail.client.state` | ❌ Not in response |
| `detail.client.zipCode` | ❌ Not in response |
| `detail.client.country` | ❌ Not in response |
| `detail.items[].unitType` | `detail.items[].unitType` (exists but not mapped) |

### Fix plan

1. **Update `InvoiceData` type** in `src/lib/api/invoices.ts` — add flat seller fields (`sellerStreetAddress`, `sellerCity`, `sellerState`, `sellerZipCode`, `sellerCountry`, `sellerPhone`, `sellerTaxId`) and `taxSummary`.

2. **Update `handleInvoiceClick` in `src/pages/Income.tsx`** (lines 261-280):
   - Map seller fields from flat API fields directly (with nested `detail.seller` as fallback for safety):
     - `detail.sellerStreetAddress || detail.seller?.streetAddress`
     - `detail.sellerCity || detail.seller?.city`
     - etc.
   - For client fields, use the already-fetched `clientsMap` or fetch the client by `detail.clientId` from the clients list. The clients are already loaded in `rawInvoices`/`fetchClients`. We'll look up the client from the clients data that's already fetched at page load.
   - Map `unitType` to the line item `unit` field.

3. **Store clients data** in component state so it's accessible in `handleInvoiceClick` for looking up client details by `clientId`.

