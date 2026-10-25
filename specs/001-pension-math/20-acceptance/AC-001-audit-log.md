# AC-001: Audit log

## AC-001-65 — Every admin action is recorded append-only
Given an admin performs an action
When the action completes
Then an append-only entry records identity, timestamp, action, target, before/after, and request id

## AC-001-66 — Failed authentication is logged without the credential
Given a failed login attempt
When the attempt is logged
Then the entry records the attempt but does not record the attempted credential (password or hash)

## AC-001-67 — Audit log is readable in the admin panel
Given recorded audit entries
When the admin panel is opened
Then the entries are listed and readable
