# AC-001: Build-time ingest & computation harness

## AC-001-04 — All sources resolve, derived JSON is written, exit 0
Given every required source resolves successfully at build time
When the compute step runs
Then it writes the derived JSON under `data/derived/` and exits with code 0

## AC-001-05 — A single source failure fails the build loudly
Given one required source fails to fetch
When the compute step runs
Then it exits with a non-zero code and does not emit a figure marked "current"

## AC-001-06 — A partial ingest fails loudly
Given some sources resolve and at least one required source fails
When the compute step runs
Then it exits non-zero and does not publish partial output as current

## AC-001-07 — A stale snapshot is not rendered as current
Given a source snapshot whose `fetchedAt` is older than the configured freshness window
When the compute step evaluates freshness
Then it treats the snapshot as a failure and exits non-zero
