Update the receipt detail view so individual item totals are calculated tax-inclusively on first click, instead of trusting the API `totalPrice` field when it may still be pre-tax.

Implementation plan:
1. Add a small local helper in `src/pages/Expenses.tsx` to calculate an expense item’s display total as:
   `quantity * unitPrice * (1 + taxRate / 100)`, rounded to 2 decimals.
2. Use that helper in the selected receipt item table’s `Total` column, so the first receipt click shows the same tax-inclusive value that appears after edit/save.
3. Keep the existing edit form and save payload behavior unchanged, since those already recalculate correctly.
4. Verify the relevant display logic in the file after the change.