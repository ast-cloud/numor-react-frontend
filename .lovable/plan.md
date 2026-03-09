

## Forgot Password Flow Integration

A 3-step forgot password flow will be built as a new page (`/forgot-password`) with a multi-step form:

### Steps
1. **Email Entry** — User enters email, POST to `/api/auth/forgetPassword` with `{ email }`
2. **OTP Verification** — User enters 6-digit code, POST to `/api/auth/verifyResetCode` with `{ email, code }`
3. **New Password** — User enters + confirms new password, POST to `/api/auth/resetPassword` with `{ email, code, newPassword }` — then redirect to `/login`

### Files to Create/Modify

1. **`src/pages/ForgotPassword.tsx`** (new) — Multi-step page with 3 states (`email`, `verify`, `reset`). Uses existing UI components (Input, Button, InputOTP). Stores email and code in local state across steps. Validates password match before submission. Styled consistently with Login page.

2. **`src/lib/api/auth.ts`** (modify) — Add 3 new API functions:
   - `forgotPassword(email)` → POST `/api/auth/forgetPassword`
   - `verifyResetCode(email, code)` → POST `/api/auth/verifyResetCode`
   - `resetPassword(email, code, newPassword)` → POST `/api/auth/resetPassword`

3. **`src/App.tsx`** (modify) — Add route `/forgot-password` → `ForgotPassword` component

4. **`src/pages/Login.tsx`** (modify) — Change the "Forgot password?" link from `href="#"` to `Link to="/forgot-password"`

### UI Details
- Each step shows a back arrow to return to login
- OTP input uses the existing `InputOTP` component (6 slots)
- Password step validates both fields match before enabling submit
- Toast notifications for errors and success
- Redirect to `/login` on successful reset

