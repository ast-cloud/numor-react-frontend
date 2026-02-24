

## Plan: Add Google OAuth to Login Page

### What changes

Add a `handleGoogleLogin` function to `src/pages/Login.tsx` that redirects to Google OAuth **without** any `state` parameter (since this is login, not signup — no need to specify a user type). Wire the "Continue with Google" button to call it.

### Technical details

**File: `src/pages/Login.tsx`**

1. Import `config` from `@/lib/config`
2. Add `handleGoogleLogin` function:
   - Constructs Google OAuth URL with `client_id`, `redirect_uri`, `response_type`, `scope` — same as signup but **no `state` param**
   - Redirects via `window.location.href`
3. Add `onClick={handleGoogleLogin}` to the "Continue with Google" button (line 134)

The backend will receive no `state`, so `user_type_for_signup` will be `undefined`, which is correct for existing user login. The existing `AuthCallback.tsx` will handle the redirect with the token hash fragment as before.

