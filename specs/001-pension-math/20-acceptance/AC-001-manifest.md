# AC-001: Derived-figure manifest

## AC-001-01 — A derived figure's manifest carries all required fields
Given a derived figure for the dependency ratio
When the figure is serialised to `data/derived/`
Then its manifest contains non-empty values for `sourceUrl` (at least one URL),
`fetchedAt`, `formulaId`, `inputHash`, and `reproducePath`

## AC-001-02 — Changing an input snapshot changes the hash
Given an input snapshot with bytes `A`
And an input snapshot with bytes `B` where `B != A`
When the manifest hash is computed for each
Then the hash of `A` differs from the hash of `B`

## AC-001-03 — A figure with a missing or empty manifest field is rejected
Given a derived figure whose manifest has an empty `inputHash` (or is missing any required field)
When the manifest is validated
Then validation fails and the figure is not emitted as current
