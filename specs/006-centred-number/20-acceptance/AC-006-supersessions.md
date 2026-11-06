# AC-006: Record the supersessions and keep every frozen criterion green

Task 7. Revisions 2 and 3 touch 35 criteria across specs 001–005: 15 retired and 20 re-pointed, all
named in `10-tasks.md` §4. This file asserts that the record is *performed* — the lists, the citations and
the inverted clauses — not merely written down.

## AC-006-15 — AC-001-118's ground clause is inverted, not deleted

Given the suite that carries AC-001-118
When its "four non-colour surfaces of P3 F3 and F5 are migrated" test runs
Then its ground assertion requires that `.step--number` does not paint `var(--surface-hero)`
And its `border-top` negative, its `var(--surface-2)` negative and its display-scale declarations are unchanged
And a test still cites `AC-001-118`, and it is still in the preserved list, not the retired one.

## AC-006-16 — AC-005-16's ground clause is inverted, and its hash clause is superseded

Given the suite that carries AC-005-16
When its three tests run
Then the ground assertion requires that `.step--number` does not contain `background: var(--surface-hero)`
And the "every spacing declaration resolves a token" test is unchanged
And the "token file is byte-identical" test is **replaced** by AC-006-18's declared-change-set test, because the palette decision changes the file
And a test still cites `AC-005-16`.

## AC-006-17 — AC-004-77's rationale names this spec; its assertions are unchanged

Given the "centring measure is no longer a fold pin" test
When it runs
Then it still asserts that the stylesheet contains no `var(--measure-face)` and that the token is still `17.5rem`
And its comment names spec 006 as the reason step 1 is composed on a centred axis again
And it still asserts that the 001–003 centred-face geometry has not returned.

## AC-006-18 — The token file's change set is the declared one

Given `web/styles/tokens.css`
When every token name is classified as unchanged, revalued, retired or added
Then every revalued token is a colour token — surface, ink, rule, accent, on-accent, `data-*`, `chart-*`
And every retired token is `--surface-hero`, and nothing resolves it
And no type token, no `--space-*` value, no `font-*`, no `radius`, no `shadow` and no `--measure` changes value
And no new token is added, so the change set is a revaluation plus one retirement and nothing else.

## AC-006-19 — The touched rules add no motion

Given the rules for the header chrome, step 1 and the clock-free number group
When their declarations are read, and the served page's computed styles are read for the same subtrees
Then no rule declares `transition`, `animation` or `@keyframes`
And no element inside the header or step 1 computes a `transition-duration` greater than 0s
And no element inside the header or step 1 computes an `animation-name` other than `none`.

## AC-006-20 — The touched rules add no colour literal

Given the rules added or changed by Tasks 1 to 13
When every paint declaration in them is read — `color`, `background`, `background-color`, `border`, `border-*-color`, `fill`, `stroke`, `outline`, `outline-color` and `box-shadow`
Then each value resolves `var(--…)`, or is `none`, `transparent` or `0`
And the stylesheet gains no new hex, `rgb(`, `hsl(` or `lab(` literal in any of those properties
And the shorter property list is not used, because it would let a `fill` or a `box-shadow` carry a literal the criterion claims does not exist.

## AC-006-21 — Every scenario is cited, every retirement is performed, nothing is skipped

Given the 37 scenarios declared in `20-acceptance/` and the 35 criteria revisions 2 and 3 touch
When the traceability gate and the retirement lists are read
Then no `AC-006` id is untested and none is unknown
And the 15 ids of §4.1 are in `RETIRED_SCENARIOS` and in `retired-criteria.test.ts`'s `RETIRED`, which now holds 39 entries, not 24
And `AC-001-111`, `AC-001-112`, `AC-003-04` and `AC-003-07` are no longer in `PRESERVED`, which now holds 21
And no test cites a retired id, and every one of the 20 re-pointed ids still has a citation
And the two clause-level re-points, AC-003-02 and AC-003-03, are re-pointed in place: their ids stay cited, and the clauses they lose (`min-inline-size: var(--clock-days-min)` and `.countdown__numeral`'s `--text-num-l`) appear in no test
And the two paint-channel re-points, AC-002-31 and AC-003-22, keep their ids and their citations while their assertions invert: no rule fills with the accent, and the fuse's burnt segment is an ink
And AC-006-26's inventory finds no token aliasing the accent except `--focus`: `--chart-series-1` and `--chart-observed` resolve to an ink, and `--focus` is used only by a `:focus-visible` rule
And every id whose carrier file was deleted — AC-001-101, AC-001-110, AC-001-115, AC-002-13, AC-002-14 — is cited verbatim in a surviving test
And no test under `tests/` is skipped, focused or marked todo.
