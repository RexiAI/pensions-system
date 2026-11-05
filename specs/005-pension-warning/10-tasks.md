# 005-pension-warning — tasks (stage 1)

Source: `specs/005-pension-warning/00-informal.md`. The four decisions in its
§Decisiones ya tomadas are taken as given and are not re-opened here. Scope is fixed there:
**copy and one spacing rule** — no new figure, no new series, no new computed value, no change
to what the countdown counts to.

Spec 004 composed the five-step story. This spec fixes its words and the air inside step 1. It
moves nothing: `TOP_STEPS`, the component tree, the anchors, the data layer and the visual
register all stay as spec 004 left them.

## Reading order

| # | Task | Why it is here |
|---|---|---|
| T1 | The headline says what the page measures | defect 1 — the `<h1>` promises a pension the page never gives |
| T2 | Step 1's sentence names the proportion | defect 2 — the sentence is circular and defers the number |
| T3 | Step 1 stops being the tightest box | defect 3 — 32 px against every other step's 64 px |
| T4 | The mechanism, as a checkable fact, in the facts register | defect 4, first half — "cómo se paga", with its figure and source |
| T5 | The intergenerational judgement, in the opinion register | defect 4, second half — the reading, labelled as the page's reading |
| T6 | The three registers stay separate, checkably | the informal spec's §Nota sobre el registro |
| T7 | Five locales, parity | constraint 3 — any copy change lands in all five |
| T8 | Supersede the two pinned-copy criteria and keep the rest | constraint 4 — name what changes, retire nothing else |

T1 and T2 are copy in `web/content/data/ES/<locale>.json`, rendered by components spec 004
already wrote (`NumberStep`, `TopStepSection`). T3 is CSS in `web/styles/globals.css`. T4 and T5
are per-locale `editorial` data rendered by the existing register components
(`AgreementSection`, `ThesisSection`) — no new component and no new content key, which is why
`REQUIRED_KEYS` does not move. T6 is the property that makes T4 and T5 checkable together. T7
gates every copy task. T8 depends on T1–T6 having decided their final text.

Defect 4 is closed by T4 and T5, **not** by rewriting step 5. Step 5's sentence
(`steps.meaning.sentence`) is out of scope and must not change: the informal spec routes the
mechanism to the facts register and the judgement to the opinion register, and a fifth copy
change is not one of its four asks.

---

## T1 — The headline says what the page measures

`hero.statement` is the page's only `<h1>`. Today it promises a pension the page never
computes, in five languages. It is re-titled so it names the two things the page actually
measures: a countdown, and an ageing population.

Acceptance criteria:

- `hero.statement` differs from the shipped string in all five locale documents, and no locale
  contains its shipped promise construction — the per-locale banned list is
  `es: "pensión que te espera"`, `en: "pension that waits for you"`,
  `fr: "retraite qui vous attend"`, `de: "Rente, die dich erwartet"`,
  `it: "pensione che ti aspetta"`.
- Each locale's statement contains that locale's `countryName` (preserved `AC-002-22`,
  `AC-001-103`), and `validateDocument` returns no `scope-statement` problem for any document.
- Each locale's statement length is `<= HERO_STATEMENT_BUDGETS[locale]` (preserved
  `AC-002-23`); the budget numbers themselves are unchanged.
- Each locale's statement matches none of `/[.!?;:]/` (preserved `AC-002-25`).
- No locale's statement contains a digit (preserved `AC-002-26`: `hero.*` carries no
  quantity), and none names an institution from `AC-002-26`'s list.
- The Spanish statement matches `/(?<!\p{L})(te|tú|tu|ti|contigo)(?!\p{L})/iu` — the page keeps
  addressing the reader (preserved `AC-002-25`).
- Each locale's statement contains at least one marker from the T1 tables below, for ageing
  **and** for the countdown. These are properties, not a frozen paragraph.

