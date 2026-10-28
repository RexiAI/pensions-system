# AC-001: Contribution cover (two labelled definitions — not variants)

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

## AC-001-85 — Two distinct figures, never one merged number
Given the contribution-cover metric
When it is rendered
Then it renders as two distinct figures with distinct labels and distinct `definitionId`s
And the %-of-GDP figure and the contributions-÷-expenditure figure are never presented as
  variants of one number
And each figure's definition is visible alongside it

## AC-001-86 — International figure is pension expenditure as % of GDP
Given pension expenditure of 150,000,000,000
And GDP of 1,500,000,000,000
When the international figure is computed
Then the result is 10.00 (% of GDP)
And the figure carries the label "Gasto público en pensiones (% del PIB)"

## AC-001-87 — National figure is contribution cover, unavailable
Given the national contribution-cover figure
When it is rendered
Then it carries `availability: 'unavailable'` and no headline value
And its definition states it counts social contributions divided by contributory pension
  expenditure and excludes transfers from general taxation and debt
