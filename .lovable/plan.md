## Problem

When a Select dropdown is open and the user scrolls with the cursor outside the dropdown's bounds, nothing happens. Radix uses `react-remove-scroll` which body-locks the page, so wheel events on the rest of the document do nothing.

Our existing wheel handler in `src/components/ui/select.tsx` only fires for wheel events on the dropdown content itself (it's attached to `el`). Events outside the dropdown never reach it.

## Fix

In `src/components/ui/select.tsx`, inside the existing `useEffect` that wires `handleWheel`, add a second listener attached to `window` (capture phase, non-passive) that handles wheel events whose target is NOT inside the dropdown content `el`.

That outside-handler will:

1. Skip if the event target is inside `el` (the existing per-content handler covers that case, including its at-edge gating).
2. Resolve the same scrollable ancestor via the existing `resolveScrollTarget()` helper. If found, `preventDefault()` and apply `target.scrollTop += e.deltaY` so the surrounding scrollable panel (e.g. DialogContent) scrolls.
3. Otherwise, document is the scroller — reuse the existing body-lock bypass block (temporarily clear `data-scroll-locked` and `html`/`body` `overflow` to `auto !important`, scroll `document.scrollingElement`, then restore).
4. Refactor the body-lock bypass into a small local `bypassBodyLockScroll(deltaY)` helper so both the inside- and outside-handlers share it.

Cleanup removes both listeners. No behavioral change to the existing inside-dropdown wheel handling, the locked-side logic, or any other component.

This makes wheel-over-page scroll the page (or the nearest scrollable ancestor) while the dropdown stays open and pinned to its initial side.

## Technical details

File: `src/components/ui/select.tsx` only.

```text
useEffect(contentElement):
  el = contentElement
  resolveScrollTarget()  // existing
  bypassBodyLockScroll(deltaY)  // extracted from current fallback branch

  handleWheelInside(e)   // current handler, unchanged behavior
  handleWheelOutside(e):
    if el.contains(e.target) return
    target = resolveScrollTarget()
    if target: e.preventDefault(); target.scrollTop += e.deltaY
    else: e.preventDefault(); bypassBodyLockScroll(e.deltaY)

  el.addEventListener('wheel', handleWheelInside, {capture:true, passive:false})
  window.addEventListener('wheel', handleWheelOutside, {capture:true, passive:false})
  cleanup: remove both
```

No other files change.