| locale | ageing markers | countdown markers |
|---|---|---|
| es | `envejec`, `mayores`, `edad` | `cuenta atrás`, `faltan`, `te quedan`, `días` |
| en | `ageing`, `aging`, `older`, `age` | `countdown`, `days`, `remaining`, `left` |
| fr | `vieillis`, `âgé`, `age` | `compte à rebours`, `jours`, `restants` |
| de | `alter`, `älter`, `alterung` | `countdown`, `tage`, `zählt` |
| it | `invecchi`, `anzian`, `età` | `conto alla rovescia`, `giorni` |

- The `<h1>` is still rendered by `NumberStep` above the clock, still the page's only `<h1>`, and
  still inside `[data-top-step="number"]` (preserved `AC-004-08`).
- `hero.statement` is still what the share card's proposition renders (`web/seo/share-card.tsx`)
  and it still differs per locale — no two locales share a proposition.
- The sub-line stops making the same promise: `hero.sub` contains none of
  `es: "cuánto"`, `en: "how much"`, `fr: "combien"`, `de: "wie viel"`, `it: "quanto"`, still
  carries no digit and no institution (`AC-002-26`), no `!` and no em-dash, and still splits into
  at most two sentences (`AC-002-25`). **Defaulted** — see open question 1; if the human gate
  rejects it, this bullet and `AC-005-05` go together.

## T2 — Step 1's sentence names the proportion

`steps.number.sentence` today says the older population reaches "the share the next step
explains" — a circular sentence that postpones the number. It is replaced by one sentence that
names the proportion in the same breath as the date.

Acceptance criteria:

- `steps.number.sentence` differs from the shipped string in all five locales, and none of them
  contains a forward reference to the page's own structure: no locale contains the phrase
  `paso siguiente`, `siguiente paso`, `next step`, `l'étape suivante`, `étape suivante`,
  `nächste Schritt`, `nächsten Schritt`, `passo successivo`, `prossimo passo`.
- The template's placeholder set is exactly `{date}`, `{threshold}`, `{base}` — no extra
  placeholder and no dropped one.
- `NumberStep` resolves `{threshold}` from `COUNTDOWN_THRESHOLD` and `{base}` from the same
  value `BreakageStep` uses (`BASE = 100`); both are read from one definition, not retyped in
  the component or in the locale documents. A test proves the two components render the same
  two numerals.
- The rendered sentence contains the threshold numeral (`50`) and the base numeral (`100`), the
  age-band numerals `65`, `15` and `64`, and the formatted anchor date produced by
  `formatDate(countdown.anchor, locale, CLOCK_TIME_ZONE)`.
- The sentence renders inside step 1's single `<p class="step__sentence">`, and step 1's visible
  text is still the number group, one sentence and the step label (preserved `AC-004-07`).
- The formatted anchor date still occurs exactly once inside the five steps' visible text, and
  that occurrence is in step 1 (preserved `AC-004-29`).
- The `50`-and-`100` statement is carried by step 1 and step 2 and by no other step: the set of
  steps whose visible text contains both numerals is exactly `['number', 'breakage']`. **This
  supersedes `AC-004-11`**, which asserted step 2 was the sole carrier — see T8.
- The sentence passes the plain-language gate: none of `BANNED_TOP_TERMS` and none of
  `internalTermsOf(figures, series)` occurs in it, in any locale.
- The sentence keeps the factual register: no second-person form from `AC-002-28`'s per-locale
  table, no `!`, and none of that rule's urgency set (`bomba`, `explota`, `solo`, `apenas`,
  `urgente`, `inminente`). `faltan`, `quedan` and `cuenta atrás` stay allowed: they are how the
  sentence says "these days remain", and the shipped sentence already uses them — `AC-002-28`'s
  fuller list governs `countdown.*`, which this spec does not touch.
- The test call sites that build the expected string — `tests/acceptance/story-steps.test.ts`
  and `tests/acceptance/countdown-band.test.ts` — pass all three variables the component
  resolves. The criteria those tests carry are unchanged; only the call signature moves.

## T3 — Step 1 stops being the tightest box

