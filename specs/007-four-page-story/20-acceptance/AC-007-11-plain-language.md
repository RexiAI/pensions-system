# AC-007-11 — Plain-language gate scope

## AC-007-25 — the top region the gate scans is the Historia story
Given the plain-language gate's `topRegionOf`
When it is applied to a served document
Then it returns the Historia story region (the five steps up to the story strip), not a
combined single-page region
And `scanTopRegion` reports no hit for the shipped Historia page in any locale

## AC-007-26 — the precision pages stay out of the top-region scope
Given the Método page and the Debate page
When the gate's scope is applied
Then `#metodo` (Método page) is not scanned as "top region" — precision may name its own
sources there, exactly as before the split
And the `data-operator="true"` exclusion still applies
And the `check:plain-language` build step still runs on the Historia story and still
fails on a banned term in it
