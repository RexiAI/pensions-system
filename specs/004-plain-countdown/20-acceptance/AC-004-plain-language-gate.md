# AC-004: The plain-language gate

## AC-004-38 — The gate exists, with the named terms in five languages
Given the module `web/build/public-plain-language.ts`
Then it exports `BANNED_TOP_TERMS` and `scanTopRegion`
And `BANNED_TOP_TERMS` matches the dependency-ratio phrase in `es`, `en`, `fr`, `de` and `it`
And it matches each of `demo_pjan`, `ESSPROS`, `spr_exp_pens`, `proj_23np`
And it matches the demographic-projections series name in all five locales

## AC-004-39 — The shipped top region passes in every locale
Given the rendered public page in each of the five locales
When `scanTopRegion` runs against it
Then it returns no hit
And the build step `npm run check:plain-language` exits 0

## AC-004-40 — The gate fails on jargon
Given a fixture page whose top region contains a banned term
When `scanTopRegion` runs against it
Then it returns at least one hit naming that term
And `npm run check:plain-language` exits non-zero

## AC-004-41 — The gate sees attribute copy and repository identifiers
Given a top region whose only occurrence of a banned term is inside an `aria-label`
Then the gate reports a hit
Given a top region containing an identifier returned by `internalTermsOf(figures, series)`
Then the gate reports a hit
And a `data-operator="true"` subtree containing a banned term is not reported
