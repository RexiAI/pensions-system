# AC-006: Recompose the number group as one measured quantity

Task 2. The group is the day numeral and the unit `días`, in that DOM order, between the step label
and the sentence. Measured with the contract in `10-tasks.md` §2.

**Revised in revision 2.** AC-006-04 asserted four fields in order (years, days, three sub-day
cells). There is one field now; the scenario asserts that and the absence of the other three.

## AC-006-03 — The unit stays beside its numeral, and stays legible

Given step 1 at each of the five locales and each of the three viewports
When the day numeral's ink and the `días` unit's ink are measured
Then the gap between the numeral's ink right edge and the unit's ink left edge is at most 12 px (`--space-3`), measured to 0.1 px — the design's measured result is exactly 12.0 px once the 5ch reservation is dropped, so the boundary is inclusive and the rounding is stated rather than assumed
And the unit's computed `font-size` is at least 15 px (`--text-small`)
And the unit is text in the DOM, not an `aria-label` on a span of digits
And neither the numeral nor the unit has been moved onto a line of its own to achieve the axis.

## AC-006-04 — The group publishes exactly one quantity

Given the number group in the served document at each of the five locales
When its descendants and their text are read in DOM order
Then the group contains the day numeral and the unit `días`, and nothing else
And it contains no years numeral, no second unit, no sub-day cell and no time-of-day value
And those elements are absent from the DOM rather than hidden by CSS or `visibility`
And no field was dropped by deleting a content key: the keys the removed fields used are either still used by `#metodo` or explicitly re-pointed.
