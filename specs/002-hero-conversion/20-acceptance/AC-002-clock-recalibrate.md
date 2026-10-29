# AC-002: Re-measure the unified clock and recalibrate the fold tokens

The unified block is a different height, so the first-viewport guarantee is re-verified
against the real, built app in Chromium — never by eye — and the tokens plus the
measurement table are updated with the new figures.

## AC-002-18 — The fold tokens are recalibrated from real Chromium measurement
Given the built app (`npm run build`, then `next start`)
When `getBoundingClientRect()` of `.clock` is measured in Chromium at 390×844, in all
five locales
Then `--measure-face`, `--clock-sub-col`, and `--clock-days-min` in `web/styles/tokens.css`
are set to values under which the clock's bottom edge is at or above `viewport height − 50px`
at 390×844 in every one of the five locales
And the per-locale clearance table is recorded, so a future regression in any locale is
visible rather than averaged away

> Corrected 2026-10-29. The clause this replaces — "no locale is worse than the Spanish
> baseline" — was written from a false premise: the shipped Revision-4 record already had
> `fr 35.5` against `es 54.9`, so the guarantee was never satisfiable and never true.
> Measured under spec 002 at 390×844: `es/en/de/it` 75.92px clearance, `fr` 56.48px — one
> extra `--text-micro` line in French's projection block above the clock, not a
> clock-height difference (the clock is 343.17px in all five). The correction is dated so
> a later reader cannot mistake it for the clause having always said this.

## AC-002-19 — The measurement table in `first-viewport.test.ts` is updated
Given `tests/acceptance/first-viewport.test.ts`
When it is read
Then the `MEASURED_CLOCK` table carries the newly measured `clock` and `fields` ranges
for 390×844
And the 360×640 and 1366×768 rows are re-measured or re-recorded as "recorded, not
asserted" rows, with the same honesty about the fold
And the `--measure-face` comment in `tokens.css` records the new measured clearance
table with the measurement date

## AC-002-20 — The first-viewport guarantee still holds in every locale
Given the recalibrated tokens and the updated measurement table
When the AC-001-107 assertions run against the new figures
Then at 390×844 the clock box bottom is at or above the fold in all five locales
And the clock rail starts inside the first viewport and its four-field row is fully
inside it in every locale

## AC-002-21 — The clearance margin is measurement-driven, not relaxed
Given the change to the three fold tokens and the measurement table
When the AC-001-107 assertions are read
Then the "whole clock box inside the first viewport" check is unchanged
And the `clock[1] ≤ viewport − 50` clearance margin is unchanged
And the "no shrink / no hide to make room" assertions are unchanged
And only the measured numbers change, each backed by the recorded Chromium measurement
