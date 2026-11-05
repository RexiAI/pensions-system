# Design Spec: 005-pension-warning

## Design Read

Reading this as: a public-interest data essay for a general resident of Spain, in a warm-paper
instrument register that spec 004 already fixed, leaning toward no third-party design system at
all (house tokens, one display face, one mono for measurements, hairlines, zero radius, zero
motion); this spec moves words and air inside an existing composition, and composes nothing.

Every number below is measured, not inferred: `web/styles/tokens.css` for token values, and the
built page (`npm run build` + `next start`) in headless Chromium over CDP, 2026-11-05, five
locales at 390×844, 1366×768 and 1440×900. Where a figure is a projection rather than a
measurement it is labelled as one.

## Dial Values

- DESIGN_VARIANCE: 3. The composition is fixed by spec 004 (five steps, one axis, no `order`, no
  `grid-area`). This spec may not re-compose it, and the brief's audience (a resident reading
  about their own pension) is the `trust-first / public-sector / regulated` row of the skill's
  dial table, which presets 3. Any variance spent now would be variance spent against the
  monotonic reading order the page exists to protect.
- MOTION_INTENSITY: 0. Not the preset's 2-3, because the page has no transitions of any kind
  today and this spec adds none. The clock's seconds tick because the value changes, not because
  a transition plays; `prefers-reduced-motion: reduce` deletes the sub-day fields entirely
  (`globals.css:1502-1506`) rather than freezing them. Zero is a decision here, not an omission.
- VISUAL_DENSITY: 5. The surface is a document: a 64ch measure, plates with provenance strips,
  three registers, and numerals doing the work a chart would do elsewhere. Dense enough to be
  citable, airy enough that the one-screen-per-step bound still holds (measured: every step's
  height is currently under its viewport in all five locales).

## Design System / Foundation

No install command: there is no design system to add. The foundation is the house token layer
(`web/styles/tokens.css`, 207 lines, `--radius: 0`, `--shadow: none`) driven by Tailwind v4 for
reset and utilities only. Adding a component library here would be a second dialect in a page
whose entire argument is that it is one instrument.

Two pre-existing departures from the skill's preflight, recorded so they are not mistaken for
omissions of this spec, and not re-opened by it: (1) the page ships six hand-drawn 16px glyphs
(`web/components/Icon.tsx`) rather than an icon library, a spec 001 decision with six use sites;
(2) `--font-serif` is EB Garamond, used by exactly one rule (`.thesis__statement`). This spec
touches neither.

## Global Tokens

- Font: `--font-sans` Instrument Sans (body, labels via `--font-label`), `--font-mono` IBM Plex
  Mono (every measurement), `--font-serif` EB Garamond italic (`.thesis__statement` only). Weights
  are not added by this spec; no rule it touches sets `font-weight`.
- Accent color: `#3b5512` olive (`--accent`; dark `#91c46d`). Job on this page: the primary CTA's
  material and link text. This spec puts no accent anywhere: not on a claim, not on a numeral, not
  on a rule.
- Neutral base: warm paper ladder `--surface-1 #fdf2e1`, `--surface-2 #f6ead7`,
  `--surface-3 #f0e1c9`, hero panel `--surface-hero #fee8d0`; ink `--ink-1 #1e160d`,
  `--ink-2 #47392a`, `--ink-3 #645341`; rules `--rule-1 #d6c8b7`, `--rule-2 #b9a892`.
- Corner-radius system: sharp. `--radius: 0`, `--shadow: none`, no rule in this spec adds either.
- Theme: auto. `[data-theme='dark']` carries its own surface and ink ladder (tokens.css 190-207)
  and the header ships a toggle. Every pair this spec adds text to is measured in both ladders
  below.
- Icon library: none added. No icon appears on any surface this spec touches (headline, sentence,
  two registers, one padding rule).

## Design Laws

Measured baselines these rows rely on, all from the built page at 1440×900 unless stated:
`.step--number` padding 32px/32px; `.step` 64px; `.step--distance` 48px at 390 and 64px at 1366+;
h1→label 16.00px, label→clock 8.00px, clock→sentence 16.00px; h1 64px/65.28, day count
80px/81.6, `.step__sentence` 19px/30.78, `.step__label` 12px in a 19.44px line box; `.claim p`
16px/25.92; claim-to-claim gap 0.00px; `.citation__chip` (`<summary>`) 31.05px tall; `.register`
margin 96px; registers start at y=7553 (agreement), 7834 (dispute), 8294 (thesis).

