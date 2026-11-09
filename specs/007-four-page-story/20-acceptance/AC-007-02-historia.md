# AC-007-02 — Historia (home) page

## AC-007-05 — Historia renders the five-step story and the story strip, nothing else
Given the Historia page for a locale
When the page is rendered
Then it contains the five `data-top-step` sections in `TOP_STEPS` order
And it contains the story strip (`class="story__strip"`)
And it contains no `class="plate"`, no `id="metodo"`, no `data-register`, no
`class="reproduce"` and no assumptions ledger region

## AC-007-06 — exactly one h1, with the kicker above it
Given the Historia page for a locale
When the page is rendered
Then it contains exactly one `<h1>` carrying the hero statement
And the mechanism kicker (Task 8) renders above the `<h1>` as a labelled eyebrow,
not as the `<h1>` and not as an `<h2>`

## AC-007-07 — the story strip links to Método, and the share row still renders
Given the Historia page with a computed countdown carrying an anchor
When the page is rendered
Then the story strip's method link is an `<a href>` to the Método page route,
not `#metodo`
And the share row renders with its network controls
