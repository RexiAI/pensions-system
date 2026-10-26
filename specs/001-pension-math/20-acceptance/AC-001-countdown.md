# AC-001: Projected threshold crossing (the countdown)

## AC-001-98 — The ratio is computed from the pinned variant and age definition; the threshold is a parameter
Given `proj_23np` projection `BSL`
And the age definition 65-and-over per 100 persons aged 15–64
When the old-age dependency ratio is computed per year
Then the ratio is drawn entirely from `proj_23np`, including its own 2025 back-cast
And the threshold is a documented parameter: changing the threshold value changes the crossing
  year (the year is derived, never authored)

## AC-001-99 — The countdown is the difference of two printed integers, with no sub-annual unit
Given a crossing year and a snapshot year
When the countdown is computed
Then `years = crossingYear − snapshotYear`, both integers, both printed beside the number
And no sub-annual unit (months, days, hours) appears anywhere in the block

## AC-001-100 — The variant range is computed over all six variants; a non-crossing variant is excluded
Given the six projection variants `BSL`, `LFRT`, `LMRT`, `HMIGR`, `LMIGR`, `NMIGR`
When the crossing year is computed for each variant
Then the printed range is the minimum and maximum crossing year over the variants that cross
  inside the horizon
And a variant that never crosses inside the horizon is excluded from the range and does not
  fail the block

## AC-001-101 — A variant that never crosses renders no numeral and no substitute threshold
Given the pinned variant never reaches the threshold inside 2022–2100
When the countdown block renders
Then no numeral is rendered (the `not-crossed` state)
And a fixed sentence states that the baseline projection does not reach the threshold before the
  horizon ends in 2100
And no different threshold is substituted to keep a number
And the hero falls back to the figure ladder with no countdown
