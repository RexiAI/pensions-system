# AC-001: Dependency ratio (two labelled definitions)

## AC-001-08 — Correct ratio, two decimal places
Given 8,400,000 contributory pensioners
And 20,000,000 contributing affiliates
When the dependency ratio is computed
Then the result is 0.42

## AC-001-09 — Zero affiliates is undefined, not infinite
Given 1,000,000 pensioners
And 0 affiliates
When the dependency ratio is computed
Then the result is undefined (serialised as `null`), never `Infinity` or `NaN`

## AC-001-10 — Zero pensioners is 0.00
Given 0 pensioners
And 5,000,000 affiliates
When the dependency ratio is computed
Then the result is 0.00

## AC-001-11 — Both zero is undefined
Given 0 pensioners
And 0 affiliates
When the dependency ratio is computed
Then the result is undefined

## AC-001-12 — Ratio rises when affiliates fall
Given a fixed number of pensioners
When the number of affiliates decreases
Then the computed ratio increases

## AC-001-82 — Two distinct figures, never one merged number
Given the dependency metric
When it is rendered
Then it renders as two distinct figures with two distinct labels and two distinct `definitionId`s
And neither figure's value is presented as a variant of the other
And each figure's definition is visible alongside it

## AC-001-83 — International dependency figure is computed from old-age beneficiaries
Given old-age pension beneficiaries of 4,000,000 (Eurostat `spr_pns_ben`, old-age)
And employed persons of 20,000,000 (Eurostat `lfsi_emp_a`)
When the international dependency figure is computed
Then the result is 0.20
And the figure carries the definition "counts old-age pension beneficiaries; excludes survivor
  and disability beneficiaries"

## AC-001-84 — National dependency figure is unavailable with its definition stated
Given the national contributory dependency figure
When it is rendered
Then it carries `availability: 'unavailable'` and no headline value
And its definition states it counts all contributory pensioners (jubilación, viudedad,
  incapacidad, orfandad) and excludes non-contributory pensions
And the difference from the international figure (all-types contributory vs old-age-only) is
  explicit, never silent
