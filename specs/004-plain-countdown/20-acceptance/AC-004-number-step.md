# AC-004: Step 1 — the number, in plain words

## AC-004-06 — The day count comes from the committed countdown
Given the committed `countdown` series with a computed value and an anchor
When step 1 is rendered at a pinned instant
Then its day count equals the day count read from that anchor at that instant
And no second source of days exists on the page
And the day numeral sits on the top step of the numeral ladder (`--text-num-xl`)
And it is larger than the `<h1>` on the page

## AC-004-07 — Step 1 carries the number and one plain sentence, nothing else
Given the page rendered in any locale
When step 1's visible text is read with `data-operator="true"` subtrees stripped
Then it consists of the years numeral and its unit, the day count and its label, the three sub-day fields with their labels, one plain sentence, and the step's `<h2>`
And it renders none of `countdown.definition`, `countdown.range`, `countdown.source`, `countdown.backCast`, `countdown.yearLabel`, `countdown.clock.definition`, `countdown.clock.arithmetic`
And the whole step renders no `<details>` element

## AC-004-08 — The `<h1>` is step 1's heading and still names the country
Given the page rendered in any locale
Then the document contains exactly one `<h1>`
And that `<h1>` is inside step 1, above the day-count group
And its text contains that locale's `countryName`

## AC-004-09 — No threshold year, no number, and no empty step
Given a countdown series that is not `computed` (no threshold year, no anchor)
When the page is rendered
Then step 1 renders its plain sentence and no day count
And step 1 renders no clock group and no substitute number
And steps 2 to 5 still render in their order
And no step renders an empty body
