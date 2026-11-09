# AC-007-12 — Supersession declaration

## AC-007-27 — every affected single-page scenario is re-pointed or superseded, per ID
Given the supersession table in `10-tasks.md`
When the existing test suite is reconciled with the four-page split
Then each affected scenario ID is accounted for by exactly one disposition:
- **Re-pointed** (substance is a value, accuracy, accessibility, traceability or
  reproducibility property): the test renders the page that now owns the region and the
  ID stays cited
- **Superseded** (substance is a single-page fold pin, section order or in-page anchor):
  the ID is added to `SUPERSEDED_SCENARIOS` in
  `scripts/check-scenario-traceability-3digit.ts` and its assertion is replaced by a new
  `AC-007-*` scenario
And no scenario ID is left dangling

## AC-007-28 — scenario traceability is green
Given the full test suite and the scenario declarations
When `scripts/check-scenario-traceability-3digit.ts` runs
Then it exits 0
And every `AC-007-*` scenario is cited by a test
And every citation resolves to a declared scenario
And no superseded or retired ID is still cited by a test