| Task | Law | Applies to | Concrete consequence | How a reviewer checks it |
|---|---|---|---|---|
| T1 | Gestalt / Prägnanz | the `<h1>` | one sentence, no punctuation, no digit; it reads as one statement, not a headline plus a deck | `validateDocument` returns no `scope-statement`/`statement-budget` problem; statement matches no `/[.!?;:]/` and no `/\d/` |
| T1 | Von Restorff | first paint | the h1 stays the page's only `--text-display` element and gains no second accent; the number, not the headline, remains the single distinct mark | `grep -c 'text-display' web/styles/globals.css` unchanged (1); `.hero__title` computed font-size 40px at 390 and 64px at 1366+ |
| T1 | Hick's | first paint | the headline adds no choice: no link, no CTA, no disclosure inside step 1 | count `a, button, summary` inside `[data-top-step="number"]` in the rendered HTML = 0 |
| T1 | Jakob's | headline convention | declarative headline over a standfirst sentence is the newspaper convention the page already uses; a reader pays no learning cost | the DOM order stays h1 → step label → clock → sentence (AC-005-04) |
| T2 | Miller's | the sentence's numerals | the copy must chunk five numerals into two relations: `50` per `100` as one ratio phrase, `65` and `15`-`64` as one band pair, so the reader holds three chunks not six | read the es sentence: the ratio is stated as one "por cada" phrase and the two age bands as one paired range; AC-005-06 still finds all five numerals |
| T2 | Gestalt / Proximity | sentence vs clock | the sentence is one text node with the date inside it, not a caption row under the clock | AC-005-06: the date, `50` and `100` are in one text-node sequence, no second paragraph |
| T2 | Von Restorff | sentence | it stays at `--text-body-lg`; it must not be promoted to `--text-h2` to compensate for the headline change | `.step__sentence` computed font-size reads 19px (unchanged) in the built page |
| T3 | Gestalt / Proximity | h1 / label / clock / sentence | rhythm 32 / 8 / 24: glue inside the measurement group is `--space-2` (8px), the h1 separates at `--space-6` (32px), the sentence at `--space-5` (24px); each boundary is 3x or 4x the glue, and the two boundaries differ from each other | `getComputedStyle` gaps: h1→label 32px, label→clock 8px, clock→sentence 24px, per locale, at 390 and 1440 (AC-005-14 measures the 24px floor) |
| T3 | Gestalt / Common Region | `[data-top-step="number"]` | the ground panel is the region; its padding must not be the reason the region reads tight, so it takes the same rung the other steps take (`--space-8`, 64px) instead of a rung of its own | computed `padding-block-start/end` of step 1 = 64px/64px, and no other `[data-top-step]` computes above it (AC-005-12, AC-005-13) |
| T3 | Fitts's | step 1's interior | no target is added or moved; the box grows only vertically, so no hit area changes | step 1 contains zero interactive elements before and after (same check as T1's Hick row) |
| T4 | Miller's | `editorial.agreement` 2 → 4 | four facts must still read as four: each new claim is one sentence, at most 2 text lines at 1440 and 3 at 390 (measured shipped claim: 82.86px = 2 lines + chip at 1440; 129.81px = 3 lines + chip at 390) | measure `.claim` block heights at both viewports; a fifth line means the claim is a paragraph, not a fact |
| T4 | Gestalt / Proximity | claim-to-claim grouping | the four claims must read as four units, which needs a non-zero gap; measured 0.00px between `.claim` blocks today, so the fix (`.claim + .claim { margin-block-start: var(--space-5) }`) is recorded as a finding, not implemented in a spec that authorises one spacing rule | measure the vertical gap between consecutive `.claim` bounding boxes in the built page; 0.00px means the finding is still open |
| T4 | Von Restorff | the facts register | the register must not become the page's second loud element: no statement size, no accent, no own ground, numerals inline in a sentence | `.claim p` font-size 16px and `.register--agreement` background rgb(253,242,225) both unchanged from the shipped measurement; no rule in the diff sets `font-size` or `background` for a claim |
| T4 | Serial Position | the four claims | the two shipped claims keep positions 1 and 2; the mechanism claims are appended as 3 and 4, so the numeral-carrying claim B is the last thing read before the dispute register | rendered `.claim` order equals `editorial.agreement` order, shipped texts at indexes 0 and 1 |
| T4 | Tesler's | citation access | the page absorbs the lookup: the chip opens the record in place, the URL is a full-size link inside the panel, the reader is never sent away to check a fact | `.citation` is a `<details>` whose `.citation__panel` contains the `<a href>` for the source |
| T4 | Doherty | chip disclosure | toggling a chip is local state with no round trip, so it must settle inside the 400ms budget with no spinner or skeleton | no `fetch`, no `loading`, no `aria-busy` in `CitationChip.tsx`; toggling is instantaneous |
| T4 | Jakob's | fact-register convention | sourced claim plus a disclosure chip is the dominant fact-check pattern; the page's three-register order is already established | three `[data-register]` sections in the order agreement, dispute, thesis after `#debate` (AC-005-31) |
| T5 | Serial Position | the reading's placement | the reading is the last paragraph of `thesis.paragraphs`, read immediately before the signature: recency at the end of the argument, after the paragraph that licenses it | reading offset is after every shipped paragraph's offset and before `thesis__signature` in document order |
| T5 | Peak-End | the debate region | the region ends on the reading and then its attribution; administrative lines (figure links) do not come between the claim and who makes it | document order inside `[data-register="thesis"]`: disclaimer, statement, prose paragraphs (reading last), signature, figures |
| T5 | Von Restorff | the opinion register | the register keeps exactly one type-voice departure: the serif italic statement. The reading does not enter that slot, so the register does not gain a second accent | `.thesis__statement` still the only `--font-serif` rule; the reading renders as `.thesis__prose p` at 16px sans |
| T5 | Gestalt / Prägnanz | the reading | one paragraph, no bold, no heading, no bullet; a reading that needs emphasis to land is not a reading | the reading's rendered markup is one `<p>` inside `.thesis__prose`; no `<strong>`/`<em>` rule is added |
| T6 | Gestalt / Common Region | the three registers | separation is carried by common region, not by spacing: agreement sits on the page ground with no rule (measured rgb(253,242,225), zero marks), dispute is `--surface-2` bounded by two hairlines (rgb(246,234,215)), thesis is `--surface-3` with the page's heaviest line (`4px solid rgb(30,22,13)`, `--border-register`) | read the three computed `background-color`/`border-*` values in the built page; they are three distinct ladder steps and three distinct rule weights |
| T6 | Jakob's | opinion versus measurement | the page marks opinion more heavily than fact because fact is self-carrying (each claim holds its own source); the reader's expectation is that the marked block is the contested one | the chip count per register: 1 per `.claim` in agreement, 1 per `.dossier__position` in dispute, 0 in thesis (AC-005-30) |
| T6 | Prägnanz | each register | each register keeps exactly one mark and gains none: no new ground, no new border, no callout box | diff contains no `background`, `border`, `box-shadow` or `--accent` declaration on a register selector |
| T7 | Jakob's | locale typography | German is the longest and must not break a line box or a target: no `white-space: nowrap`, no fixed block-size, no truncation in any rule touched | German h1 today measures 3 lines (122.39px) at 390 and 2 (130.53px) at 1440; after T1 it must stay inside the same one-screen budget |
| T7 | Von Restorff | locale parity | no locale gets a different type treatment to fit; the fix for a long German string is the copy, never the scale | `--text-*` values identical across locales; only `hero.statement` length differs |

**Deliberate violations** (reason + compensating control):

- **Miller's Law, in step 1's sentence.** Five numerals (`50`, `100`, `65`, `15`, `64`) and a date
  in one sentence exceeds a 4-chunk working set. Departed deliberately because AC-005-06 requires
  all of them in one text-node sequence: splitting them into a caption row or a second paragraph
  is exactly the "the number is explained by the next step" defect this spec removes. The winner
  is Gestalt/Prägnanz (one sentence naming one proportion) over Miller's chunk ceiling. What pays
  the cost: the copy must present them as two relations (a ratio and a band pair), and the day
  count above already gives the reader the one number they came for, so the sentence is read as
  supporting detail rather than as the page's primary quantity.
- **Fitts's Law, on the citation chip.** The chip is a `<summary>` and measures 31.05px tall at
  1440 (52.09px only when its label wraps at 390), under the page's own `--tap-min: 44px`. T4 adds
  two more of them and this spec does not enlarge them: raising each chip to 44px would make it
  taller than the 51.84px of text it cites, turning four facts into four buttons and destroying
  the register's prose genre. The winner is the register's typographic register (Von Restorff /
  Prägnanz) over the 44px floor for this one element. Compensating controls: the deviation is
  shipped, not introduced (measured pre-existing); the source URL inside the panel is a normal
  link target; and the recommended one-line fix (`min-block-size: var(--tap-min)` on
  `.citation__chip`) is recorded for a later spec rather than smuggled into this one, whose scope
  is copy plus one spacing rule.

**Judged inapplicable for this spec** (roll-up of the per-task exclusions stated in each
directive below, so omissions are visible):

- **Zeigarnik / Goal-Gradient**: the page has no multi-step flow, no progress affordance and no
  completion state; the five steps are a reading order, not a task.
- **Parkinson's / Flow**: nothing is operated here; there is no task whose pacing an interruption
  could break. The only clock is the subject of the page, not a progress indicator.
- **Choice Overload**: no option set anywhere: the reader chooses a locale and a theme, both
  outside this spec's surfaces.
- **Aesthetic-Usability**: not cited, and explicitly not used as cover for either recorded defect
  (the 31.05px chip, the 0.00px claim gap). A page that looks like an instrument does not get to
  skip tap targets or paragraph separation.
- **Pareto**: a fixed five-step editorial composition has no long tail to trim; every section
  carries a distinct claim.
- **Occam**: satisfied rather than excluded: this spec adds zero tokens, zero components, zero
  rules beyond three declared spacing values, and zero strings beyond the copy the tasks name.

## Per-Task Directives

### Task 1: The headline says what the page measures

- Layout: Editorial Manifesto Hero, instrument variant (Section 10 vocabulary: large type, no
  asset, almost poster) inside the existing ground panel. Nothing moves.
- Components: `NumberStep` → `TopStepSection` → `h1.hero__title`. No component change; the string
  changes in five documents. `hero.sub` (see Watch items) is metadata, not a visible sub-line.
- Typography: unchanged by design. `--text-display` = 40px/40.8 at 390 and 64px/65.28 at 1366+
  (measured), `--tracking-display` -0.026em, `--leading-tight` 1.02. Copy constraints that follow
  from the measured column: 42 characters (es) at 40px is 2 lines in a 343px column today, and
  German's 39 characters are already 3 lines; a 55-character German headline costs a fourth line,
  +40.8px, which T3's measured headroom absorbs. Two hard limits bind the copy, neither of them
  negotiable: the per-locale budgets (es 42, de 55, en 46, fr 52, it 50, unchanged) and the
  inherited at-most-two-line-boxes property at 1280. That property is currently recorded in
  `content-locale.test.ts`'s `MEASURED` table, whose recorded line widths (533+535 for Spanish)
  sum past the 667px column the same table names, so the table is stale and must be re-measured
  per locale against the built page rather than trusted as a character budget.
- Motion: static.
- A11y: `--ink-1` on `--surface-hero` measures 15.03:1 light, and the dark ladder keeps ink-1 at
  full strength on `#201406`. One `<h1>`, unchanged. No `text-overflow`, `line-clamp` or
  `nowrap` may be added to make a longer headline fit (the existing criterion bans them).
- Design-law consequences: Prägnanz, Von Restorff, Hick's, Jakob's (rows T1). The headline names
  the countdown and the ageing; it does not promise a pension, and it does not become a second
  accent.
- Laws judged inapplicable for this task: Fitts's (no target is added, moved or resized),
  Miller's (one sentence, no list to chunk), Doherty (static copy, no request or state
  change), Tesler's (the headline names; the sentence below does the explaining).
