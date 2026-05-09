## Issue
The floating chatbot launcher in `src/components/ChatBot.tsx` (line ~197) uses `bg-secondary` with `text-foreground` and renders `<BotMascot size={20} />` with `currentColor`. On the dark app background, `bg-secondary` (HSL 220 16% 14%) sits very close to the page background (HSL 220 20% 4%) and the card surfaces, so the button visually disappears.

## Fix
Restyle the launcher to use the brand primary color so it stands out in both themes. No behavior changes.

### Change in `src/components/ChatBot.tsx` (button at line ~194-203)
- Replace `bg-secondary text-foreground ... hover:bg-secondary/80` with:
  - `bg-primary text-primary-foreground`
  - `hover:bg-primary/90`
  - Add `ring-2 ring-primary/30` (or `shadow-glow`) so it pops against dark cards.
- Bump size slightly: `w-14 h-14` and `<BotMascot size={26} />` for better visibility/tap target.
- Keep `fixed bottom-6 right-6 z-50 rounded-full shadow-lg transition-all hover:scale-105 hover:shadow-xl`.

### Out of scope
- No changes to the chat panel, mascot SVG, or open/close logic.
- No design-token changes in `index.css` / `tailwind.config.ts`.