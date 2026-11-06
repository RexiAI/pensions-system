# AC-006: Give Von Restorff one winner

Task 5. "Painted ground" and "rendered text leaf" are defined in `10-tasks.md` §2.1, §2.3 and §2.8.
Only tokens that already exist may be used as *names*; the accent's value is revalued by Task 9.

**Revised in revision 2.** AC-006-11 was inverted: revision 1 forbade the accent above the fold,
revision 2 requires it exactly once, on the numeral — one distinct thing, and it is the number.

## AC-006-10 — No element above the fold paints a competing ground

Given the served page at each of the five locales and each of the three viewports
And the count before this spec: 2 painted grounds above the fold at 1366×768 and 1440×900, and 1 at 390×844
When every element above the fold with a non-transparent background is compared with the nearest painted ancestor's background
And every border of 2 px or more and every `box-shadow` other than `none` is inventoried alongside it
Then no element has a distinct background with a painted box of at least 32×32 px
And no element paints a border of 2 px or more, or a `box-shadow`, that is distinct from its ground, because a thick border is the same competing rectangle by another channel
And a 1 px hairline is excluded by the width floor: the rule is not counted as a ground
And `html` and `body` are excluded from the count
And step 1's `--surface-hero` band is one of the elements that no longer paints
And the current locale cell no longer paints its `--ink-1` chip.

## AC-006-11 — Exactly one text leaf carries the accent, and it is the numeral

Given the served page at each of the five locales and each of the three viewports
And the baseline before this spec: six accent-coloured text leaves at 1440, six at 390, and the current locale cell's surface-coloured text
When every rendered text leaf above the fold has its computed `color` read
Then exactly one leaf resolves to `--accent`, and it is the day numeral
And every other leaf resolves to `--ink-1`, `--ink-2` or `--ink-3`
And no leaf resolves to a surface colour
And the accent is not repeated in a second element above the fold, which is the informal spec's "not twice" clause.

## AC-006-12 — The numeral is the only **text** above the fold at its size

Given the served page at each of the five locales and each of the three viewports
When every rendered text leaf above the fold has its computed `font-size` read
Then the day numeral is the largest text leaf above the fold
And exactly one text leaf computes that size
And that size is strictly greater than the `<h1>`'s, 80 against 64 at 1366×768 and 1440×900, 44 against 40 at 390×844
And the numeral is therefore distinguished by both hue and size, while every other element is distinguished by neither.

## AC-006-13 — The current locale is still marked, without a ground or a colour

Given the served page at 1366×768 or 1440×900, where the five locale cells render
When the five cells are compared with each other
Then exactly one carries `aria-current="page"`
And its computed `background-color` equals its four siblings'
And its computed `font-weight` or `text-decoration-line` differs from theirs
And no `border-*-color` differs from its four siblings', so the marker cannot migrate into a border that neither this criterion nor the ground count would see
And the difference is therefore not carried by colour alone (WCAG 1.4.1).