Step 1 is the page's most important box and the only one with less air than its neighbours:
`.step--number { padding-block: var(--space-6) }` (32 px) against `.step { padding-block:
var(--space-8) }` (64 px). The box gets at least as much air as any other step, and the three
things inside it — headline, clock, sentence — are separated enough to read as three.

Acceptance criteria:

- Structural: resolving `globals.css` against `tokens.css`, the `padding-block` of
  `.step--number` is greater than or equal to the `padding-block` of every other selector that
  declares one and matches a `[data-top-step]` section (today `.step` = `var(--space-8)` and
  `.step--distance` = `var(--space-7)`). The comparison is computed from the parsed
  declarations and the token values, not from a hard-coded expectation.
- Rendered: in a real Chromium, for every locale, the computed `padding-block-start` and
  `padding-block-end` of `[data-top-step="number"]` are each `>=` the same computed longhand of
  every other `[data-top-step]` element present on the page.
- Rendered: in a real Chromium, for every locale, at 390×844 and at 1440×900, the vertical gap
  between the `<h1>`'s bounding box and `.clock`'s bounding box is `>= 24` px, and the vertical
  gap between `.clock`'s bounding box and `.step__sentence`'s bounding box is `>= 24` px. Both
  bounds are `--space-5` resolved from `tokens.css`, not a literal in the test.
- The extra air does not break the one-screen bound: step 1's height is still `<=` the viewport
  at 390×844, 1366×768 and 1440×900, in all five locales (preserved `AC-004-60`, `AC-004-61`).
- The air is spent with tokens only: no new literal length appears in the rules this task
  touches — every `padding`/`margin`/`gap` resolves a `var(--…)` token (preserved
  `AC-001-118`).
- Step 1 keeps its ground and its separator conventions: `.step--number` still declares
  `background: var(--surface-hero)`, still declares no `border-top`, and no rule gains a
  `--surface-2` background (preserved `AC-001-118`).
- No colour, type, radius or shadow token changes value; `--space-*` tokens keep their values
  (preserved `AC-004-64`, `AC-004-65`, `AC-004-66`).

## T4 — The mechanism, as a checkable fact, in the facts register

The page never says how a pension is paid. It says so now, in the facts register — "Lo que no
se discute" — with its figure and its source, as two claims. Nothing here is a prophecy and
nothing here takes a side in the documented dispute.

Acceptance criteria:

- In each locale, `editorial.agreement` gains exactly two claims, and the array's length is the
  same in all five locales and is exactly `4` at the end of this spec (2 shipped + 2 new).
- Claim A states the pay-as-you-go mechanism: it contains the locale's contribution marker from
  the T4 table below **and** the locale's present-day marker, and its `citationId` is exactly
  `ss-estadisticas-pensiones` — the record that already states this sentence in
  `editorial.disputes`.
- Claim B states that each employed person now supports more beneficiaries than before: it
  contains the locale's employed-person marker, and it contains exactly two numerals, which are
  the two numerals the rendered `fig-01` plate publishes for its first and latest observed
  periods — character for character, after locale formatting. No other digit appears in claim B.
- Neither claim asserts that contributions cover the whole pension bill: no locale's two claims
  contain a coverage/sufficiency formulation from the T4 banned list (`suficiente`,
  `cubre todo`, `enough`, `covers the whole`, `suffit`, `deckt`, `basta`).
- `editorial.disputes` is unchanged in all five locales: its per-locale digest equals the
  shipped digest recorded in `20-acceptance/AC-005-mechanism-fact.md`. The mechanism must not be
  promoted into a fact while the page still documents it as disputed.
- Every agreement claim resolves: `resolveClaims(content.editorial.agreement, citationRegistry)`
  returns as many entries as `editorial.agreement` has, in all five locales — no new claim is
  silently dropped for an unresolvable citation.
