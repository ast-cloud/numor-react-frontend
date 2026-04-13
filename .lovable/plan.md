
Goal: exclude draft invoices from the Income page summary card analytics, while keeping drafts visible and editable in the invoice list and Draft tab.

What I found
- The SME dashboard was fixed in `src/components/dashboard/widgets/widgetDataProcessors.ts`, but the Income page has separate summary logic in `src/pages/Income.tsx`.
- In `Income.tsx`, `summaryStats` is currently computed from `filterInvoices(activeTab)`.
- `filterInvoices("all")` includes drafts, so the summary card on the Invoices page still counts draft amounts and draft invoice count.
- The summary card is shared across the tabs, so it needs an analytics-only dataset, not the raw tab dataset.

Planned change
1. Add an analytics-specific filtered invoice list in `src/pages/Income.tsx`
   - Reuse the existing filtered list logic for date range/sorting.
   - Exclude `status === "draft"` from analytics calculations.
   - Keep the tab list data unchanged so drafts still appear in the Draft tab and All tab list.

2. Update `summaryStats`
   - Base `totalIncome`, `totalPaid`, `totalUnpaid`, `invoiceCount`, and `topClient` on the non-draft analytics list.
   - Preserve current behavior for paid/unpaid/overdue status handling.

3. Keep UI wording consistent
   - The summary card will still show the same labels, but values will now reflect only non-draft invoices.
   - No visual layout changes needed.

4. Verify edge cases during implementation
   - If all invoices in range are drafts, summary should show zero values and no top client.
   - Draft tab should still list drafts normally.
   - Changing an invoice from draft to unpaid/paid/overdue should make it start contributing to summary stats after refresh/state update.

Technical details
- File to update: `src/pages/Income.tsx`
- Likely approach:
  - Keep `filterInvoices(tab)` for table rendering.
  - Add something like `analyticsInvoices = filterInvoices("all").filter((inv) => inv.status !== "draft")`
  - Optionally, if you want the summary to reflect the selected non-draft tab, handle:
    - `activeTab === "draft"` → analytics values remain zero
    - `activeTab === "all"` → all non-draft invoices
    - other tabs → filtered selected tab (already non-draft except defensive filtering)
- Based on your latest message (“still showing in the summary card on invoices tab”), the safest interpretation is:
  - On the main Invoices/All tab summary, exclude drafts from all analytics.

Expected result
- Draft invoices remain visible in the invoice table.
- Draft invoices no longer affect Total Income, Paid, Outstanding, Invoice Count, or Top Client in the Income page summary card.