- Anti-patterns to avoid: a colon-subtitle construction (the page bans `:` in `hero.*`); a
  question ("¿Te quedarás sin pensión?"); a number in the headline (banned, and it would compete
  with the clock); a second person in the *sentence* spilling over from the headline's `te`
  (the sentence's register criterion bans second person, the headline's requires it in Spanish);
  the shipped promise construction in any language.
- Watch items: **`hero.sub` is not a visible sub-line.** Measured: it renders only in
  `web/seo/metadata.ts` (and only when `thresholdYear === null`, which is false in production,
  where `meta.description` is used instead). T1's defaulted bullet and AC-005-05's last clause
  ("`hero.sub` still renders on the page") therefore have nothing visible to assert. The copy
  change is still right (no field should promise an amount), but the task's stated rationale
  ("the sub-line sits directly under it") is measurably wrong and the scenario needs re-pointing
  at the metadata surface before the Coder writes a test that cannot fail honestly. Second watch:
  `content-locale.test.ts`'s `MEASURED` table pins each shipped statement's character count and
  line widths at 1280px; a new headline invalidates it and it must be re-measured, not deleted.

### Task 2: Step 1's sentence names the proportion

- Layout: unchanged position: one `<p class="step__sentence">` directly under the clock, inside
  the ground panel, `max-inline-size: var(--measure)`.
