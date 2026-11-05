# AC-004: Step 4 — the fuse as a simple percentage

## AC-004-20 — The face states one quantity
Given the committed `fuse` series with a computed value
When step 4 is rendered in any locale
Then its face label is resolved from a key whose template contains exactly one placeholder, `{percent}`
And that template contains none of `{ratio}`, `{year}` or `{threshold}`
And the rendered label contains the whole-percent value of `displayPercent(consumedPercent)`
And the rendered label contains no numeral other than that percentage

## AC-004-21 — The technical label and the dataset name leave the step
Given the page rendered in any locale
When step 4 is scanned
Then it renders neither `fuse.label` nor `fuse.definition`
And `fuse.label` and `fuse.definition` both render inside `#metodo`
And `fuse.definition`'s dataset identifier appears nowhere inside the five steps

## AC-004-22 — The drawing is unchanged and still implies nothing
Given a computed fuse value
When step 4 is rendered
Then the `<svg>` keeps its `viewBox`, its cord and burnt rects computed by `burnPoint`
And the `<svg>` is `aria-hidden="true"` with `focusable="false"`
And it carries no `role="progressbar"`, no value attribute and no date
And its geometry does not change across a clock tick

## AC-004-23 — No fuse value, no step
Given a `fuse` series with no computed value
When the page is rendered
Then step 4 renders no label, no `<svg>` and no body text
And it renders no `#reproducir` link
And the remaining steps keep their relative order
