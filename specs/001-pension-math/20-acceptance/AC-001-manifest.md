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

## AC-001-74 — `availability` separates a computed figure from a never-computed figure
Given a derived figure whose source series is specified and resolved
And a derived figure whose source series has never been specified or resolved
When both figures are serialised to `data/derived/` and validated
Then the first carries `availability: 'computed'` together with a value and a complete manifest
And the second carries `availability: 'unavailable'`, has no headline value, renders no chart and
  no table, and is never labelled current
And the `unavailable` figure is a valid published data state that does not fail the build, while a
  required source that failed to fetch still fails the build with a non-zero exit
And a figure marked `unavailable` that carries a headline value, or a figure marked `computed` that
  lacks a complete manifest, fails validation

## AC-001-77 — A figure carries a definitionId and a published definition string
Given a derived figure
When the figure is serialised to `data/derived/`
Then it carries a non-empty `definitionId` and a non-empty `definition` string
And its manifest records the same `definitionId`, so a reader can always see which definition
  produced the value

## AC-001-78 — An unknown definitionId fails validation
Given a derived figure whose `definitionId` is not in the documented set
When the figure is validated
Then validation fails and the figure is not emitted as current

## AC-001-92 — A definition string is instrument vocabulary, never thesis vocabulary
Given a definition string for any figure
When the string is inspected
Then it states what is counted and what is excluded
And it contains no thesis adjective or conclusion ("fraud", "pyramid", "insostenible",
  "injusto", or like terms)