- Components: `NumberStep`'s `NumberBody` resolves `{date}`, `{threshold}`, `{base}`. No new
  component, no new element.
- Typography: `--text-body-lg` 19px / `--leading-body` 30.78 (measured), unchanged. At 390 the
  column is 343px and one line is 30.78px: today's German sentence is 5 lines (153.83px) and
  Spanish 4 (123.06px). The rewrite may spend up to one more line at 390 without touching the
  one-screen bound (arithmetic in T3).
- Motion: static.
- A11y: `--ink-2` on `--surface-hero` measures 9.36:1. The five numerals must be reachable by a
  screen reader in the sentence's own text (no `aria-label` substitution), and the clock keeps its
  own accessible name carrying the date (attribute, not text node, so the date still occurs once
  as visible text).
- Design-law consequences: Miller's (deliberate violation, see above), Proximity, Von Restorff,
  and Tesler's: the sentence is where the system absorbs "what does the ratio mean", instead of
  leaving the reader to infer it from step 2.
- Laws judged inapplicable for this task: Fitts's (no target), Hick's (no choice), Doherty
  (static text), Jakob's (a sentence that states a proportion copies no convention and needs
  none).
- Anti-patterns to avoid: a forward reference to the page's own structure (the shipped defect);
  a tabular 2-column "50 / 100" block: that is a chart in a sentence's slot, and it would make
  step 1 carry two measurements; a second-person form (banned by the register criterion); any
  urgency word on the banned list.
