# AC-007-03 — Cifras page

## AC-007-08 — Cifras renders the seven figure plates and one h1, nothing else
Given the Cifras page for a locale
When the page is rendered
Then it contains the `#figuras` region with the seven computed figure plates in order
And a figure that is unavailable or withheld renders its unavailable/withheld state,
exactly as on the single page today
And it contains exactly one `<h1>`
And it contains no `data-top-step`, no `id="metodo"`, no `data-register`, no
`class="reproduce"` and no assumptions ledger region
And the page's own `#figuras` id resolves (no in-page `href="#figuras"` points at a
missing id)
