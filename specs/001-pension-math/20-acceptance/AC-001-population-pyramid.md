# AC-001: Population age structure (the pyramid)

## AC-001-93 — Single-year codes band to 5-year groups; the open-ended band resolves by label
Given `demo_pjan` age codes `Y_LT1`, `Y1`…`Y99`, `Y_OPEN`
And `proj_23np` age codes `Y_LT1`, `Y1`…`Y99`, `Y_GE100`
When the codes are aggregated into 21 five-year bands
Then the 100+ band is present for every year shown (1995, 2025, 2050)
And the 100+ band resolves from `Y_OPEN` in `demo_pjan` and from `Y_GE100` in `proj_23np`,
  matched by label, never by a hardcoded code

## AC-001-94 — Per-sex totals reconcile with the total; shares sum to 100; UNK excluded
Given per-band, per-sex, per-year population data
When the pyramid's per-band shares are computed
Then for every band and every year `M + F == T` (the sex total)
And the per-band shares for a year sum to 100 (± 0.1)
And `UNK` age rows are excluded, and that exclusion is recorded in the definition string

## AC-001-95 — The derived series carries a complete manifest from the documented sets
Given the pyramid derived series
When it is serialised to `data/derived/series/pyramid.json` and validated
Then it carries a complete manifest: `sourceUrl`, `fetchedAt`, `formulaId`, `definitionId`,
  `inputHash`, and a `reproducePath` that resolves to a committed file
And `formulaId` and `definitionId` are entries in the documented closed sets
And a `formulaId` or `definitionId` outside the documented sets fails validation

## AC-001-96 — The derived file lives where the figure loader does not read it
Given the pyramid file at `data/derived/series/pyramid.json`
When the derived-figure store reads `data/derived/`
Then the pyramid file is not picked up as a metric figure
And the flat `readdirSync` skips the `series/` subdirectory, so the file is never cast to the
  closed `FigureId` union

## AC-001-97 — The chart and the table are emitted together or not at all
Given the pyramid is `computed`
When the demography block renders
Then the SVG chart and the 21-row table are emitted together by one component
And when the pyramid is `unavailable`, neither the chart nor the table is emitted
