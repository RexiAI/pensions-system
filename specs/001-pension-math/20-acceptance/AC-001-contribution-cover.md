# AC-001: Contribution cover

## AC-001-13 — Correct cover, two decimal places
Given social contributions of 120,000,000,000
And contributory pension expenditure of 150,000,000,000
When contribution cover is computed
Then the result is 0.80

## AC-001-14 — Zero expenditure is undefined
Given contributions of 100,000,000,000
And expenditure of 0
When contribution cover is computed
Then the result is undefined

## AC-001-15 — Zero contributions is 0.00
Given contributions of 0
And expenditure of 50,000,000,000
When contribution cover is computed
Then the result is 0.00

## AC-001-16 — Cover below 1 produces a positive gap
Given contributions of 120,000,000,000
And expenditure of 150,000,000,000
When the gap is derived from cover
Then cover is less than 1 and the gap `expenditure − contributions` is 30,000,000,000 (greater than zero)

## AC-001-17 — Cover is never negative
Given any valid non-negative contributions and non-negative expenditure
When contribution cover is computed
Then the result is never negative
