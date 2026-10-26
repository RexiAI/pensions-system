# AC-001: Admin authentication

## AC-001-46 — Wrong password returns 401, counts the attempt, reveals nothing
Given a login attempt with an incorrect password
When it is submitted to the admin login route
Then the response is 401 with a fixed generic body (no detail about the hash, the account, or whether configuration exists)
And the failed attempt is counted for rate limiting

## AC-001-47 — Repeated failures lock the account out
Given 5 failed login attempts from the same IP within 15 minutes
When a further login attempt is made
Then it is rejected with a lockout response and an increasing (exponential) backoff delay applies

## AC-001-48 — Valid login sets a hardened session cookie
Given a correct password
When the login succeeds
Then the response sets a session cookie with `HttpOnly`, `Secure`, and `SameSite=Strict`

## AC-001-49 — A tampered session cookie is rejected
Given a session cookie whose HMAC signature has been altered
When it is presented to an admin route
Then the route rejects it as unauthenticated

## AC-001-50 — An expired session cookie is rejected
Given a session cookie whose ~30 minute TTL has elapsed
When it is presented to an admin route
Then the route rejects it as unauthenticated

## AC-001-51 — A state-changing request without CSRF is rejected
Given an authenticated admin session
When a state-changing request is made without a valid CSRF token
Then the request is rejected with 403

## AC-001-52 — Admin routes are noindex and excluded from the sitemap
Given the admin routes
When their response headers and the sitemap are inspected
Then admin responses carry a noindex directive and no admin URL appears in the sitemap

## AC-001-69 — Public routes are static, admin routes are dynamic
Given a production build
When the public routes and the admin routes are inspected
Then the public routes are statically generated with no per-request session
And the admin routes are dynamic with a per-request server-side auth check and a `Cache-Control: no-store` response header
