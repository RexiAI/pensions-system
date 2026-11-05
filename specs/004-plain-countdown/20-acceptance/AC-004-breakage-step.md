# AC-004: Step 2 — what breaks, one plain line

## AC-004-10 — One sentence, bound to the shared parameter
Given the page rendered in any locale
When step 2's markup is inspected
Then it contains exactly one `<p>`
And that paragraph's text is resolved from one content key
And that key's template carries both `{threshold}` and `{base}`
And the rendered line contains the value of `COUNTDOWN_THRESHOLD` and `100`, formatted for the locale

## AC-004-11 — The threshold statement is stated once at the top
Given the page rendered in any locale
When the five steps' visible text is scanned for the 50-per-100 statement
Then it occurs exactly once
And it is inside step 2

## AC-004-12 — Step 2 adds nothing but the sentence
Given the page rendered in any locale
When step 2 is inspected
Then it contains no `<svg>`, no `<table>`, no `<figure>`, no `<a>` and no element with `data-operator="true"`
And its only text nodes are its `<h2>` and its one `<p>`
