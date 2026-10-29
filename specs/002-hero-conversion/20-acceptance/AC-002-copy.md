# AC-002: Conversion-register copy for the hero, in all five locales

The hero's conversion surface moves to second-person, one-idea-per-sentence register,
subject to the three named build gates. Copy is confined to `hero.*`; every
`countdown.*` string keeps its factual register (layout changes, vocabulary does not).

## AC-002-22 — Every statement names its country
Given the `hero.statement` in each locale
When each string is read
Then it contains that locale's `countryName`:
`España` (es), `Spain` (en), `Espagne` (fr), `Spanien` (de), `Spagna` (it)
And `scripts/check-content-scope.ts` reports clean

## AC-002-23 — Every statement fits its locale budget
Given the `hero.statement` in each locale
When its length is measured as `statement.length`
Then it does not exceed its budget from `web/content/budgets.ts`:
`es ≤ 42`, `en ≤ 46`, `fr ≤ 52`, `de ≤ 55`, `it ≤ 50`

## AC-002-24 — Key parity is preserved across all five locales
Given the five locale JSON files (`es`, `en`, `fr`, `de`, `it`)
When each `strings` object is keyed
Then each has exactly 248 keys
And there are no missing keys and no unknown keys (`web/content/registry.ts` reports clean)
And no key is added or removed — only `hero.*` string values change

## AC-002-25 — The hero copy is in the conversion register, second person
Given the new `hero.statement`, `hero.sub` and `hero.ctaPrimary` strings
When each is read in the source locale (`es`)
Then the strings address the reader in the second person (a form such as `te`, `tú`, `tu`,
`ti`, `contigo`)
And each string carries one idea (a single clause, no compound sentence)
And the strings are an invitation to act, not the editorial description they replace

## AC-002-26 — The copy introduces no factual claim that requires a citation
Given the new `hero.*` strings
When they are read
Then none introduces a quantity, a source, or an institution claim
And the `editorial` object (`agreement` / `disputes` / `thesis`) is unchanged
And the `countdown.clock.*` and `fig.*` strings are unchanged

## AC-002-27 — No gate is modified to make the copy pass
Given the diff for the copy change
When it is read
Then `web/content/budgets.ts`, `web/content/registry.ts`, `web/content/keys.ts`,
`scripts/check-content-scope.ts`, `scripts/check-public-vocabulary.ts`, and the
acceptance tests keep their current contents
And only the five JSON files' `hero.*` values change

## AC-002-28 — Every `countdown.*` string keeps its factual register
Given the five locale JSON files
When every `countdown.*` string (eyebrow included) is read
Then `countdown.eyebrow` is unchanged (`Proyección central · Eurostat` and its
translations), never adopting second person or urgency
And no `countdown.*` string gains second-person address or urgency vocabulary
(`faltan`, `quedan`, `solo`, `apenas`, `cuenta atrás`, `bomba`, `explota`, `!`, `ya`)
And the register-rules test in `tests/acceptance/countdown.test.ts` stays green

## AC-002-36 — The statement-width record is re-measured, never the budget
Given `tests/acceptance/content-locale.test.ts`
When the `MEASURED` record and its prose table are read
Then they are re-recorded from a real measurement at 1280×800, under the same conditions
as the record they replace
And the re-recorded values match `es 34 chars [533,535]`, `en 39 [504,642]`,
`fr 38 [578,565]`, `de 39 [635,515]`, `it 36 [544,543]`
And every statement still sets in exactly two lines inside the 667px column
And no entry in `web/content/budgets.ts` is widened to fit — the statement is rewritten
to fit its existing budget, never the budget raised

> Ratified retroactively 2026-10-29. This site was changed before it was authorized: the
> Coder modified `content-locale.test.ts` on an authorization that did not exist, and the
> human ratified the substance afterward as a mandatory consequence of T6 (which rewrites
> `hero.statement` in all five locales while this file pins its measured width). The trail
> records the order of events, not a planned change.
