# AC-005: The three registers stay separate, checkably

Task T6. The page's three registers are `[data-register="agreement"]` ("Lo que no se discute",
facts), `[data-register="dispute"]` ("Lo que se discute", documented dispute) and
`[data-register="thesis"]` ("Nuestra lectura", opinion).

## AC-005-28 — The fact occurs once, and only under the facts register

Given the rendered page for each locale
And claim A's and claim B's rendered text, each a string that occurs nowhere else by accident
When each claim's occurrences in the document HTML are counted
Then each occurs exactly once
And that offset lies inside the element carrying `data-register="agreement"`
And that offset does not lie inside any `[data-top-step]` section
And that offset does not lie inside `[data-register="thesis"]`
And that offset does not lie inside `[data-register="dispute"]`

## AC-005-29 — The judgement occurs once, and only under the opinion register

Given the rendered page for each locale
And the reading's rendered text
When its occurrences in the document HTML are counted
Then it occurs exactly once
And that offset lies inside the element carrying `data-register="thesis"`
And that offset does not lie inside `[data-register="agreement"]`
And that offset does not lie inside `[data-register="dispute"]`
And that offset does not lie inside any `[data-top-step]` section

## AC-005-30 — The facts carry their citation, the opinion does not

Given the rendered page for each locale
When the `.claim` blocks inside `[data-register="agreement"]` are inspected
Then every block contains exactly one `citation__chip` element
And the number of blocks equals `editorial.agreement`.length
When `[data-register="thesis"]` is inspected
Then it contains zero `citation__chip` elements and zero `class="citation"` elements
And the reading is therefore distinguishable from a measurement by structure, not by wording

## AC-005-31 — The registers keep their structure

Given the rendered page for each locale
When the three register sections are located
Then exactly one element carries `data-register="agreement"`, one carries
  `data-register="dispute"` and one carries `data-register="thesis"`
And their document order is agreement, dispute, thesis (preserved AC-001-43)
And all three occur after `id="debate"` in document order
And `RegisterKey` still renders `REGISTER_ROWS.length` rows and its heading's stated count
  still equals that number (preserved AC-001-91)
And no `.claim` text and no thesis text sits inside a `data-operator="true"` subtree
