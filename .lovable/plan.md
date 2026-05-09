## Goal
Make the sidebar hover expand/collapse feel smooth by keeping the icon column visually fixed. Only the text labels on the right should fade/slide in and out — icons must not move horizontally during the transition.

## Root cause
In `src/components/Sidebar.tsx`, every row swaps between two completely different class sets when `effectiveCollapsed` flips:

- Nav links: `justify-center w-10 h-10` ↔ `gap-3 px-3 py-2.5 w-full`
- Header: `justify-start` ↔ `justify-between`
- Settings/Logout: same icon-button vs full-width swap
- Bottom container: `flex flex-col items-center` ↔ default

Because Tailwind class swaps aren't tweenable, the icon's left offset jumps between `(64 - 40)/2 = 12px` (centered in w-16) and `12px` of `px-3` — close, but the row width animates from `w-16` to `w-64` while paddings/justifications change at the same time, causing the icon to drift and the text to "pop" rather than reveal.

## Fix approach
Use one consistent layout in both states and only animate what should change (width of the aside + opacity/translate of the label text). The icon column stays a fixed 64px-wide left rail with the icon at the same x in both states.

### Changes to `src/components/Sidebar.tsx`

1. Aside: keep `w-16` ↔ `w-64` width transition (already there). Add `overflow-hidden` so labels clip cleanly.
2. Rows (nav links, settings link, logout button): always render with the same structure — no conditional class swap.
   - Container: `flex items-center w-full h-10 px-3 gap-3` (always). Remove the `justify-center w-10 h-10` branch.
   - Icon: `w-5 h-5 flex-shrink-0` (unchanged). Its x position is now the same in both states because `px-3` + `w-16` aside = icon centered at 12px from the left, matching the expanded state exactly.
   - Label: render the text inside a `<span>` that's always in the DOM with classes like `whitespace-nowrap transition-opacity duration-200 ${effectiveCollapsed ? "opacity-0" : "opacity-100"}`. This avoids layout shift; the text simply fades.
3. Header row: keep the same height and left padding in both states. Render the "Numor" logo as an always-present span with the same opacity-fade pattern. Toggle/X button stays right-aligned (`ml-auto`) so it doesn't move.
4. Profile section: same idea — avatar always at the same x; the name/email block fades via opacity (and can use `pointer-events-none` while collapsed).
5. Bottom section: drop the `flex flex-col items-center` branch. Always full-width rows; the icons sit in the same column as nav icons.
6. Tooltip `title` attribute: keep only when `effectiveCollapsed` so hover labels still work.

### Why this is smooth
- Only two things animate now: the aside `width` (transform-friendly CSS width transition you already have) and label `opacity`. Icons don't move at all because their left offset is `12px` in both states.
- No class-swap layout jumps mid-animation.

## Out of scope
- No changes to `use-sidebar-state` hook, mobile sheet behavior, or routing logic.
- No visual redesign — colors, spacing, and active states stay identical.