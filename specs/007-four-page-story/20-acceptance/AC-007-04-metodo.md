# AC-007-04 — Método page

## AC-007-09 — Método renders method precision, the source strip, reproduce and the ledger
Given the Método page for a locale
When the page is rendered
Then it contains, in order, the method region (`id="metodo"` with the countdown
precision, the fuse and the register key), the source strip, the reproduce panel and
the assumptions ledger
And it contains exactly one `<h1>`
And it contains no `data-top-step`, no `class="plate"` and no `data-register`
And every in-page `href="#…"` resolves to an id present on this page
