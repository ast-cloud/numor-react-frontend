
## Mobile Sidebar: Off-canvas Drawer

**The problem**: On mobile, the sidebar is always visible (either full width 256px or icon-only 64px), eating into precious screen space. It should fully disappear and only show on demand via a hamburger tap.

**The approach**: Add a `mobileOpen` boolean to the sidebar state. On mobile:
- The sidebar slides in as an off-canvas overlay (translated off-screen by default, slides in when open).
- A semi-transparent backdrop appears behind it to dismiss on tap.
- The hamburger button is shown in the top-left corner of the main content area when the sidebar is hidden.
- On desktop, behavior is unchanged (collapsed icon strip vs full sidebar).

**Changes needed**:

1. **`src/hooks/use-sidebar-state.tsx`** — Add `mobileOpen` + `toggleMobile` to context.

2. **`src/components/Sidebar.tsx`** — Wrap the `<aside>` with mobile-aware classes:
   - On mobile (`md:hidden` / `md:block` breakpoints): `translate-x-0` when open, `-translate-x-full` when closed, plus a backdrop overlay div.
   - On desktop: existing collapsed/expanded logic unchanged.
   - Nav links close the mobile drawer on tap (`toggleMobile`).

3. **`src/components/DashboardLayout.tsx`** — Add a floating hamburger button visible only on mobile (`md:hidden`) in the top-left of the main content area that calls `toggleMobile`. Main content on mobile gets no left margin (`ml-0 md:ml-16/64`).

```text
Mobile (closed)              Mobile (open)
┌────────────────────┐       ┌──────┬──────────────┐
│ ☰  [page title]    │       │ Nav  │ [backdrop]   │
│                    │  →    │ Items│              │
│   main content     │       │      │  main content│
│                    │       └──────┴──────────────┘
└────────────────────┘

Desktop (unchanged)
┌────┬───────────────────┐   ┌──────────────┬──────────────┐
│ 🔲 │  main content     │   │  Full Sidebar│ main content │
└────┴───────────────────┘   └──────────────┴──────────────┘
  collapsed                    expanded
```

**Key implementation details**:
- Use `translate-x` + `transition-transform` for the slide-in animation (native app feel).
- Backdrop: `fixed inset-0 bg-black/50 z-30` visible only when `mobileOpen`, closes drawer on click.
- `ml-0` on mobile for main content so it fills the full width.
- The mobile hamburger button sits at `top-4 left-4` in the main content, `z-50`.
- Close sidebar automatically on nav link click on mobile for a native-like UX.
