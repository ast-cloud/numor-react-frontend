

## Problem Analysis

After a Google OAuth callback, the backend needs to both redirect the user to the frontend AND pass a JWT token so it can be stored in `localStorage`. Since `localStorage` can only be set by client-side JavaScript, the backend cannot set it directly.

## Recommended Solution: Token in Redirect URL + Frontend Handler Page

The standard approach is:

1. **Backend**: Redirect with the token as a URL query parameter or hash fragment
2. **Frontend**: Create a small handler page that extracts the token, saves it to `localStorage`, then redirects to the appropriate dashboard

### Backend Change (your Express code)

Complete the `googleLocalStorageBasedLogin` function to redirect with the token and role in the URL:

```javascript
async function googleLocalStorageBasedLogin(req, res, next) {
  // ... existing state/code parsing ...

  const { token, user } = await authService.googleAuth(code, user_type_for_signup);

  const frontendUrl = process.env.FRONTEND_URL; // e.g. https://numor.lovable.app
  const redirectPath = user_type_for_signup === "CA_USER" ? "/ca/dashboard" : "/sme/dashboard";

  // Pass token in hash fragment (not query param) so it's not logged by servers
  res.redirect(`${frontendUrl}/auth/callback#token=${token}&redirect=${redirectPath}`);
}
```

Using the hash fragment (`#`) is preferred over query parameters (`?`) because hash fragments are never sent to servers in HTTP requests, making them slightly more secure for token transport.

### Frontend Change

Create a new `/auth/callback` route and page that:
1. Reads the token from the URL hash fragment
2. Stores it in `localStorage` using the existing `setToken()` utility
3. Fetches the user profile (via `refreshUser` from `useAuth`)
4. Redirects to the appropriate dashboard

### Files to Create/Modify

1. **Create `src/pages/AuthCallback.tsx`** - A small page that extracts the token from the hash, calls `setToken()`, triggers `refreshUser()`, then navigates to the redirect path
2. **Modify `src/App.tsx`** - Add the `/auth/callback` route

### Security Note

The token is briefly visible in the URL hash but is never sent to any server. The handler page should clear the hash immediately after extracting the token (via `window.history.replaceState`). This is the same pattern used by many OAuth implementations including Firebase Auth.

