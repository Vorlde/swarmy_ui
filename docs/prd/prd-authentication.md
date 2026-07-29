# PRD: Authentication

Feature area: login, session management, auth guard.

## User stories

- As an admin, I can log in with my username and password so I can access the
  platform.
- As an admin, I stay logged in across page reloads so I don't have to
  re-authenticate constantly.
- As an admin, I am redirected to the login page when my session is invalid
  or expired, from anywhere in the app.
- As an admin, I can log out, which clears my session and returns me to the
  login page.
- As a visitor without a session, I can only see the login page; every other
  route redirects me to login.

## Functional requirements

1. LoginView presents a username/password form with client-side validation
   and inline error display for failed logins.
2. On successful login, store the Bearer token and user object client-side
   and redirect to the originally requested route (or the default landing
   route).
3. On app boot, validate any stored token with `GET /api/auth/me` before
   rendering protected routes.
4. A global response interceptor redirects to `/login` on any 401 and clears
   the stored session.
5. Router guard: all routes require auth except those marked `meta.public`
   (login only). Unauthenticated deep links redirect to `/login` and preserve
   the target for post-login redirect.
6. Logout clears the stored token and calls the logout endpoint.

## Non-functional requirements

- Token storage must survive reloads but never be exposed to markup (no
  tokens in the DOM or URLs).
- The login page must be fully themeable through design tokens like every
  other view.
- Boot-time session validation must not block rendering of the login page.

## API endpoints

| Method | Path | Use |
|--------|------|-----|
| POST | `/api/auth/login` | Login; returns `{ token, user }` |
| GET | `/api/auth/me` | Validate session on boot |
| GET/POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/config` | Auth configuration (which login methods are enabled) |

## Acceptance criteria

- Logging in with valid credentials lands on the requested/default route.
- Logging in with invalid credentials shows an inline error, no navigation.
- Reloading any protected route with a valid token renders the route without
  a login round-trip.
- Reloading a protected route with no/expired token redirects to `/login`
  and returns to the original route after login.
- A 401 from any API call anywhere in the app triggers the login redirect.
- Logout clears the session and lands on `/login`.
