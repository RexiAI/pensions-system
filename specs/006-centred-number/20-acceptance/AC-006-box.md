# AC-006: Remove the box

Task 8. The story paints no rectangle behind its content. Measured on the served page with the
contract in `10-tasks.md` §2, at the five locales by three viewports matrix.

## AC-006-22 — No story step paints a ground

Given the served page at each of the five locales and each of the three viewports
And before this spec, step 1 painted a 1176 × 559 panel of `rgb(254,232,208)` whose top edge sat at y = 64 px, exactly on the header's bottom edge
When every `[data-top-step]` element's computed background, border and shadow are read
Then no step's `background-color` is anything other than `transparent` or the page's own ground
And step 1 declares no border on any side and a `box-shadow` of `none`
And step 1's first text ink starts at least 32 px (`--space-6`) below the header's bottom edge
And the hairline between adjacent steps is still present, so the five steps remain distinct from one another.

## AC-006-23 — The two retired peach values cannot return

Given `web/styles/tokens.css` and `web/styles/globals.css`
When every declaration in both files is scanned
Then no declaration carries the value `#fee8d0` (light) or `#201406` (dark)
And no rule resolves `var(--surface-hero)`
And no rule outside the token file declares a colour literal
And this criterion is deliberately narrow: it retires two literals, and a *different* warm tint is caught by AC-006-24's neutral bound rather than by a string search for the peach.
