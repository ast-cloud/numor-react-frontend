## Plan

Reduce the visual size of the Edit and Delete buttons in the expense receipt detail header (`src/pages/Expenses.tsx`, lines ~1745-1760).

### Changes
- Replace text+icon buttons with compact icon-only buttons:
  - `size="icon"` → use a smaller `h-8 w-8` class override
  - Keep `variant="outline"`, keep destructive color for delete
  - Add `title` attribute ("Edit" / "Delete") for accessibility/tooltip
  - Use `w-3.5 h-3.5` icons instead of `w-4 h-4`

Result: two small square icon buttons next to "Back to Receipts", clearly smaller than the current pill-shaped labeled buttons.