- Each new claim's resolved citation has a `url`; claim B's citation URL host is `ec.europa.eu`
  (the host of the committed `fig-01` manifest's `sourceUrl` entries). If no existing citation
  record carries that source, exactly one record may be added to
  `web/content/data/citations.json` pointing at a URL the committed `fig-01` manifest already
  declares — and no other change to that file.
- Neither claim contains an age-cohort word from the T4 cohort list (`65`, `mayores`, `older`,
  `âgé`, `ältere`, `anziani`): the fact register states the mechanism, not who is to blame.
- Neither claim contains a thesis term: `thesisVocabularyOutsideThesis` returns `[]` for every
  locale (preserved `AC-001-41`).
- No new figure and no new series: `FIGURE_IDS` still has 7 entries, every file under
  `data/derived/` and `data/snapshots/` is byte-identical to the shipped one, and no new
  computed value is introduced anywhere.

| locale | contribution marker | present-day marker | employed-person marker |
|---|---|---|---|
| es | `cotizacion`, `cotizan`, `cotizaciones` | `hoy` | `ocupad`, `afiliad`, `trabaja` |
| en | `contribution` | `today`, `now` | `employed`, `worker`, `affiliated` |
| fr | `cotisation` | `aujourd'hui`, `aujourd` | `occupé`, `salarié`, `travaill` |
| de | `beitrag`, `beiträge` | `heute` | `beschäftigt`, `erwerbstätig`, `arbeit` |
| it | `contribut`, `contribuzion` | `oggi` | `occupat`, `lavorator`, `lavora` |

## T5 — The intergenerational judgement, in the opinion register

The intergenerational reading the page has never stated is stated once, in "Nuestra lectura",
labelled as the page's reading rather than as a measurement.

Acceptance criteria:

- In each locale, exactly one string among `editorial.thesis.statement` and
  `editorial.thesis.paragraphs` carries the reading, identified by the T5 marker test: it
  contains a marker for the people who work today **and** a marker for the people who will work
  later, in that locale's table. Exactly one match, not zero and not two.
- The reading renders inside `[data-register="thesis"]`, in document order after
  `thesis.disclaimer`, and inside the section whose heading is `thesis.label` (preserved
  `AC-001-43`).
- The reading carries no citation: `[data-register="thesis"]` contains no `class="citation"`
  element and no `citation__chip` (asserted by `AC-005-30`). The opinion is not dressed as a
  measurement.
- The reading does not assert that older people failed to contribute: it contains none of
  `no cotizaron`, `no han cotizado`, `did not contribute`, `never contributed`,
  `n'ont pas cotisé`, `nicht eingezahlt`, `non hanno contribuito`.
- The reading does not state the mechanism as its premise in the facts register's words: the
  agreement claims' texts do not occur inside `[data-register="thesis"]`, and the reading's text
  does not occur inside `[data-register="agreement"]`.
- The thesis keeps its disclaimer, its label, its signature and its figure links: the rendered
  section still contains `thesis__disclaimer`, `thesis.label`, `signatureName` and
  `signatureRole` (preserved `AC-001-43`).
- The vocabulary boundary still holds: `thesisVocabularyLocations(editorial)` returns at least
  one hit and `thesisVocabularyOutsideThesis(strings, editorial)` returns `[]`, in all five
  locales (preserved `AC-001-41`).
- The reading is not in the story: its text does not occur between `<main` and the
  `class="story__strip"` marker (preserved `AC-003-46`).

| locale | today's workers | tomorrow's workers |
|---|---|---|
| es | `hoy` | `mañana`, `futur`, `vienen`, `próxim` |
| en | `today`, `now` | `tomorrow`, `future`, `next generation`, `coming` |
| fr | `aujourd'hui`, `aujourd` | `demain`, `futur`, `prochaine génération`, `à venir` |
| de | `heute` | `morgen`, `zukunft`, `nächste generation`, `kommend` |
| it | `oggi` | `domani`, `futuro`, `prossima generazione`, `a venire` |

## T6 — The three registers stay separate, checkably

The informal spec's register note is the reason T4 and T5 are two tasks, not one paragraph. The
separation becomes an assertion, not a review habit.

Acceptance criteria:

- The two mechanism claims' rendered text occurs inside `[data-register="agreement"]` and
  nowhere else on the page: not in `[data-top-step]`, not in `[data-register="thesis"]`, not in
  `[data-register="dispute"]`. Asserted by locating each claim's text once, then comparing its
  offsets against the region boundaries.
- The intergenerational reading's rendered text occurs inside `[data-register="thesis"]` and
  nowhere else on the page.
- Every `.claim` block inside `[data-register="agreement"]` contains exactly one
  `citation__chip`; the thesis section contains none.
- The page still renders the three registers as three sections carrying
  `data-register="agreement"`, `"dispute"` and `"thesis"`, in that order, after `#debate`
  (preserved `AC-001-43`).
- The register key's heading count still matches the four rendered register rows, and
  `REGISTER_ROWS` is unchanged (preserved `AC-001-91`).
- No `.claim` or thesis text is marked `data-operator="true"`, and nothing in T4/T5 is routed
  through an operator-only surface.

## T7 — Five locales, parity

Acceptance criteria:

- All five documents (`es`, `en`, `fr`, `de`, `it`) carry every change in T1, T2, T4 and T5;
  none carries a change another does not.
- Each changed string is written in its own locale's language, not copied Spanish:
  pairwise, the five `hero.statement` values differ; the five `steps.number.sentence` templates
  differ outside their placeholders; the five claim A texts differ; the five readings differ.
- Structural parity of the editorial data: `editorial.agreement.length` is identical across the
  five locales, and `editorial.thesis.paragraphs.length` is identical across the five locales.
- Placeholder parity: every locale's `steps.number.sentence` carries the same placeholder set
  (`{date}`, `{threshold}`, `{base}`); no locale drops one or adds one.
- `REQUIRED_KEYS` is unchanged and every locale document carries exactly that key set:
  `missingKeys` returns `[]` and `unknownKeys` returns `[]` for each (preserved `AC-004-69`,
  `AC-004-70`).
- The five public routes still prerender and each document's `<html lang>` matches its locale
  (preserved `AC-004-72`).

## T8 — Supersede the two pinned-copy criteria and keep the rest

Two inherited criteria pin copy this spec deliberately changes. Both are named here, with the
scenario that carries their substance forward. Nothing else is retired.

**Superseded**

| id | shipped substance | why it cannot stand | carried by |
|---|---|---|---|
| `AC-004-11` | the `50`/`100` statement appears exactly once at the top, in step 2 | the informal spec requires step 1's sentence to name the proportion | `AC-005-10` |
| `AC-002-26` (editorial-digest clause only) | `sha256(JSON.stringify(editorial)).slice(0,16)` is frozen for all five locales | T4 and T5 add claims and a paragraph to `editorial` in every locale | `AC-005-37` |

`AC-002-26`'s other clauses — no digit, no institution, no source in any rewritten `hero.*`
string — are **preserved** and bind T1. Its `countdown.clock.*` and `fig.*` digests are
**preserved unchanged**: this spec touches neither namespace.

Acceptance criteria:

- No test cites `AC-004-11` as a live assertion. `tests/acceptance/story-steps.test.ts`'s
  carrier assertion is rewritten to expect `['number', 'breakage']` under `AC-005-10`, and the
  id `AC-004-11` appears in no test file afterwards.
- `tests/acceptance/hero-copy.test.ts` recomputes the five editorial digests for the shipped
  documents, and the values in `EXPECTED` equal `sha256(JSON.stringify(document.editorial))
  .slice(0, 16)` for each locale; the surrounding comment names spec 005 as the reason they
  moved. The `countdown.clock.` and `fig.` digests are unchanged.
- No criterion other than the two above is retired: `retired-criteria.test.ts`'s `RETIRED` list
  is unchanged, its `AC-004-76` count of 79 `AC-004-*` scenarios still holds, and every id in
  spec 004 T17's preserved set still has at least one passing test.
- `AC-004-07`, `AC-004-08`, `AC-004-29`, `AC-004-60`, `AC-004-61`, `AC-004-69`, `AC-004-70`,
  `AC-004-72`, `AC-001-41`, `AC-001-43`, `AC-001-91`, `AC-001-118`, `AC-002-22`, `AC-002-23`,
  `AC-002-25`, `AC-002-26`, `AC-002-27` all still have a passing test that cites them.
- Scenario traceability is green: `scripts/check-scenario-traceability.sh` exits 0, every
  `AC-005-*` id is cited by a test, every citation resolves, and no retired id is cited.
- No gate is lowered to make any of this pass: `HERO_STATEMENT_BUDGETS` keeps its five values,
  the complexity threshold stays 6, and no coverage or mutation threshold moves (preserved
  `AC-002-27`, `AC-004-79`).

---

## Scenario index

Thirty-nine scenarios, `AC-005-01` … `AC-005-39`, in `20-acceptance/` (one file per task).

| Task | File | Scenarios |
|---|---|---|
| T1 | `AC-005-headline.md` | 01–05 |
| T2 | `AC-005-number-sentence.md` | 06–11 |
| T3 | `AC-005-step-air.md` | 12–16 |
| T4 | `AC-005-mechanism-fact.md` | 17–22 |
| T5 | `AC-005-intergenerational-reading.md` | 23–27 |
| T6 | `AC-005-register-separation.md` | 28–31 |
| T7 | `AC-005-locale-parity.md` | 32–35 |
| T8 | `AC-005-criteria-supersession.md` | 36–39 |

---

## Open questions

None of these blocks `/build`: each carries a stated default that satisfies every constraint in
`00-informal.md`. Each should be confirmed at the human gate.

1. **Does `hero.sub` move with the headline?** The informal spec's defect 1 names only
   `hero.statement`, but the sub-line sits directly under it and repeats the same unanswered
   promise ("Cuánto, cuándo y con qué fórmula"). **Default taken:** it moves too, under T1's last
   bullet, because leaving it is the same lie one line lower and the user's complaint quotes the
   whole hero block. Rejecting this drops one bullet and one scenario (`AC-005-05`) and
   nothing else.
2. **The separation threshold for "reads as three things".** The informal spec states the
   property, not a number. **Default taken:** `--space-5` (24 px), one rung above the 16 px the
   sentence has today and the scale's existing "gap between distinct things" rung (`--clock-gap`
   already uses it). Measured, not asserted from CSS.
