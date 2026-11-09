# AC-007-06 — Persistent header navigation

## AC-007-11 — four page links with aria-current on the active page
Given the header on any one of the four pages, in any locale
When the header is rendered
Then it renders four `<a href>` links to the Historia, Cifras, Método and Debate routes,
localized from content keys
And the link for the page being viewed carries `aria-current="page"` and the other three
do not
And the locale switcher and theme toggle still render

## AC-007-12 — the nav is reachable, 44×44, reduced-motion safe and needs no JavaScript
Given the header nav at the mobile viewport
When the nav is inspected (rendered HTML and CSS)
Then every nav link is an ordinary `<a href>` present in the served HTML, so no page
requires client JavaScript to reach
And every nav target is at least 44×44 CSS px
And every nav link is keyboard-reachable
And no nav transition or animation runs when `prefers-reduced-motion: reduce` is set
And the locale cells keep `aria-current="page"` on the active locale
