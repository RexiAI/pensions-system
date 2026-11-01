# AC-003: Data-driven fuse (T2)

## AC-003-11 — The fuse reproduces the observed ratio over the threshold
Given the committed snapshot data/snapshots/eurostat-demo-pjan.json with Spain 2025 observed ratio 31.22
And the documented threshold 50
When the fuse figure is computed
Then the observed ratio is 31.22 for year 2025
And the consumed percentage is 62.44

## AC-003-12 — The latest observed year is taken, not the first
Given a demo_pjan snapshot containing years 1995 and 2025, both with both age classes
When the fuse figure is computed
Then the observation year used is 2025

## AC-003-13 — The display rounding is pinned
Given a consumed percentage of 62.44
When the fuse is rendered in es
Then it prints "62 %"
And it prints the observed ratio as "31,22" with the year 2025 beside it
And given a consumed percentage of 62.50 it prints "63 %"

## AC-003-14 — The threshold is the shared parameter, not a second literal
Given the threshold parameter changed from 50 to 40
When the fuse figure is computed from the committed snapshot
Then the consumed percentage is 78.05

## AC-003-15 — Above the threshold the percentage is not capped
Given an observed ratio of 55.00 and threshold 50
When the fuse is rendered
Then the printed percentage is "110 %"
And the drawn consumed length is the full fuse length

## AC-003-16 — The fuse carries a complete manifest and reproduces by command
Given the derived fuse figure
When its manifest is validated
Then it carries formulaId, definitionId, sourceUrl, fetchedAt, inputHash, reproducePath and snapshotYear, all non-empty
And running its published reproduce command on the committed snapshot outputs the same inputHash and 62.44
And the fuse is listed in the reproduce panel

## AC-003-17 — Changing the snapshot changes the hash
Given the demo_pjan snapshot with one value altered
When the fuse figure is recomputed
Then its inputHash differs from the committed one

## AC-003-18 — No observed value, no fuse
Given the demo_pjan snapshot is absent, or has no year with both age classes, or the fuse availability is not computed
When the page is rendered
Then no fuse line, label, definition, provenance disclosure or reproduce link renders
And no value from proj_23np is shown in its place
And the clock still renders when its threshold year exists

## AC-003-19 — No threshold year, no fuse
Given countdown data in the not-crossed, unavailable or withheld state
And a valid observed ratio
When the page is rendered
Then no fuse renders

## AC-003-20 — The projected value is never used for now
Given a proj_23np snapshot whose 2025 back-cast is 31.9
When the fuse figure is computed
Then the computation does not read proj_23np
And altering the proj_23np snapshot leaves the fuse value and inputHash unchanged

## AC-003-21 — The fuse implies no date and does not move with the clock
Given the rendered fuse
When its text and attributes are inspected and the clock ticks for 3 seconds
Then the fuse contains no date, no crossing year and no day, hour, minute or second value other than its observation year
And its geometry and text are identical before and after the ticks
And it carries no role="progressbar" and no aria-valuenow
And its graphic is aria-hidden while the percentage, ratio, year and threshold are exposed as text

## AC-003-22 — The fuse carries no alarm hue and no new hue
Given the fuse subtree in light and dark themes
When its computed colours are resolved
Then none resolves to --data-deficit
And the consumed segment resolves to --accent and the remainder to --ink-3
And no fuse colour resolves to a --rule-* token
And the fuse is not a descendant of the clock subtree (it is a sibling within the band)

## AC-003-51 — The fuse's provenance is inside the method disclosure, not inline under the fuse (D1)
Given the rendered fuse in each of the five locales
When its visible text and its markup are inspected with the disclosure closed
Then the fuse's own visible text is the label line, the definition line and the reproduce link, and nothing else
And no inputHash value, source URL, reproducePath or provenance field value appears in the visible text above the share row
And the provenance strip, the digest and the reproduce path render inside a details element whose summary resolves to the figure.methodLink string of that locale (the same "Cómo se calcula" disclosure every computed figure uses, no new key)
And that details element carries no open attribute in the prerendered HTML
And expanding it reveals the four provenance fields, the input hash and the reproduce path
And the fuse's drawn line, its label and its definition sit outside that details element
