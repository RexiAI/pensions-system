# AC-003: Collapse the unavailable figures (T5)

## AC-003-39 — One block holds every unavailable figure
Given five figures whose availability is not computed
When the es public page is rendered
Then exactly one "en preparación" block renders, headed with the count 5 taken from data
And it lists all five figures, each with its reason, its published definition and a link to its method

## AC-003-40 — "sin calcular" appears at most once
Given the five locale public pages
When their rendered visible text is searched for the figure.unavailable.chip string of that locale
Then it occurs at most once per page

## AC-003-41 — Unavailable figures still expose no reproduction
Given the collapsed block
When it is inspected
Then it contains no chart, no table, no hash and no reproduce command for those figures
And no figure in it shows a substitute value

## AC-003-42 — The block tracks the data
Given zero unavailable figures
When the page is rendered
Then no block renders
And given exactly one unavailable figure, the heading uses the singular form

## AC-003-43 — Computed figures and registers are unaffected
Given the collapsed block in place
When the page is rendered
Then every computed figure renders in its original position with its provenance
And each register heading's count matches the registers rendered
And the block contains no thesis vocabulary
