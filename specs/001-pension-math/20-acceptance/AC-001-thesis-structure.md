# AC-001: Thesis / dispute / agreement structure

## AC-001-41 — Fraud reading appears only in the thesis section
Given the site's "fraud / pyramid scheme" conclusion text
When it is rendered
Then it appears only in the thesis section, never in a computed-metric rendering

## AC-001-42 — Metric components do not reference thesis content
Given a computed-metric component
When its source is inspected
Then it contains no reference to (and renders none of) the thesis language

## AC-001-43 — Three structurally distinct sections
Given the editorial content
When it is rendered
Then agreement, dispute, and thesis are three distinct sections with distinct content types, not one merged block

## AC-001-91 — A heading's count matches the registers actually rendered
Given a section heading that names a count (e.g. "Las tres voces de esta página")
And the number of registers rendered beneath it
When the section is rendered
Then the heading's count equals the number of rendered registers
And a heading whose prose count contradicts the rendered register count is a defect (rejected,
  not shipped)
