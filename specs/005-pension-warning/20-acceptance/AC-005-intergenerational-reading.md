# AC-005: The intergenerational judgement, in the opinion register

Task T5. The opinion register is `editorial.thesis`, rendered by `ThesisSection` inside
`[data-register="thesis"]`, headed by `thesis.label`, opened by `thesis.disclaimer`.

## AC-005-23 — Exactly one piece of prose carries the reading

Given the five shipped locale documents
And the candidate strings `editorial.thesis.statement` followed by every entry of
  `editorial.thesis.paragraphs`
When each candidate is tested against the T5 marker test (a today's-workers marker **and** a
  tomorrow's-workers marker from that locale's table)
Then exactly one candidate matches, per locale
And the number of candidates matching is not 0 and not 2
And `editorial.thesis.paragraphs.length` is equal across the five locales

| locale | today's workers | tomorrow's workers |
|---|---|---|
| es | `hoy` | `mañana`, `futur`, `vienen`, `próxim` |
| en | `today`, `now` | `tomorrow`, `future`, `next generation`, `coming` |
| fr | `aujourd'hui`, `aujourd` | `demain`, `futur`, `prochaine génération`, `à venir` |
| de | `heute` | `morgen`, `zukunft`, `nächste generation`, `kommend` |
| it | `oggi` | `domani`, `futuro`, `prossima generazione`, `a venire` |

## AC-005-24 — It says where the weight falls, on both sides of the transfer

Given the reading identified in AC-005-23, for locale `es`
When it is read
Then it contains `hoy` and at least one of `mañana`, `futur`, `vienen`, `próxim`
And the five locales' readings are pairwise different (no Spanish copied into another locale)
And the reading carries no figure of its own: it introduces no numeral that is not already
  published by the page

## AC-005-25 — It is labelled as the page's reading, not as a measurement

Given the rendered page for each of the five locales
When the reading's text is located in the document
Then its offset is inside `[data-register="thesis"]`
And its offset is after the offset of the element carrying `thesis.disclaimer`
And that section's heading is the locale's `thesis.label`
And the section still contains the `thesis__statement`, `thesis__disclaimer` and
  `thesis__signature` elements (preserved AC-001-43)

## AC-005-26 — It does not accuse a cohort of not having paid in

Given the reading, lowercased, for each locale
When it is searched for a denial of contribution
Then it contains none of `no cotizaron`, `no han cotizado`, `did not contribute`,
  `never contributed`, `n'ont pas cotisé`, `nicht eingezahlt`, `non hanno contribuito`
And it contains no second accusation construction in that locale's words for "never paid"
And the facts register's two claims do not appear inside `[data-register="thesis"]`
  (the reading is not the fact restated)

## AC-005-27 — The thesis keeps its structure and its vocabulary boundary

Given the rendered page for each locale
When the thesis section and the page around it are inspected
Then `thesisVocabularyLocations(content.editorial).length` is greater than 0
And `thesisVocabularyOutsideThesis(content.strings, content.editorial)` is `[]`
  (preserved AC-001-41)
And the reading's text does not occur between `<main` and the `class="story__strip"` marker
  (preserved AC-003-46)
And the reading's text does not occur between `id="figuras"` and `id="debate"`
And `data-register="thesis"` occurs after `id="debate"` in document order
