# AC-006: A neutral palette with one accent

Task 9. The accent's budget (AC-006-26), the one exempt state (AC-006-36) and the fuse's de-accented
pair (AC-006-37) are here because the palette task owns them. Chroma, hue and contrast are computed
with the project's existing helper,
`tests/helpers/colour.ts` (`chroma()`, `hue()`, `contrast()`); the minimums and the pair-table shape
follow the convention `palette-labels.test.ts` already uses (`10-tasks.md` §2.11–2.12).

## AC-006-24 — Exactly one chromatic token, and it is a deep red

Given the light and dark token blocks
When every public token that resolves to a **single colour** — surfaces, inks, rules, accent, on-accent, `data-*`, `chart-*` — is measured with `chroma()` and `hue()`
And the gradient and paint-shorthand tokens (`--chart-hatch`, `--dash-projection`, `--focus`) are excluded because they are not single colours and `chroma()` cannot read them
Then exactly one distinct chromatic value appears among them, the accent's, with a chroma greater than 20
And every other resolved value has a chroma of at most 10, in both themes
And the count is of resolved values, not of names, so an alias of the accent such as `--chart-series-1` is not a second colour
And `--accent`'s CIELCh hue lies within 40° of 0°, i.e. between 340° and 40°
And `--data-projection` and `--data-deficit`, chromatic before this spec at amber and rust, are no longer chromatic
And the number of chromatic public values is one, not "one accent plus two data hues that do not count"
And `--state-pending` and `--state-danger` are **excluded from the count on both sides**: they are admin-only (the admin surface is out of scope) and they are chromatic today, so including them would fail a correct public palette.

## AC-006-25 — Every real pair meets its minimum, measured

Given the pair table of `{foreground, ground, minimum}` rows
And the table is the **full matrix** over the surviving surfaces — every text ink crossed with every surface token, plus the accent on every surface, plus `--on-accent` on the accent while the admin primary button paints it — not a hand-picked subset
When each row is evaluated with `contrast()` on the declared hexes, in both themes
Then `--ink-1` on every surface is at least 7:1
And `--ink-2`, `--ink-3`, `--accent` and `--on-accent` reach at least 4.5:1 on the surfaces they actually paint
And the non-text series strokes reach at least 3:1
And no row's minimum is lower than the same row carried before this spec
And `--on-accent` on `--accent` keeps the 7:1 design target it held
And a row is dropped only when neither theme paints that pair anywhere, and the drop is recorded — a row that is dropped because it fails is the defect this criterion exists to catch
And the primary action's new pair, `--surface-1` on `--ink-1`, is a row and clears AAA.

## AC-006-26 — The accent is spent once on the page, counted on every channel

Given the served page at each of the five locales and each of the three viewports, and the stylesheet
And "painted" means the channel's own visibility switch is on: a `background-color` with alpha above zero, a `border-*-color` whose `border-*-style` is not `none` and whose width is above zero, an `outline-color` whose `outline-style` is not `none`, a `fill` or `stroke` that is not `none` on a rendered SVG element, the colours inside a `box-shadow` that is not `none`, and a `color` on an element that carries a text node
When every painted use of the accent value is inventoried over **every rendered element of the whole page**, and every declaration inside a rule with a selector whose value resolves to the accent value is inventoried over the whole sheet
And the sheet half excludes declarations scoped to a focus pseudo-class, which AC-006-36 owns
And the sheet half excludes admin-scoped selectors — the project's own list, `ADMIN_PREFIXES` in `palette-labels.test.ts`: `.operator-bar`, `.admin-`, `.status-chip`, `.config-closed`. `.admin-btn` fills with the accent today and never renders on the public page, so counting it would make the criterion fail on a surface this spec does not touch
Then exactly one painted use resolves to the accent, and it is the day numeral's `color`
And exactly one resting rule declares it, and it is that same numeral rule
And the paints that carried the accent when this spec began no longer do: the primary action's `background`, the fuse's burnt `fill`, and the chart series aliases (`--chart-series-1`, `--chart-observed`) — the chart aliases are already neutral in the working tree, while the primary action's fill and the fuse's burnt segment are the two the Coder could not change without turning AC-002-31 and AC-003-22 red. The criterion keeps the finished ones finished rather than assuming a completed state stays completed
And the focus ring is the only other bearer, it is a state rather than a resting paint, and AC-006-36 bounds that exclusion
And both halves are asserted, because they see different things: an element can resolve the accent through an alias no rule names, and a rule can declare it while nothing on the page renders.

## AC-006-36 — The focus ring is a state, and its exclusion is bounded

Given the served page at rest, and again with an interactive element focused through `:focus-visible`
When the accent-bearing paints are inventoried in both states
Then at rest no element paints an outline at all, so no resting outline carries the accent
And the ring appears only on the focused element, and disappears when focus leaves
And exactly one rule in the sheet uses `--focus`, and it is scoped to `:focus-visible`
And the ring reaches at least 3:1 against the ground it is drawn on, in both themes
And `outline-offset: var(--focus-offset)` puts the ring outside a filled control: the accent measures 1.71:1 light and 2.15:1 dark against `--ink-1`, so a ring drawn inside the primary action's new ink fill would fail 3:1 and the offset is what prevents it
And the exclusion is therefore a *state* exclusion, not a paint exclusion: the accent is still spent once at rest.

## AC-006-37 — The fuse's burnt segment reads after de-accenting

Given the fuse in step 4, in both themes
When the burnt segment's and the cord's computed fills are read and their contrast computed
Then the burnt segment resolves to `--ink-1` and the cord to `--ink-3`, and neither resolves to the accent
And the burnt/cord pair reaches at least 3:1 in light and at least 2.5:1 in dark — 3.11 / 2.57 as shipped, from 1.82 / 1.19 while the neutral accent still filled the burnt segment (1.14 / 1.51 was the retired olive palette's pair)
And the fuse's value is still carried by the burnt length and its label, so the pair is a redundant cue rather than the encoding
And the fuse renders inside step 4 and not step 1, which is AC-003-22's re-pointed second clause — the clock subtree it used to be measured against does not exist.
