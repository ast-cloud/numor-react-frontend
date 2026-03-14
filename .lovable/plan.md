

## Fix: PDF iframe not scaling on narrow viewports

The `<iframe>` has `w-full` but the parent `DialogContent` has `max-w-3xl` which doesn't constrain width on narrow screens. The iframe itself renders PDF at a fixed internal width, causing a horizontal scrollbar.

### Change

**`src/pages/CASettings.tsx`** (~line 1094):
- Add `w-[90vw]` to `DialogContent` so it shrinks on small screens, and ensure the iframe container doesn't overflow.
- Change the preview wrapper div from `overflow-auto` to `overflow-hidden` for PDFs, or simpler: just make the `DialogContent` responsive with `w-full max-w-3xl` (it already has `max-w-3xl`, but the default dialog may not constrain width properly on mobile).

The real fix: On the `DialogContent`, add `w-full` explicitly and on the iframe container div, change `overflow-auto` to `overflow-hidden`. This will make the PDF scale within the available width rather than showing a scrollbar.

**Line ~1094**: Change `className="max-w-3xl max-h-[85vh]"` to `className="max-w-3xl w-full max-h-[85vh]"`

**Line ~1099**: Change `overflow-auto` to `overflow-hidden` on the container div.