- Watch items: the sentence is the page's densest string and the plain-language gate scans it
  (`scanTopRegion` covers `<main>` up to `story__strip`), while the *registers* are outside that
  scan; do not assume T4/T5 copy is gate-checked. Also: `steps.number.sentence` must not contain
  a literal `50` or `100` (placeholders only), and the numerals must match step 2's rendering
  character for character, including a locale's decimal and grouping separators.

### Task 3: Step 1 stops being the tightest box

- Layout: same box, more air. This is the one rule set this spec changes.
- Components: none.
- Typography: none (no font-size, no line-height, no weight touch).
- Motion: static.
- A11y: none of the three changes moves a focus target; the panel gains 88px of height in total,
  all of it between text blocks. Reduced-motion users already see fewer clock fields, which makes
  the panel shorter, never taller.
- Design-law consequences: Proximity and Common Region (rows T3). **The measured answer to the
  open question: 64 / 32 / 8 / 24.**
  - `.step--number { padding-block: var(--space-8) }` = **64px**, up from the measured 32px. Equal
    to `.step` (64px) and to `.step--distance` at ≥768px (64px), above `.step--distance` at 390px
    (48px). Equality is the right target, not 96px: the panel's prominence is already carried by
    `--surface-hero`, the page's only large warm ground (tokens.css 139-141), and a special
    padding rung would make padding a second, competing emphasis device.
  - `.hero__title { margin-bottom: var(--space-6) }` = **32px**, up from 16px. The step label sits
    between the headline and the clock, so the headline's own margin is the only knob that can
    hold that label off the headline; at 16px the label is 2x closer to the clock (8px) than to
    the headline, which is a weak grouping.
  - `.step__label { margin-bottom: var(--space-2) }` = **8px**, unchanged. This is the glue that
    makes "El número" a caption of the measurement rather than a floating line.
  - `.step__sentence { margin-top: var(--space-5) }` = **24px**, up from 16px. This is the floor
    AC-005-14 sets, and it is the scale's existing "gap between distinct things" rung
    (`--clock-gap: var(--space-5)`, tokens.css 32). Not `--space-6`: 32 / 8 / 32 would read as a
    card's symmetric padding rather than a document's rhythm, and would spend 8px of the
    one-screen budget for nothing.
  - Resulting rhythm 32 / 8 / 24: the glue is the smallest rung in use, both boundaries are 3x
    and 4x it, and the two boundaries differ from each other so the block reads as three things
    rather than as a stack of equal gaps.
