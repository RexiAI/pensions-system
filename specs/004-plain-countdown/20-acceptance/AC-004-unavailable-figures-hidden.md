# AC-004: Unavailable figures leave the public page

## AC-004-42 — No figure without a value appears
Given the committed derived figures, where `fig-03` to `fig-07` are `unavailable`
When the public page is rendered in any locale
Then its visible text contains no `figure.unavailable.chip`
And no `figure.unavailable.reason`
And no `fig.03.reason` through `fig.07.reason`
And no `pending.heading.one` or `pending.heading.other`
And no `figure.statusSummary`

## AC-004-43 — `#figuras` renders exactly the computed plates, in order
Given the committed derived figures
When the page is rendered in any locale
Then `#figuras` contains one plate per figure whose `availability` is `computed`
And the plates are in `FIGURE_IDS` order
And no other block renders inside `#figuras`

## AC-004-44 — The pending block is gone, the withheld row is kept
Given the repository
Then `web/components/PendingBlock.tsx` does not exist
And no module imports it
And `pending.heading.one` and `pending.heading.other` appear in neither `REQUIRED_KEYS` nor any locale document
And `FigureStatusRow` still exists and is still reachable from `PlateShell`
Given a figure that claims `computed` but is promoted to `withheld` by `figureState`
Then `#figuras` renders its ledger row and its chip, rather than dropping it silently

## AC-004-45 — Every figure computed renders every plate
Given a fixture in which all seven figures are `computed`
When the page is rendered
Then `#figuras` contains seven plates
And no pending or unavailable block renders
And each plate keeps its chart-and-table pairing and its provenance

## AC-004-46 — Zero computed figures is a page, not a hole
Given a fixture in which no figure is `computed`
When the page is rendered
Then the page renders without throwing
And `#figuras` contains no plate
And no empty heading, block or placeholder renders in its place
And the five steps and the registers render unchanged
