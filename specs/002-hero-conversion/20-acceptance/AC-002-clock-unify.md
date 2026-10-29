# AC-002: Unify the years numeral with the day/hour/minute/second row

This file is the recorded reversal of the 1px-rule rationale. The years numeral and
the day count become one centred group; the risk the old rule mitigated is accepted,
not deleted.

## AC-002-09 — The 1px separator between the projection block and the clock rail is gone
Given `web/styles/globals.css`
When the `.clock` rule is read
Then it does not declare `border-top`
And the value `border-top: var(--border-hair)` no longer appears in the clock's rules

## AC-002-10 — The years numeral and the day count are one centred group
Given the rendered countdown block in the computed state
When the years numeral (`countdown__numeral`, with its `countdown__unit` label)
And the day value (`clock__value--days`, with its `clock__label`) are located in the markup
Then they are siblings inside one centred container
And no rule element and no separate block boundary sits between them
And the hour/minute/second fields sit in the same group

## AC-002-11 — The merged group is centred, with no left alignment reintroduced
Given `web/styles/globals.css`
When the countdown and clock rules are read
Then the merged group inherits the centred axis (`text-align: center` and
`justify-items: center` on `.countdown`)
And no `text-align: left` / `text-align: start`, `justify-*: left` / `justify-*: start`,
or `margin-left: 0` is declared for the merged group

## AC-002-12 — The component prose records the accepted risk
Given `web/components/series/CountdownBlock.tsx`
When its documentation comment is read
Then it no longer asserts that a rule keeps the years numeral and the day count apart
And it states that the separator has been removed and the two numerals now form a single
centred group
And it states that the risk of a reader dividing years by days is accepted

## AC-002-13 — "No anchor, no clock" still holds
Given the countdown block
When the countdown is in the not-crossed state
Then no years numeral (`countdown__numeral`) and no clock render
And when the countdown is in the computed state
Then both the years numeral and the clock render, as one group

## AC-002-14 — The integrity invariants are preserved
Given the rendered clock in the computed state, in every locale
Then the anchor date stays visible as text
And the clock never states the threshold has been crossed (no "crossed / reached /
validated" language; the elapsed sentence is preserved)
And the clock is server-rendered complete with the four fields written through refs
(no React state), owning a single timer — the home page stays zero-JS
And the years quantity keeps its unit label and carries no sub-annual unit
And the day/hour/minute/second fields keep their labels
