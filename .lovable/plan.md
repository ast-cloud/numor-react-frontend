## Fix Select scroll-chaining when page is body-locked

**Root cause:** Radix Select locks body scroll via `react-remove-scroll` while open. Our wheel handler in `src/components/ui/select.tsx` falls back to `document.scrollingElement.scrollTop += deltaY`, which is a no-op while locked. Result: once the country list reaches its end, nothing scrolls.

## Change

Edit only `src/components/ui/select.tsx` — replace the `handleWheel` effect inside `SelectContent` with logic that:

1. Resolves the trigger via `aria-labelledby` (or `[data-state="open"]` fallback) and walks up to find the nearest ancestor whose computed `overflow-y` is `auto`/`scroll` and which has overflowing content. That ancestor (e.g., a DialogContent or scrollable panel) is unaffected by the body lock and can be scrolled directly.
2. If no scrollable ancestor exists (the dashboard case where the document is the scroller), temporarily set `html`/`body` `style.overflow = 'auto'`, call `window.scrollBy(0, deltaY)`, then restore the previous inline values. This bypasses react-remove-scroll's lock for that single tick without breaking its cleanup.
3. Caches the resolved target per open cycle and only acts when the inner viewport is at the top/bottom edge in the wheel direction (preserves current internal scroll behavior).

No other files change. This fixes the Country dropdown on `/sme/income/clients`, the same Country dropdown inside the nested AddClientDialog, and any other long Select.
