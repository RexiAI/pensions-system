# AC-004: Each of the five steps fits one screen

## AC-004-60 — Every step fits the viewport at the three measured sizes
Given the app served and loaded in a real Chromium
When each of the five step sections' `getBoundingClientRect().height` is measured
Then each height is less than or equal to the viewport height
At 390×844 and at 1366×768 and at 1440×900
And each height is greater than 0

## AC-004-61 — Every step fits in every locale
Given the same measurement run once per locale
When it covers `es`, `en`, `fr`, `de` and `it`
Then every step fits at every measured viewport in every locale
And the failing locale and step are named in the assertion message

## AC-004-62 — The tallest step's record is kept
Given the same measurement run
Then step 3's height is recorded explicitly for each locale at each viewport
And the record is asserted against the bound, not merely printed

## AC-004-63 — Nothing is hidden to meet the bound
Given the five step sections
Then none of them declares `display: none` on a content element
And none declares a fixed height with `overflow: hidden`
And a closed `<details>` counts at its closed height and is allowed
