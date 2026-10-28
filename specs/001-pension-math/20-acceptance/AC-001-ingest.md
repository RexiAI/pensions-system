# AC-001: Build-time ingest & computation harness

## AC-001-04 — All sources resolve, derived JSON is written, exit 0
Given every required source resolves successfully at build time
When the compute step runs
Then it writes the derived JSON under `data/derived/` and exits with code 0

## AC-001-05 — A single source failure fails the build loudly
Given one required source fails to fetch
When the compute step runs
Then it exits with a non-zero code and does not emit a figure marked "current"
And a figure explicitly marked `availability: 'unavailable'` in the committed data is not a
  partial snapshot, is never labelled current, and does not trigger this failure path

## AC-001-06 — A partial ingest fails loudly
Given some sources resolve and at least one required source fails
When the compute step runs
Then it exits non-zero and does not publish partial output as current
And a figure explicitly marked `availability: 'unavailable'` in the committed data is not a
  partial snapshot, is never labelled current, and does not trigger this failure path

## AC-001-07 — A stale snapshot is not rendered as current
Given a source snapshot whose `fetchedAt` is older than the configured freshness window
When the compute step evaluates freshness
Then it treats the snapshot as a failure and exits non-zero

## AC-001-79 — The international path takes geo as data, not code
Given the compute step's source resolution
When a second country `geo` is added
Then computing that country is a data/config change (a new `geo` value plus its sources)
And no new country-specific code branch is required

## AC-001-80 — Only ES is published in v1
Given a request for a country code other than `ES`
When the compute step or the content model is asked for that country in v1
Then the country is not silently rendered or assumed
And only `ES` carries published figures in v1

## AC-001-81 — A definition missing for a country renders unavailable, never a substitute
Given a definition whose source exists for country A but not for country B
When both countries are rendered
Then country B renders `availability: 'unavailable'` for that definition
And the `definitionId` is unchanged (the reader sees that country B has no value for that exact
  definition)
And no silently different definition is substituted for country B
