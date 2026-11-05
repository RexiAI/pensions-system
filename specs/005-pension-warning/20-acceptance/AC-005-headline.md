# AC-005: The headline says what the page measures

Task T1. `hero.statement` is the page's only `<h1>`, rendered by `NumberStep` inside
`[data-top-step="number"]`.

## AC-005-01 — The headline names ageing and the countdown, in five locales

Given the five shipped locale documents for country `ES`
And the T1 marker tables for ageing (`envejec|mayores|edad`, `ageing|aging|older|age`,
`vieillis|âgé|age`, `alter|älter|alterung`, `invecchi|anzian|età`)
And the T1 marker tables for the countdown (`cuenta atrás|faltan|te quedan|días`,
`countdown|days|remaining|left`, `compte à rebours|jours|restants`, `countdown|tage|zählt`,
`conto alla rovescia|giorni`)
When each locale's `hero.statement` is read, lowercased
Then it contains at least one ageing marker for that locale
And it contains at least one countdown marker for that locale
And the markers are matched case-insensitively as substrings, not as whole words only

## AC-005-02 — The shipped promise is gone from all five

Given the shipped statements `La pensión que te espera en España`,
`The pension that waits for you in Spain`, `La retraite qui vous attend en Espagne`,
`Die Rente, die dich in Spanien erwartet`, `La pensione che ti aspetta in Spagna`
And the banned constructions `pensión que te espera`, `pension that waits for you`,
`retraite qui vous attend`, `Rente, die dich erwartet`, `pensione che ti aspetta`
When each locale's `hero.statement` is read, lowercased
Then it is not equal to that locale's shipped statement
And it does not contain that locale's banned construction

## AC-005-03 — The headline keeps every inherited gate

Given the five shipped locale documents
When `validateDocument` is called on each document
Then no problem carries the code `scope-statement`
And no problem carries the code `statement-budget`
And each `hero.statement` contains its document's `countryName` (preserved AC-002-22, AC-001-103)
And each `hero.statement`.length is less than or equal to `HERO_STATEMENT_BUDGETS[locale]`
  (es 42, de 55, en 46, fr 52, it 50, unchanged) (preserved AC-002-23)
And no `hero.statement` matches `/[.!?;:]/` (preserved AC-002-25)
And no `hero.statement` matches `/\d/` (preserved AC-002-26)
And no `hero.statement` names an institution from AC-002-26's list as a whole word
And the Spanish statement matches `/(?<!\p{L})(te|tú|tu|ti|contigo)(?!\p{L})/iu`
  (preserved AC-002-25)

## AC-005-04 — The page still opens with one `<h1>` inside step 1

Given the rendered page for locale `es`
When the document is inspected
Then exactly one `<h1>` element exists
And it is inside the element carrying `data-top-step="number"`
And it precedes the element carrying `class="clock"` in document order
And its text is the locale's `hero.statement` (preserved AC-004-08)

## AC-005-05 — The sub-line stops promising an amount

Given the five shipped locale documents
When each `hero.sub` is read, lowercased
Then it does not contain that locale's amount word (`cuánto`, `how much`, `combien`, `wie viel`,
  `quanto`)
And it contains no digit
And it contains no `!` and no em-dash
And it splits into at most two sentences on `/[.!?]/`
And the name `hero.sub` still renders on the page in every locale

Note: this scenario carries the defaulted bullet of T1 (open question 1). If the human gate drops
it, this scenario and that bullet are deleted together.
