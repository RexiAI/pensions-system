# AC-001: The anchored clock (the countdown's live reading)

## AC-001-108 — The anchor is derived from the threshold year, never authored
Given a derived `thresholdYear` from the countdown computation (T18)
When the clock's anchor is computed
Then `anchor` equals the ISO instant `{thresholdYear}-01-01T00:00:00+01:00` (the threshold year's
  first instant, fixed `+01:00` for Europe/Madrid)
And changing the threshold parameter changes the anchor (the year and the anchor move together)
And no component or content file contains a hand-typed anchor date; the anchor string is assembled
  from `thresholdYear`, never authored as a literal `2042`

## AC-001-109 — The disclosure is unconditional in every state where the clock renders
Given the clock renders (the `computed` state)
When the clock block is rendered in each of `es`, `en`, `fr`, `de`, `it`
Then the output contains the anchor date (`countdown.clock.anchor`) and its label
  (`countdown.clock.anchorLabel`, "fecha convencional del umbral")
And both render as visible text in the clock block, outside any `<details>`, `title` attribute, or tooltip
And the output contains `countdown.clock.definition`, a sentence stating the threshold year is a
  projection and not a calculated date

## AC-001-110 — No clock renders without a threshold year
Given the countdown resolves to `not-crossed`, `unavailable`, or `withheld`
When the countdown block renders
Then no day, hour, minute, or second field renders and no anchor renders (no clock)
And for `not-crossed` the fixed sentence renders instead (AC-001-101)
And for `unavailable` / `withheld` the whole block is absent and the hero falls back to the figure
  ladder (AC-001-101 / T18)

## AC-001-111 — Without JavaScript the server-rendered clock is complete and correct
Given JavaScript is disabled in the browser
When the countdown block's HTML is inspected
Then the four fields (days, hours, minutes, seconds), the anchor line, and the definition are all
  present in the server-rendered HTML, computed from the render instant
And no element on the page displays a sub-day value (hours, minutes, seconds) without a day value
  beside it
And no part of the disclosure depends on client script

## AC-001-112 — Reduced motion shows the static value and creates no tick
Given the user prefers reduced motion (`prefers-reduced-motion: reduce`)
When the clock mounts
Then no interval is created at all
And the three sub-day fields (hours, minutes, seconds) are not displayed (`display: none`)
And the day count, the anchor line, and the definition still render

## AC-001-113 — The accessible tree is stable and the animated region is hidden
Given the clock renders
When the accessible tree is inspected
Then the hours, minutes, and seconds fields are each wrapped in `aria-hidden="true"`
And the clock group carries no `aria-live`, no `role="timer"`, no `aria-atomic`, and no `aria-busy`
And the day count and the anchor line are exposed (the day field is not `aria-hidden`)
And the clock group carries the `countdown.clock.a11y` label naming the anchor and that it is a
  conventional date
And the accessible tree is identical in the motion and reduced-motion modes (the same content is
  hidden from assistive technology in both)

## AC-001-114 — Exactly one timer, cleared correctly, with no layout shift
Given the clock mounts with motion enabled
When the timer runs
Then exactly one `setInterval` exists per page
And the interval is cleared on unmount
And the interval is cleared while `document.visibilityState === 'hidden'` and restarted on `visible`
And a `59 → 00` transition on the seconds field causes no layout shift (CLS contribution is 0)

## AC-001-115 — The elapsed state means the date passed, and nothing more
Given the current time is after the anchor instant (`{thresholdYear}-01-01T00:00:00+01:00`)
When the clock renders
Then all four fields render `0`
And no timer runs
And `countdown.clock.definition` is replaced by `countdown.clock.elapsed`
  ("La fecha convencional del umbral ha pasado.")
And no string in the clock subtree states or implies the threshold has been crossed
And no string implies the projection was validated: the elapsed copy states only that the date has
  passed, and the projection group above continues to state whatever the data says

## AC-001-116 — The clock is confined to the instrument register
Given the clock renders
When its rendered subtree and string sources are inspected
Then the subtree resolves only `--ink-*` and `--data-projection` tokens
And the subtree carries no `--data-deficit`, no `--state-danger`, no `--state-pending`, no
  `--surface-3`, no serif family, and no 4px ink rule
And no string in the subtree resolves from the `thesis.*` namespace (every clock string resolves
  from `countdown.clock.*`)
And the clock appears in no other block, and not in the share card, `og:*`, or the meta description
And the clock is the only continuous (ticking) element on the page

## AC-001-119 — The two reference instants are disclosed
Given the countdown's projection group and the clock rail both render
When the clock block is rendered in each locale
Then the output contains `countdown.clock.arithmetic`, a sentence stating that the years figure is
  the difference of two year numbers (`thresholdYear − snapshotYear`, e.g. 2042 − 2026) while the
  days figure is elapsed time counted to the anchor date (`1 de enero de 2042`)
And the two quantities are stated to derive from different instants (year arithmetic versus date
  arithmetic), so a reader is not invited to divide one by the other
And the projection group and the clock rail are separated by a `1px --rule-1`, so the years numeral
  and the day count are never in the same typographic group
