Plan: Remove the "Custom Fields" heading from the invoice

Context
- The invoice template already renders selected custom fields in a two-column grid between the seller/buyer block and the line-items table.
- The user wants to keep this position, but remove the literal "Custom Fields" section heading.

Changes
1. Update src/templates/invoice.html
   - Remove the <h4>Custom Fields</h4> element inside the .custom-fields block.
   - Keep the .custom-fields container and .custom-field-grid so the field list remains in the same position with the same layout.
   - Optionally tighten the top margin of .custom-fields slightly since the heading is gone (e.g., from margin-top 16px to 8px) so the spacing still looks balanced.

2. Verify
   - Confirm that the custom fields still render when present and that the PDF/preview layout is unaffected except for the missing heading.

No other files need to change. The custom field selector UI in CreateInvoiceDialog.tsx remains unchanged.