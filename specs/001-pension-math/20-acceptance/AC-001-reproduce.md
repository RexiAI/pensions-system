# AC-001: Reproduce section advertises only what exists

## AC-001-105 — Only computed figures and series are advertised as reproducible
Given derived figures, some with `availability: 'computed'` and some `unavailable`
And a derived series (the pyramid) with its own `availability`
When the Reproducir section renders
Then a row is rendered only for a figure or series whose `availability` is `computed`
And the rendered row count equals the number of computed figures plus computed series
And the omitted-count line's number equals the unavailable count
And no digest or reproduce command is rendered for an `unavailable` figure
And the section's row labels are produced by an id-to-key lookup, never by parsing the id string
  (no `Number(id.slice(-1))`)
And when the unavailable count equals zero, the omitted line renders nothing