- Laws judged inapplicable for this task: Hick's (no choice), Miller's (no items to group),
  Jakob's (spacing copies no convention and the box keeps its place), Doherty (no feedback
  surface), Tesler's (nothing is absorbed or exposed by air).
- Anti-patterns to avoid: reaching for `--space-9` (96px) to make the panel "feel important" (it
  spends the one-screen budget in the German mobile case); setting `gap` on a flex wrapper instead
  of the three declared margins (it changes the label's grouping rather than the boundaries); any
  literal length (`padding-block: 64px`) instead of a token; a `border-top` appearing on step 1 to
  "close" the box.
- Watch items: the copy in T1 and T2 still has to fit. Measured projection after these three
  changes: de@390 goes from 584.17px to 672.17px (+88), leaving 171.8px of viewport headroom, i.e.
  about 5 extra sentence lines (30.78px) or 4 extra headline lines (40.8px); en/fr@390 land at
  641.41px, es at 600.61px, it at 672.17px; de@1366 lands at 624.73px against a 768px viewport.
  The one-screen criterion measures the section's height against the viewport, so a fifth sentence
  line and a fourth headline line together (743.75px) still pass, and a sixth sentence line at
  390 is the point where German starts to bind. Second watch: AC-005-12/13 compare *computed*
  padding, so `--space-8` ties with `.step` rather than exceeding it; an assertion written as
  "strictly greater" would fail a correct implementation.

### Task 4: The mechanism, as a checkable fact, in the facts register

- Layout: the existing register list, on the page ground with no rule and no inset (measured
  background rgb(253,242,225) = `--surface-1`, `margin: 96px 0`). Two claims appended.
- Components: `AgreementSection` → `.claim` → `<p>` + `CitationChip`. No new component, no new
  content key, no new class.
- Typography: `.claim p` at 16px / 25.92px (measured), `--measure` 64ch cap, unchanged. Claim
  A and claim B are ordinary body sentences: the mechanism is not set in `--text-h2`, not in mono,
  and its numerals are not isolated on a line.
- Motion: static.
- A11y: `--ink-1` on `--surface-1` measures 16.13:1 light and 16.11:1 dark. Each new claim keeps
  exactly one chip so the pattern "a fact carries a source" stays complete (an unethipped claim
  would read as an aside). Chip target caveat: see the Fitts violation above.
- Design-law consequences: Miller's (one sentence, ≤2 lines at 1440), Von Restorff (no second
  loud element), Serial Position (append, do not reorder), Tesler's and Doherty (the chip absorbs
  the lookup locally and settles instantly), Jakob's (sourced-claim convention).
- Laws judged inapplicable for this task: Hick's (a chip discloses a source for a fact already
  stated; it is not an option the reader must choose between).
- Anti-patterns to avoid: a pull-quote or bolded lead clause introducing the two claims (that is
  the banner this design question exists to refuse); a percentage or a derived "18% more" (it
  would be a third numeral, and AC-005-19 allows exactly two); writing the periods 2009 and 2024
  as digits (two more numerals, banned by the same criterion: say "hace quince años" or omit);
  naming the cohort (the fact register states the mechanism, not who is to blame); opening with
  an imperative.
