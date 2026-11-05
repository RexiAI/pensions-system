# AC-005: Five locales, parity

Task T7.

## AC-005-32 — All five locales carry the change, each in its own language

Given the locale documents `es`, `en`, `fr`, `de`, `it`
When the five `hero.statement` values are compared pairwise
Then all five are different
And no non-Spanish statement equals its Spanish counterpart
When the five `steps.number.sentence` templates are compared with their placeholders removed
Then all five are different
When the five claim A texts are compared
Then all five are different
When the five readings identified in AC-005-23 are compared
Then all five are different
And no locale is missing a change another locale carries

## AC-005-33 — The editorial shape is identical across the five

Given the five locale documents
When their editorial arrays are measured
Then `editorial.agreement.length` is identical in all five and equals 4
And `editorial.thesis.paragraphs.length` is identical in all five
And every new claim and the reading are non-blank in every locale

## AC-005-34 — The key set is unchanged, and the placeholders match

Given `REQUIRED_KEYS` and the five locale documents
When `missingKeys` and `unknownKeys` run over each document's strings
Then both return `[]` for all five (preserved AC-004-69, AC-004-70)
And `REQUIRED_KEYS` gained no key and lost no key: this spec adds no string key, because the
  mechanism and the reading live in `editorial`, not in the strings table
When each locale's `steps.number.sentence` placeholders are extracted
Then every locale yields exactly `{date, threshold, base}`
And no locale yields a different set

## AC-005-35 — Five routes, five languages

Given the built app served by `next start`
When each public route is requested
Then all five prerender without error
And each document's `<html lang>` matches its locale (`es`, `en`, `fr`, `de`, `it`)
And each document contains its own locale's `hero.statement`
  (preserved AC-004-72, AC-001-54)
