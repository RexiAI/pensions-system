# AC-002: Rewrite the assertions that encode the old layout

Tests that encode "the years numeral is a separate projection block above the clock
rail, behind a 1px rule" — the decision this spec reverts — are rewritten to assert the
new structure, with their IDs preserved and the change recorded in the PR body
(`docs/TESTING.md` §Tests That Encode a Defect). These are authorized edits, not
relaxations, and each re-points the check to the invariant it actually protects rather
than deleting it.

## AC-002-15 — AC-001-119 asserts the new structure, no longer the 1px rule
Given `tests/acceptance/clock.test.ts`
And the test `AC-001-119: the projection group and the clock rail are separated by a 1px rule`
When the test body is read
Then it no longer asserts `border-top: var(--border-hair)` as the separator
And it no longer asserts the years numeral and the day count are never in one group
(`expect(block.slice(yearsNumeralAt, railAt)).not.toContain('clock__fields')`)
And it now asserts the years numeral and the day count are in one typographic group
And the scenario ID `AC-001-119` is preserved in the test name

## AC-002-16 — AC-001-111 keeps the centring invariant; the face list is reviewed, not churned
Given `tests/acceptance/clock.test.ts`
And the centring describe block (`AC-001-111`)
When the face-element list and structural assertions are read
Then the centring invariant is not relaxed: the face is a centred grid (not a flex row),
no left-aligning declaration is present, and prose still centres inside `--measure-face`
And the `FACE_ELEMENTS` list may legitimately stay unchanged — the merge keeps every
class (`countdown__value`, `countdown__numeral`, `countdown__unit` and the clock classes
all still render, only their container changes)
And if a class does leave or join the face, only that class is removed or added
And if the list is left untouched, the commit body says so (a reviewed-and-unchanged list
and a forgotten list look identical in a diff)
And the scenario ID `AC-001-111` is preserved

## AC-002-17 — AC-001-99 keeps its invariant while the years numeral relocates
Given `tests/acceptance/countdown.test.ts`
And the test `AC-001-99: both integers are printed beside the number…`
When the test body is read
Then it no longer locates `countdown__value` inside a slice that ends at `class="clock"`
(the years numeral is no longer in the projection block above the rail)
And it still asserts the years quantity carries no sub-annual unit
(`día`, `dias`, `días`, `mes`, `meses`, `hora`, `horas`, `minuto`, `minutos`, `segundo`),
wherever the years numeral now renders
And the scenario ID `AC-001-99` is preserved

## AC-002-29 — AC-001-111's hairline assertion is re-pointed to the surviving span
Given `tests/acceptance/clock.test.ts`
And the test `AC-001-111: the threshold rule and the rail hairline still span the whole face`
When the test body is read
Then it no longer asserts `declared('.clock', 'border-top')` equals `var(--border-hair)`
And it still asserts the threshold rule spans the face
(`justify-self: stretch` and `height: var(--rule-projection)` on `.countdown__rule`)
And it still asserts the rail spans the face by `justify-self: stretch` on `.clock` —
the span is carried by the grid stretch, not by the removed hairline
And the check is not replaced with a weaker "still spans" claim that is now false
And the scenario ID `AC-001-111` is preserved

## AC-002-30 — AC-001-107's hairline proxy is re-pointed to a surviving declaration
Given `tests/acceptance/first-viewport.test.ts`
And the test `AC-001-107: nothing on the way is shrunk or hidden to make room`
When the test body is read
Then it no longer asserts `CSS.slice(CSS.indexOf('.clock {')).toContain('var(--border-hair)')`
And it still asserts the clock is declared at its own type scale in the desktop sheet and
is not overridden at the mobile breakpoint (no `display: none`, no `font-size`, no `.clock`
in the mobile query)
And the `var(--border-hair)` proxy is re-pointed to a declaration of `.clock` that still
exists after the separator is removed — never deleted outright
And the scenario ID `AC-001-107` is preserved
