# AC-004: One plain sentence for the target date

## AC-004-29 — The target date is named once at the top
Given a computed countdown with an anchor
When the five steps' text nodes are read with `data-operator="true"` stripped
Then the formatted anchor date occurs exactly once
And that occurrence is inside step 1

## AC-004-30 — The three paraphrases are gone from the top
Given the page rendered in any locale
When the five steps' visible text is read
Then it renders none of `countdown.clock.definition`, `countdown.clock.arithmetic` or `countdown.definition`
And no other step names the anchor date

## AC-004-31 — The clock's accessible name is plain
Given the page rendered in any locale
Then the clock group's `aria-label` contains the formatted anchor date
And it contains no occurrence of the locale's phrase for "conventional date" (`fecha convencional` and its four equivalents)
And it contains no occurrence of the locale's word for "threshold" (`umbral` and its four equivalents)
And the label is non-empty in all five locales

## AC-004-32 — The date and the arithmetic survive below the fold
Given the page rendered in any locale
Then `countdown.clock.definition` renders inside `#metodo`
And `countdown.clock.arithmetic` renders inside `#metodo`
And both render as visible text, outside any collapsed disclosure
