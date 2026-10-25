# AC-001: Parameter proposals

## AC-001-61 — A proposal citing an unresolvable source is rejected
Given a legal-parameter proposal whose citation does not resolve to a source
When the proposal is submitted
Then it is rejected and cannot enter review

## AC-001-62 — A proposal enters parameter review and cannot auto-approve
Given a valid proposal with a resolvable citation
When it is submitted
Then it enters parameter review (a rule change, distinct from a figure revision)
And there is no code path that auto-approves it

## AC-001-63 — A proposal cannot alter a derived figure
Given any parameter proposal
When the proposal is applied
Then it changes only an enumerated parameter, never a derived figure value directly
And the proposal write path is structurally incapable of writing a computed figure

## AC-001-64 — The parameter set is enumerated
Given the proposal mechanism
When a change targets a parameter outside the enumerated set (pension payment count, retirement age, contribution base limits, revaluation rule)
Then it is rejected

## AC-001-73 — Accepting a parameter publishes zero figure changes
Given an accepted parameter proposal
When the acceptance completes
Then zero published figure changes result (the rule change is committed, nothing else)
And the change reaches readers only through a later figure revision approved separately under T14