3. **One mechanism claim or two?** The mechanism has two facts with two sources (contributions
   finance contributory pensions; beneficiaries per employed person rose). **Default taken:** two
   claims, one citation each, so no claim cites a record that does not support it.
4. **The marker tables in T1, T2, T4 and T5 are copy contracts.** They are written as
   properties (a word must be present) rather than as verbatim paragraphs, but the word lists
   are still a judgement. **Default taken:** the lists above, generous enough to allow several
   phrasings and narrow enough to catch a headline that names neither ageing nor the countdown.
   Confirm or amend them at the gate.
5. **Where the mechanism is visible.** The informal spec routes it to the facts register, which
   renders below the fold (after `#metodo`). **Default taken:** follow the decision as written.
   A later spec may surface it nearer the top; that would be a new decision, not this one.
6. **Step 5's sentence.** Defect 4 reads as if a step should state the consequence, but step 5
   already states one and the informal spec's four asks route the fix to the two registers.
   **Default taken:** `steps.meaning.sentence` is unchanged by this spec and is listed as out of
   scope below.

## Out of scope

- Any pension amount, replacement rate, expected pension, or "you will get X" claim — spec 006.
- Computing any of `fig-03`…`fig-07`; any new figure, series, formula or derived artefact.
- Changing what the countdown counts to (1 January 2042), its anchor, its variants or its range.
- Re-composing the five steps, changing `TOP_STEPS`, or moving any section.
- Changing `steps.meaning.sentence`, `steps.breakage.sentence`, `steps.distance.sentence`,
  `steps.why.annotation.*`, `fig.*`, `countdown.*` or `countdown.clock.*`.
- Changing the visual register: palette, type scale, rules, radii, shadows, `--space-*` values.
- Changing `editorial.disputes`, the citation set beyond the single record T4 allows, or the
  admin surface.
- Adding a language, or translating to fewer than five.
