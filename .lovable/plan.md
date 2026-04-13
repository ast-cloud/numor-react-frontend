

## Problem
When a new invoice is created on the Income page, the dashboard doesn't reflect the change because:
- The Income page fetches invoices via direct `fetch` calls and stores them in local state
- The Dashboard reads invoices from React Query's `["invoices"]` cache
- Creating an invoice only refreshes the Income page's local state — it never invalidates the React Query cache

## Solution
After invoice creation (and deletion/updates), invalidate the React Query `["invoices"]` cache so the dashboard picks up changes automatically.

### Changes

**`src/pages/Income.tsx`**
- Import `useQueryClient` from `@tanstack/react-query`
- In the `loadInvoices` callback (called after create/edit/delete), add `queryClient.invalidateQueries({ queryKey: ["invoices"] })` to ensure the React Query cache is refreshed
- Also invalidate on invoice deletion (the `handleDeleteInvoice` function)

This is a minimal, targeted fix — the Income page keeps its own local state for immediate UI updates, but now also tells React Query to refetch so the dashboard stays in sync.

