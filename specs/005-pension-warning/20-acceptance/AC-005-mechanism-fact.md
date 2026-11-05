# AC-005: The mechanism, as a checkable fact

Task T4. The facts register is `editorial.agreement`, rendered by `AgreementSection` inside
`[data-register="agreement"]`, each claim carrying one `CitationChip`.

## AC-005-17 — The facts register states the mechanism, as two claims, in five locales

Given the five shipped locale documents
When each document's `editorial.agreement` is read
Then its length is 4 in every locale (2 shipped + 2 new) and is equal across the five
And one claim — claim A — contains a contribution marker and a present-day marker from the T4
  tables below
And one other claim — claim B — contains an employed-person marker from the T4 table
And exactly one claim satisfies claim A's test and exactly one satisfies claim B's

| locale | contribution marker | present-day marker | employed-person marker |
|---|---|---|---|
| es | `cotizacion`, `cotizan`, `cotizaciones` | `hoy` | `ocupad`, `afiliad`, `trabaja` |
| en | `contribution` | `today`, `now` | `employed`, `worker`, `affiliated` |
| fr | `cotisation` | `aujourd'hui`, `aujourd` | `occupé`, `salarié`, `travaill` |
| de | `beitrag`, `beiträge` | `heute` | `beschäftigt`, `erwerbstätig`, `arbeit` |
| it | `contribut`, `contribuzion` | `oggi` | `occupat`, `lavorator`, `lavora` |

## AC-005-18 — Each claim cites the record that supports it

Given the shipped citation registry
When claim A's `citationId` is read
Then it is exactly `ss-estadisticas-pensiones`
And that id resolves in `citationRegistry`
When claim B's `citationId` is read
Then it resolves in `citationRegistry`
And the resolved citation's `url` host is `ec.europa.eu`, the host of the committed `fig-01`
  manifest's `sourceUrl` entries
And if no shipped record carried that source, exactly one record was added to
  `web/content/data/citations.json`, its `url` is one the committed `fig-01` manifest already
  declares, and no other record in that file changed

## AC-005-19 — Claim B's numerals are the committed `fig-01` numerals

Given the committed `data/derived/fig-01.json`, whose `value.first.ratio` is 0.28 (period 2009)
  and whose `value.latest.ratio` is 0.33 (period 2024)
And the rendered `fig-01` plate in `#figuras`
When claim B is rendered in locale `es`
Then it contains the same numeral the plate publishes for the first observed period (`0,28`)
And it contains the same numeral the plate publishes for the latest observed period (`0,33`)
And both numerals match the plate's rendered strings character for character, comma included
And the assertion holds in all five locales with each locale's own decimal separator
And claim B contains no other digit
And no hand-typed `0.28`/`0,28` literal exists outside the derived data and the rendered
  expression: the claim derives its numerals from the committed value, not from a copy edit

## AC-005-20 — No claim is dropped and the dispute register is untouched

Given each locale's `editorial.agreement` and `citationRegistry`
When `resolveClaims` runs
Then the returned array's length equals `editorial.agreement`'s length
And the rendered `[data-register="agreement"]` contains one `.claim` block per entry
When each locale's `editorial.disputes` is digested as
  `sha256(JSON.stringify(editorial.disputes)).slice(0, 16)`
Then it equals the shipped value: `es 13664be5e36495f1`, `en 660ede8cc7a02ea4`,
  `fr 545577fc6b017334`, `de 5aa69640c6107c12`, `it 6cab58e77764be1e`
And no claim asserts that contributions cover the whole pension bill: claim A and claim B contain
  none of `suficiente`, `cubre todo`, `enough`, `covers the whole`, `suffit`, `deckt`, `basta`

## AC-005-21 — The fact assigns no cohort blame and borrows no thesis vocabulary

Given claim A and claim B, lowercased, in each locale
When they are searched
Then neither contains an age-cohort word: `65`, `mayores`, `older`, `âgé`, `ältere`, `anziani`
And `thesisVocabularyOutsideThesis(content.strings, content.editorial)` returns `[]`
  (preserved AC-001-41)
And the rendered `[data-register="agreement"]` section contains none of `pirámide`, `piramide`,
  `pyramid`, `pyramide`, `fraude`, `fraud`, `estafa`, `betrug` (preserved AC-001-41)

## AC-005-22 — No new figure, series or derived artefact

Given the repository's committed data
When the derived artefacts are enumerated
Then `FIGURE_IDS` still has 7 entries
And every file under `data/derived/` and `data/snapshots/` is byte-identical to the shipped one
And no locale document carries a new figure, unit or computed value: the only digits in claim A
  and claim B are the two `fig-01` numerals of AC-005-19
And the page renders with the same figure count before and after the change
