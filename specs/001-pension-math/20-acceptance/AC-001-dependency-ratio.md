# AC-001: Dependency ratio

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
