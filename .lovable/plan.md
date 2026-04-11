

## Problem
The Smart Invoicing animation is clipped on the right side. The SVG `viewBox` is `30 -5 280 140`, which means it shows x=30 to x=310. But the destination logos (Email, WhatsApp, Print) are positioned around x=318-325, so they get cut off.

## Fix
Widen the `viewBox` in `AccountingIcon.tsx` to include the full extent of all elements. Change from `30 -5 280 140` to approximately `5 -10 360 180` — this will show everything from the phone on the left to the Print label on the right (which goes up to ~y=160), while keeping all elements visible and proportionally sized.

The exact viewBox values will be tuned based on the rightmost/bottommost elements to ensure nothing is clipped while keeping the animation looking large and filling the card well.

### File changed
- `src/components/vectors/AccountingIcon.tsx` — adjust the `viewBox` attribute