- Watch items: **the facts register currently has no item separation at all.** Measured: claim to
  claim gap is 0.00px, and the thesis paragraphs are also 0.00px apart, because `.claim` has no
  rule and `.claim p` computes `margin: 0`. With two claims that reads as one paragraph of prose;
  with four it reads as a wall, and Miller's chunking argument cannot survive a 0px gap. The
  minimum fix is one declaration, `.claim + .claim { margin-block-start: var(--space-5) }`, but it
  is a second spacing rule and this spec authorises one, so it is reported here as a finding for
  the human gate rather than slipped into the implementation. Second watch: claim B must contain
  exactly two numerals, so any ordinal, year or count in the sentence has to be a word.

### Task 5: The intergenerational judgement, in the opinion register

- Layout: `[data-register="thesis"]`, unchanged: `--surface-3` ground, `4px solid rgb(30,22,13)`
  left rule, 32px padding, 96px margins. The reading is the **last** entry of
  `editorial.thesis.paragraphs`, appended after the shipped two.
- Components: `ThesisSection` → `.thesis__prose > p`. No new component; `thesis.statement`,
  `signatureName`, `signatureRole` and `figureLinks` are untouched.
- Typography: 16px sans (`.thesis__prose p`, inherited), not the serif italic
  `--font-serif` statement (measured 24px at 390 and 34px at 1440, line-height 38.88 and 55.08
  respectively). This is the
  decision, stated: the reading is a paragraph and not the statement, because the register already
  spends its one type-voice departure on `thesis__statement`, and because the reading is a
  conclusion that must come *after* the mechanism paragraph and after the paragraph that says the
  page is not accusing anyone.
- Motion: static.
- A11y: `--ink-1` on `--surface-3` measures 13.88:1 light, 13.64:1 dark; the disclaimer above it
  at `--ink-2` measures 8.65:1. The reading carries no citation chip, by criterion and by design:
  the absence of the chip is how a sighted reader and a screen-reader user alike learn that this
  block is not a measurement.
- Design-law consequences: Serial Position and Peak-End (last paragraph before the signature),
  Von Restorff (the register keeps one accent), Prägnanz (one paragraph, no emphasis).
- Laws judged inapplicable for this task: Fitts's (no target), Hick's (no choice), Miller's
  (one paragraph), Doherty (static text).
