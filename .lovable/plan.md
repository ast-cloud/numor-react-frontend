

## Reorder Auth Pages: Form First on Mobile

On small screens (vertical layout), the social login buttons currently appear first and the form appears below. The user wants this reversed: form on top, social buttons below.

### Approach

Use Tailwind's `order` utilities to swap the visual order on mobile while keeping desktop layout unchanged (social left, form right).

### Files to Change

1. **`src/pages/Login.tsx`** — Add `order-2 md:order-none` to the left (social) section, `order-1 md:order-none` to the right (form) section.

2. **`src/pages/Signup.tsx`** — Same reordering.

3. **`src/pages/CASignup.tsx`** — Same reordering.

4. **`src/pages/ForgotPassword.tsx`** — Same reordering (if it has social buttons; otherwise just ensure form is first).

### How It Works

- `order-1` makes the form appear first on mobile
- `order-2` pushes social buttons below on mobile  
- `md:order-none` restores natural DOM order on desktop (social left, form right)
- The mobile divider ("Or") gets `order-2` to sit between form and social buttons

