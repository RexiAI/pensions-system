# AC-001: Refresh trigger and pending revision

## AC-001-57 — Refresh produces a pending revision, public figures unchanged
Given an admin triggers a refresh
When the refresh dispatches the ingest workflow and recomputes
Then a pending revision is produced with a per-figure diff (old value, new value, source, timestamp, input hash)
And the public figures are unchanged until the revision is approved

## AC-001-58 — Approval publishes the revision and writes an audit entry
Given a pending revision
When an admin approves it with a valid session, CSRF token, and a review token bound to this revision
Then the revision is published (public figures update to the new values)
And an audit entry records the approver identity and a timestamp

## AC-001-59 — Duplicate refresh for the same snapshot does not stack
Given a pending revision already exists for a source snapshot
When a second refresh is triggered for the same snapshot
Then no second pending revision is created

## AC-001-60 — A published revision still resolves to a manifest
Given an approved revision is published
Then every published figure still resolves to a manifest entry (source URL, fetch timestamp, formula id, input hash, reproduce path)

## AC-001-71 — A newer snapshot supersedes an older pending revision
Given a pending revision for source snapshot S1
When a refresh produces a pending revision for a newer snapshot S2
Then the S1 revision transitions to `superseded`
And it cannot be approved

## AC-001-72 — Approval requires a revision-bound review token
Given a pending revision
When an approval is submitted with an absent, stale, or other-revision `reviewToken`
Then the approval is rejected and nothing is published
