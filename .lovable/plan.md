## Goal
Prevent the layout shift that pushes the "Create Invoice" button (and the scroll position) when validation errors appear after clicking the button.

## Approach
In `src/components/CreateInvoiceDialog.tsx`, restructure the Actions footer (lines ~1735–1766) so the button row stays anchored, and scroll the dialog to the bottom on a failed submit so the errors are visible.

### Changes

1. **Move the error message block below the button row** (instead of above it).
   - The Cancel / Save as Draft / Create Invoice row renders first.
   - The red error text renders underneath it.
   - Result: showing/hiding errors never changes the vertical position of the buttons.

2. **Auto-scroll the dialog content to the bottom on failed submit.**
   - Add a `ref` on the existing scrollable form container (the inner scroll wrapper inside `DialogContent`).
   - In `handlePreview`, when validation fails (the same branch that bumps `jiggleKey`), call `requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; })` so the newly rendered errors + button are scrolled fully into view.

3. No changes to validation logic, jiggle animation, reset behavior, or any other functionality — purely layout + scroll.

### Technical notes
- The scroll ref attaches to whichever element currently owns `overflow-y-auto` for the form body (will confirm exact element on implementation). If it's the `DialogContent` itself, the ref goes there instead.
- Using `requestAnimationFrame` (or a `setTimeout(0)`) ensures the scroll happens after the error block has rendered and expanded the content height.
- No CSS reserved-space hack needed since the errors now sit at the very bottom; their appearance only extends content downward, and we immediately scroll to follow it.