- Anti-patterns to avoid: a pull-quote, an italic run, or a "quote" wrapper to make the reading
  feel like an epigraph (it would be a second serif accent, and it would read as a quotation from
  someone rather than as the page's own voice); the facts register's sentences restated as the
  premise (banned by criterion); "los mayores" as a subject of blame (the page may name a cohort
  only as beneficiaries, never as culprits); any numeral that the page does not already publish.
- Watch items: exactly one candidate string may match the marker test, and the shipped Spanish
  paragraph 1 already contains "hoy" (German "heute") with no future marker, so the new paragraph
  must be the *only* one carrying both halves. If a translator reaches for "hoy en día" in the
  shipped paragraph or "Zukunft" in the statement while editing, the marker test goes to two
  matches and AC-005-23 fails for a reason that looks like a copy edit. Check all five locales'
  whole `thesis` object, not just the new string.

### Task 6: The three registers stay separate, checkably

- Layout: unchanged. Agreement is flush prose; dispute is a two-column dossier in a hairline band;
  thesis is a marked block. Separated by 96px margins between registers (measured).
- Components: `RegisterKey`, `AgreementSection`, `DisputeSection`, `ThesisSection`. None changes.
- Typography: unchanged. The three voices are already three: sans body for claims, sans body plus
  blockquote-and-cite for the dossier, serif italic statement over sans prose for the thesis.
- Motion: static.
- A11y: separation must not rest on colour alone, and it does not: rule weight and the presence or
  absence of the citation chip differ too, both perceivable without colour vision.
- Design-law consequences: Common Region, Jakob's, Prägnanz (rows T6). **This is the answer to
  the second design question: nothing needs to be added.** What makes opinion legible as a
  different kind of thing from a measurement is four devices already in the page, each measurable:
  (1) the ground ladder, `--surface-1` / `--surface-2` / `--surface-3` (rgb(253,242,225),
  rgb(246,234,215), rgb(240,225,201)); (2) the rule ladder, no rule on facts, two hairlines on the
  dispute, `4px solid rgb(30,22,13)` on the thesis, which is the heaviest line on the page;
  (3) the voice ladder, sans 16px / sans 16px with `blockquote` / EB Garamond italic 24-34px over
  sans prose; (4) the structural tell, one `citation__chip` per fact position and zero in the
  thesis. Markedness increases as certainty decreases, which is the correct direction: a fact is
  self-carrying because it holds its source, and the page's own reading must be unmistakable
  precisely because it holds none.
- Laws judged inapplicable for this task: Fitts's (no target), Hick's (no choice added),
  Miller's (no new list), Doherty (static), Tesler's (the registers absorb nothing new here;
  the separation is already carried).
- Anti-patterns to avoid: a callout box, a coloured panel, an italic run, a bold lead-in or a
  "Nota" ribbon to mark the opinion (each is a fifth device competing with the four that work);
  promoting the reading to `--text-h2`; giving the thesis register a chip "for symmetry"; adding
  a ground to the agreement register so the three sections look alike (that would erase the
  ladder's meaning by making fact and dispute indistinguishable).
- Watch items: AC-005-28's occurrence counting needs each claim's text to be unique in the
  document. Short generic Spanish claims ("Las pensiones se pagan con las cotizaciones") can also
  appear inside the dispute dossier's quotes, so the copy should carry a distinguishing clause
  rather than a bare generalisation.

### Task 7: Five locales, parity

- Layout: no locale-specific layout. German's longer strings change line counts, never structure.
- Components: none.
- Typography: no per-locale type sizes. The one typographic risk is the headline: German spends
  its 55-character budget in a 343px column at 40px, where today's 39 characters already cost
  three lines (122.39px). Four lines is affordable inside T3's measured headroom; five is not.
- Motion: static.
- A11y: `hyphens: auto` and `overflow-wrap: break-word` are set at the root and must survive; no
  rule this spec touches may add `white-space: nowrap`, a fixed `block-size`, or `text-overflow`.
- Design-law consequences: Jakob's and Von Restorff (rows T7). Parity is a typographic property
  here: the same rungs, the same measure, the same numeral sizes, five different strings.
- Laws judged inapplicable for this task: Fitts's (no target), Hick's (no choice), Miller's
  (no list), Doherty (static), Tesler's (no complexity absorbed), Gestalt (no grouping
  decision: every locale keeps the same rhythm).
- Anti-patterns to avoid: shortening a German sentence by dropping the mechanism (the translation
  is not the place to reduce the claim); a per-locale font-size or letter-spacing override to make
  a long headline fit; translating the Spanish marker words into another language as cognates to
  satisfy a test instead of writing the sentence in that language.
- Watch items: French and German are the two longest in this page's measurements (French headline
  is 2 lines at 1440, German 3 lines at 390), so measure those two first; the five `hero.statement`
  values must differ pairwise, which rules out a shared template with a swapped country name.

### Task 8: Supersede the two pinned-copy criteria and keep the rest

- Layout: none. No visual surface.
- Components: none.
- Typography: none. This is the constraint the task carries: retiring `AC-004-11` and the
  editorial-digest clause of `AC-002-26` must not move a token, a rule or a rendered property.
- Motion: none.
- A11y: none.
- Design-law consequences: none applicable (no law is cited for this task; the exclusion is
  stated in the next bullet).
- Laws judged inapplicable for this task: all seven core laws, because this task has no
  frontend surface: it retires two criteria and re-bases five digests.
- Anti-patterns to avoid: re-recording a digest by hand-editing the expected value without
  recomputing it from the document; deleting an inherited assertion that still holds; widening
  `HERO_STATEMENT_BUDGETS` or the complexity threshold to accommodate longer copy.
- Watch items: the editorial digests move for all five locales by design, and only the
  `countdown.clock.*` and `fig.*` digests may stay put. The `retired-criteria.test.ts` `RETIRED`
  list must keep its shipped contents, so this task retires two criteria without adding an entry
  to that list, which is a distinction the Coder must implement deliberately rather than by
  pattern-matching the existing test.

## Out-of-scope tasks

- **T8** has no frontend surface (test bookkeeping: criterion supersession and digest re-basing).
  It is listed above so its design consequences are explicitly nil rather than omitted.
- Not a task, but a scope boundary worth recording: the citation chip's 31.05px target, the
  facts register's 0.00px claim gap, and `hero.sub`'s non-rendering are three measured defects
  this spec reports and does not fix. Each needs its own authorisation; two of them are one
  declaration each.
