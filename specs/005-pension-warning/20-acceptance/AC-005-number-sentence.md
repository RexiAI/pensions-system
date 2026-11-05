# AC-005: Step 1's sentence names the proportion

Task T2. `steps.number.sentence` is step 1's one sentence, rendered by `NumberStep` as
`<p class="step__sentence">`.

## AC-005-06 — The first sentence names the proportion beside the date

Given the committed countdown series with `anchor` `2042-01-01T00:00:00+01:00` and
  `threshold` 50
And `COUNTDOWN_THRESHOLD` = 50 and the published base = 100
And the formatted anchor date for locale `es`, `formatDate(anchor, 'es', CLOCK_TIME_ZONE)`
  = `1 de enero de 2042`
When step 1 of the rendered page is inspected for locale `es`
Then its `p.step__sentence` text contains `50`
And it contains `100`
And it contains `65`, `15` and `64`
And it contains the formatted anchor date
And the date, the threshold and the base are in the same sentence (one text-node sequence, no
  second paragraph)

## AC-005-07 — The 50 and the 100 are bound to their sources, not typed

Given the template `steps.number.sentence` in each of the five locale documents
When the template's placeholders are extracted with `/\{(\w+)\}/g`
Then the set is exactly `{date, threshold, base}` in every locale
And the function that renders step 1 resolves `threshold` from `COUNTDOWN_THRESHOLD`
And it resolves `base` from the same single constant `BreakageStep` uses
When step 1 and step 2 are rendered for the same locale
Then the threshold numeral in step 1 equals the threshold numeral in step 2, character for
  character
And the base numeral in step 1 equals the base numeral in step 2, character for character
And neither the threshold nor the base appears as a literal digit inside any of the five
  `steps.number.sentence` templates

## AC-005-08 — The forward reference to the next step is gone

Given the five locale documents
And the banned phrases `paso siguiente`, `siguiente paso`, `next step`, `l'étape suivante`,
  `étape suivante`, `nächste Schritt`, `nächsten Schritt`, `passo successivo`, `prossimo passo`
When each locale's `steps.number.sentence` is read, lowercased
Then it contains none of the banned phrases
And it is not equal to that locale's shipped template
  (the shipped Spanish one contains `la proporción que explica el paso siguiente`)

## AC-005-09 — The date is still stated once, and in step 1

Given the rendered page for each of the five locales
And the five steps' visible text, with `data-operator="true"` subtrees stripped
When the formatted anchor date is counted as an occurrence in that text
Then the count is exactly 1 (preserved AC-004-29)
And the single occurrence lies inside `[data-top-step="number"]`
And no other step names the date

## AC-005-10 — The proportion is stated in step 1 and step 2, and nowhere else

Given the rendered page for locale `es`
And the numeral patterns `(?<![\d.,])50(?![\d.,])` and `(?<![\d.,])100(?![\d.,])`
When each of the five steps' visible text is tested for containing both patterns
Then the set of steps that contain both is exactly `['number', 'breakage']`
And no third step contains both

This supersedes AC-004-11, which asserted that step 2 was the sole carrier. See AC-005-36.

## AC-005-11 — The sentence keeps the factual register and the plain-language gate

Given the rendered story region of each locale, `<main>` up to `class="story__strip"`
And `BANNED_TOP_TERMS` and `internalTermsOf(figures, series)`
When `scanTopRegion` runs over that region
Then it returns no hit whose context contains step 1's sentence
And for each locale the sentence contains no second-person form from AC-002-28's table
  (`es: tú, tu, vosotros, vuestro`; `en: you, your`; `fr: vous, ton, ta, tes`;
  `de: du, dich, dein, deine`; `it: tu, tuo, tua`)
And it contains no `!`
And it contains none of `bomba`, `explota`, `solo`, `apenas`, `urgente`, `inminente`,
  in any locale's translation of those words
And `faltan`, `quedan` and `cuenta atrás` are allowed in it: they are the plain countdown
  phrasing the shipped sentence already uses, and AC-002-28's fuller list governs
  `countdown.*`, which this spec does not touch
