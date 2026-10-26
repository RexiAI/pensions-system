# AC-001: Required base growth

## AC-001-28 — Required growth is return minus wage growth
Given a real cohort return `r_paid_real` of 0.05
And assumed real wage growth `g_wage` of 0.01
When required base growth is computed
Then `g_required` is 0.04

## AC-001-29 — Gap is required minus projected
Given `g_required` of 0.04
And projected base growth `g_proj` of −0.01
When the gap is computed
Then the gap is 0.05 and is greater than zero

## AC-001-30 — A shrinking base widens the gap
Given `g_required` of 0.04
And projected base growth `g_proj` of −0.01
When the gap is computed
Then the gap `0.04 − (−0.01)` equals 0.05, which is larger than `g_required`

## AC-001-31 — Every output carries its assumptions
Given a required-base-growth result
When the result is rendered
Then `r_paid_real`, `g_wage`, `g_proj`, and the projection horizon are present alongside the value

## AC-001-32 — Gap is monotonic in return and projection
Given fixed `g_wage`
When `r_paid_real` increases, the gap increases
And when `g_proj` increases, the gap decreases

## AC-001-90 — No internationally-comparable required base growth is presented
Given the required-base-growth metric
When its international rendering is requested
Then it renders `availability: 'unavailable'` with the reason "depends on the cohort return,
  which has no internationally comparable computation"
And the internationally-comparable `g_proj` input is not published as a substitute metric
