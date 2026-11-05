# AC-004: The methodological precision relocates into `#metodo`

## AC-004-33 — Every dropped precision string is still on the page
Given the page rendered in any locale
When `#metodo` is read
Then it renders `countdown.definition`, `countdown.yearLabel`, `countdown.source`, `countdown.clock.definition` and `countdown.clock.arithmetic`
And it renders `countdown.range` when the countdown value publishes a range
And it renders `countdown.backCast` when the countdown value publishes a back-cast
And it renders `countdown.eyebrow`
And it renders `fuse.label` and `fuse.definition`
And it renders the provenance strips of the pyramid and the fuse

## AC-004-34 — The strings are the content model's, not a rewrite
Given the page rendered in any locale
When each of those strings is compared to the locale document's value for its key
Then the rendered text equals the interpolated document value
And no summary, paraphrase or truncation of them appears in `#metodo`

## AC-004-35 — `#metodo` keeps the register key
Given the page rendered in any locale
Then `class="register-key"` renders inside or at `#metodo`
And the registers' heading count still matches the registers rendered

## AC-004-36 — Every in-page reference to `#metodo` resolves
Given the page rendered in any locale
When every `href="#metodo"` is collected
Then at least one exists
And an element with `id="metodo"` exists
And no `href` of the form `#<id>` on the page points at an id that does not exist, excluding the bare `#` the scope mark uses

## AC-004-37 — The method region is below the fold content
Given the page rendered in any locale
Then `#metodo` follows the fifth step in document order
And `#metodo` contains no element carrying `data-top-step`
