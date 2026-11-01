# AC-003: Invariants that must not regress (cross-cutting)

## AC-003-44 — Public routes stay static with correct language
Given a production build
When the five public routes are built
Then each is prerendered static HTML
And each document's html lang equals its route locale
And each carries hreflang links for all five locales plus x-default

## AC-003-45 — Admin stays fail-closed
Given the admin credential is unconfigured
When an admin route is requested
Then it responds 503 and the public routes render unchanged

## AC-003-46 — The thesis register stays uncoloured and separate
Given the public page with band, fuse, share region and pending block
When the thesis section and every new element are inspected
Then the thesis section resolves no chromatic hue and remains structurally separate
And none of the new elements references thesis content
