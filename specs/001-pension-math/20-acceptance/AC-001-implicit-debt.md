# AC-001: Implicit debt

## AC-001-24 — PV of obligations is discounted correctly
Given an obligation stream of 100 per year for 3 years
And a discount rate of 2% (0.02)
When the present value is computed
Then the result is 100/(1.02) + 100/(1.02)^2 + 100/(1.02)^3

## AC-001-25 — All four rates present, no single value
Given an obligation stream and system assets
When implicit debt is computed
Then the output contains exactly four values keyed by rates 1%, 2%, 3%, and 4%
And there is no path that produces a single headline value

## AC-001-26 — Assets are subtracted and a surplus is negative
Given a present value of obligations of 1,000
And system assets of 1,200
When implicit debt is computed at a fixed rate
Then the result is −200 (a negative value, not clamped to zero)

## AC-001-27 — Implicit debt decreases as the rate increases
Given a fixed obligation stream and fixed assets
When the discount rate increases
Then the computed implicit debt decreases

## AC-001-89 — No internationally-comparable implicit debt is presented
Given the implicit-debt metric
When its international rendering is requested
Then it renders `availability: 'unavailable'` with the reason "no internationally comparable
  source for accrued obligations and system assets"
And no internationally-comparable implicit-debt figure is presented
