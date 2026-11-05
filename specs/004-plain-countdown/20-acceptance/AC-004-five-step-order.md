# AC-004: The five-step contract and the top-of-page order

## AC-004-01 — The five steps exist, in the stated order, from one declaration
Given the public page rendered for any locale
When the top of `<main>` is inspected
Then exactly five elements carry `data-top-step`
And their `data-top-step` values are, in document order, `number`, `breakage`, `why`, `distance`, `meaning`
And all five come from the single `TOP_STEPS` declaration

## AC-004-02 — Nothing else renders above the fifth step
Given the page rendered with computed figures and computed series
When the markup between `<main id="main">` and the end of the fifth step is scanned
Then it contains no `class="source-strip"`
And it contains no element with `data-operator="true"`
And it contains no `class="plate"` figure plate
And it contains no `class="register-key"`
And it contains no `class="reproduce"`

## AC-004-03 — Each step is a labelled section with its own heading
Given the page rendered in any locale
When the five step elements are inspected
Then each is a `<section>` whose `aria-labelledby` resolves to an `<h2>` inside it
And the five `<h2>` ids are distinct
And every `<h2>` text is non-empty

## AC-004-04 — The step stack precedes the figures
Given the page rendered in any locale
When the positions of the fifth step and of `id="figuras"` are compared
Then the fifth step precedes `#figuras`
And `#figuras` is not empty

## AC-004-05 — The page chrome is not a step
Given the page rendered in any locale
When everything before the first step is inspected
Then it is limited to `class="site-header"` and, when the snapshot is stale, one `class="banner"`
And no element before the first step carries `data-top-step`
