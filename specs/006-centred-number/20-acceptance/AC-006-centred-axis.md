# AC-006: Compose step 1 on one axis

Task 1. Measured on the served page with the contract in `10-tasks.md` §2: per-text-node `Range`
rects for ink, step 1's content box (not the window) as the reference, five locales by three
viewports.

**Revised in revision 2.** The unit list went from six to four: the years line and the three-cell
sub-day row were units 3 and 5, and both are removed by Task 11. The ids and the tolerances are
unchanged.

## AC-006-01 — Every centred unit sits on the content box's centre

Given the served page at each of the five locales and each of the three viewports
And the centred units are **derived from the DOM, not listed**: every direct child of step 1's content column that carries a text node — today the `<h1>`, the step label, the number group and the sentence
When each derived unit's ink extent is measured over its text nodes
And each unit's ink centre is compared with the centre of step 1's content box
Then every unit's centre offset is at most 4 px
And every unit's residual asymmetry, the trailing gap minus the leading gap, is at most 8 px in absolute value
And the day numeral and the unit share one line and one centre, so the unit is not pushed to a second line by the centring
And the derived set is exactly four: a fifth text-bearing block added to the column must be centred too, rather than escaping a criterion that named only the four that exist today.

## AC-006-02 — The axis holds at every width, including German at the narrowest

Given the served page in `es` at 320, 360, 390, 768, 1024, 1280, 1366 and 1440 px wide
And the served page in `de` at 320 and 1440 px wide
When the same four-unit measurement is applied
Then every unit's centre offset is at most 4 px
And the sentence's residual asymmetry is at most 8 px
And no unit is centred by being widened beyond its declared measure, so the sentence's ink width stays at most `--measure`
And the empty width stops being one-sided: the sentence's residual asymmetry was 427 px at 1440 before this spec and is at most 8 px after.
