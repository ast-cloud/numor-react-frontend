

## Move Heading Above Form on Mobile

Currently the heading ("Welcome back", "Create your account", etc.) lives inside the social login section, which has `order-2` on mobile. This means it appears below the form. The fix is to extract the heading into its own element that appears first on all screen sizes.

### Files to Change

1. **`src/pages/Login.tsx`** — Extract the heading `div` (h1 + subtitle) out of the social login section into its own `div` with no order class (renders first naturally). On desktop, hide this extracted heading and keep a duplicate inside the social section visible only on `md:` screens.

2. **`src/pages/Signup.tsx`** — Same pattern.

3. **`src/pages/CASignup.tsx`** — Same pattern.

### Implementation Detail

For each page:
- Add a new heading block **before** both sections, visible only on mobile: `<div className="md:hidden w-full mb-6">...</div>`
- In the existing social login section, add `hidden md:block` to the heading div so it only shows on desktop
- This way: mobile sees Heading -> Form (order-1) -> Divider (order-2) -> Social (order-2), desktop is unchanged

