# AC-007-05 — Debate page

## AC-007-10 — Debate renders the three registers with `#debate` and `#lectura` intact
Given the Debate page for a locale
When the page is rendered
Then it renders the agreement section, then the dispute section, then the thesis, in
that order
And `data-register="agreement"`, `data-register="dispute"` and `data-register="thesis"`
each appear exactly once
And the `#debate` id wraps the agreement and dispute sections
And the `#lectura` id wraps the thesis section
And both ids resolve on this page
And it contains exactly one `<h1>`
And it contains no `data-top-step`, no `class="plate"`, no `id="metodo"`, no
`class="reproduce"` and no assumptions ledger region
And the register copy is byte-for-byte today's editorial (the two mechanism claims, the
dispute positions and the thesis reading are unchanged)
