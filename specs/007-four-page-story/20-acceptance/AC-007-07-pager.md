# AC-007-07 — Previous/next pager

## AC-007-13 — each page ends with previous/next walking the four-page sequence
Given the four pages in the sequence Historia → Cifras → Método → Debate
When each page is rendered at its end
Then Historia renders a next link to Cifras and no previous link
Then Cifras and Método render both a previous and a next link to their adjacent pages
Then Debate renders a previous link to Método and no next link
And every pager link is an ordinary `<a href>`, localized, keyboard-reachable, at least
44×44 CSS px, reduced-motion safe and present without client JavaScript
And Historia keeps its story strip in addition to the pager (the strip is not replaced)
