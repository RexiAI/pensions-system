# AC-001: Citations, attribution, contested claims

## AC-001-37 — A named-person claim renders with its citation
Given a claim about a named person or institution that carries a resolvable citation
When the claim is rendered
Then the citation reference appears in the same rendered unit

## AC-001-38 — A named-person claim without a citation does not render
Given a claim about a named person or institution with no resolvable citation
When the claim is processed for rendering
Then it is not rendered

## AC-001-39 — A contested claim shows both positions
Given a contested claim with two positions, each with its own resolvable citation
When the claim is rendered
Then both positions appear, each with its citation, and both are reachable from the same view

## AC-001-40 — A quote with an unresolvable source does not render
Given a quote whose source reference is missing or does not resolve
When the quote is processed for rendering
Then it is not rendered

## AC-001-68 — Admin content cannot introduce an uncited claim
Given a refresh or parameter proposal that would publish content containing a named-person claim
When the publication gate runs
Then content whose claim lacks a resolvable citation is rejected and not published
