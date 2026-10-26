# AC-001: Cohort return (IRR)

## AC-001-18 — IRR solves NPV to tolerance
Given a cohort paying 100 per year for 40 years (ages 25–65)
And drawing 210 per year for 20 years in retirement
When the IRR is computed
Then the returned rate makes the net present value zero to within an absolute tolerance of 1e-6
And the rate is a unique, finite, positive value

## AC-001-19 — Zero benefit years is a −100% return
Given a cohort with contributions greater than zero
And life expectancy at retirement of 0 years
When the IRR is computed
Then the result is −1 (a −100% return)

## AC-001-20 — Zero contributions is undefined
Given a cohort that pays nothing in
And draws benefits greater than zero
When the IRR is computed
Then the result is undefined (no finite IRR)

## AC-001-21 — Sensitivity band contains the central value
Given a cohort's central IRR
When the sensitivity band is computed over life expectancy {−2y, central, +2y}, contribution {−10%, central, +10%}, and pension {−10%, central, +10%}
Then the returned range is `[min, max]` and the central value lies within `[min, max]`

## AC-001-22 — IRR increases with the pension
Given a fixed contribution and fixed life expectancy at retirement
When the average pension increases
Then the computed IRR increases

## AC-001-23 — IRR decreases with the contribution
Given a fixed pension and fixed life expectancy at retirement
When the average contribution increases
Then the computed IRR decreases

## AC-001-76 — A negative return is computed and reported as negative when flows are inverted
Given a cohort paying 100 per year for 40 years (ages 25–65)
And drawing 150 per year for 20 years in retirement, so total paid in (4 000) exceeds total drawn
  out (3 000)
When the IRR is computed
Then the returned rate makes the net present value zero to within an absolute tolerance of 1e-6
And the rate is a unique, finite, negative value with a single sign change (contributions
  negative, then benefits positive)
And the negative rate is reported as a negative value, never clamped to zero and never reported
  as undefined

## AC-001-88 — No internationally-comparable cohort return is presented
Given the cohort-return metric
When its international rendering is requested
Then it renders `availability: 'unavailable'` with the reason "no internationally comparable
  source for average contributions"
And no internationally-comparable IRR figure is presented (ESSPROS has no contributions series)
