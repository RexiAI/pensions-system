# AC-001: Fail-closed configuration

## AC-001-53 — Unconfigured credential fails closed to 503
Given `ADMIN_PASSWORD_HASH` or the session secret is unset
When `/admin` or any admin API route is requested
Then the route returns 503 and never falls through to open access

## AC-001-54 — Public site is unaffected by admin misconfiguration
Given `ADMIN_PASSWORD_HASH` or the session secret is unset
When a public page is requested
Then it still renders with a 200 and no admin dependency

## AC-001-55 — No admin secret in the client bundle
Given a production build
When the build output is searched for the admin secret and for `NEXT_PUBLIC_*` variables
Then no admin secret or credential appears in any client bundle or public env variable

## AC-001-56 — Error bodies do not echo configuration detail
Given an admin route failing because of misconfiguration or auth failure
When the error response is inspected
Then the body is a generic message with no config key names, secret values, or credential detail

## AC-001-70 — The 503 escapes the admin shell
Given `ADMIN_PASSWORD_HASH` or the session secret is unset
When `/admin` is requested
Then the 503 is produced by middleware or an early return before the admin layout mounts
And the response body contains no operator bar, no navigation, and no session-bearing markup
