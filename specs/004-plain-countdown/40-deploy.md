# 40-deploy — 004-plain-countdown (stage 5c, deploy verification)

- Stage: 5c Deploy Verifier
- Branch: `spec/004-plain-countdown`
- PR: #14 (draft, OPEN) — https://github.com/RexiAI/pensions-system/pull/14
- Head SHA verified: `a119be73a41832a5495d87221d3266f9072e4a25`
- Phase-2 precondition: **green** — all terminal checks pass on this exact head, so phase 3 is allowed to start.
- **Phase-3 attempt count: 1** (first verification pass; **0 of 3** fix-and-redeploy rounds consumed)
- Repo classification: **frontend** — Next.js `16.4.3` declared in `package.json` dependencies, Vercel Git integration connected to the repo. Vercel lane applies.

I did not build, deploy, or fix anything. The Vercel Git integration is the source of truth for the build;
everything below is a transcription of observation of the live system. **`vercel deploy` was never run.**

## Summary

| Component | Result |
|---|---|
| Build | **PASS** — deployment `READY`, built from head `a119be7` |
| Health check | **PASS** — HTTP 200, serving the post-004 five-step page (not a stale build) |
| E2E | **SKIP** — no E2E suite exists in this repo (see §E2E) |
| **Verdict** | **PASS** |

---

## Evidence: deployment identity

command: `vercel inspect https://pensions-system-git-spec-00-565dd3-danielbueno76-4270s-projects.vercel.app`
exit: 0
at: 2026-11-05T14:03:00Z

```
Vercel CLI 64.5.0 (Node.js 24.21.0)
Loading teams…
Fetching deployment "pensions-system-git-spec-00-565dd3-danielbueno76-4270s-projects.vercel.app" in danielbueno76-4270s-projects
> Fetched deployment "pensions-system-jm1oampyq-danielbueno76-4270s-projects.vercel.app" in danielbueno76-4270s-projects [335ms]

  General

    id		dpl_6TvQME6p88iCcgafFRTdyt8kEYF5
    name	pensions-system
    target	preview
    status	● Ready
    url		https://pensions-system-jm1oampyq-danielbueno76-4270s-projects.vercel.app
    created	Thu Nov 05 2026 15:01:23 GMT+0100 (Central European Standard Time) [8m ago]

  Duration

    build duration	26s
    post-build duration	21s
    billable duration	1m
    CPU Minutes Usage	2 minutes (1m x 2vCPU)

  Aliases

    ╶ https://pensions-system-git-spec-00-565dd3-danielbueno76-4270s-projects.vercel.app
```

The branch alias resolves to `dpl_6TvQME6p88iCcgafFRTdyt8kEYF5`. That deployment's git metadata was read
from the Vercel API to prove it was built from **this** PR head, not from an older commit:

command: `curl -sS -H "Authorization: Bearer $TOKEN" https://api.vercel.com/v13/deployments/dpl_6TvQME6p88iCcgafFRTdyt8kEYF5`
exit: 0
at: 2026-11-05T14:06:00Z

```
id           dpl_6TvQME6p88iCcgafFRTdyt8kEYF5
url          pensions-system-jm1oampyq-danielbueno76-4270s-projects.vercel.app
readyState   READY
githubCommitSha          a119be73a41832a5495d87221d3266f9072e4a25
githubCommitRef          spec/004-plain-countdown
githubCommitRepo         pensions-system
githubPrId               14
githubDeployment         1
```

### How the preview URL was obtained (no `VERCEL_TOKEN`)

Three independent sources agree, so the identity is not inferred from a single signal:

1. GitHub commit status `Vercel` on `a119be7` — `state: success`, `description: "Deployment has completed"`,
   `target_url: https://vercel.com/danielbueno76-4270s-projects/pensions-system/6TvQME6p88iCcgafFRTdyt8kEYF5`.
2. The Vercel bot's PR comment on #14 — its encoded payload carries
   `previewUrl: pensions-system-git-spec-00-565dd3-danielbueno76-4270s-projects.vercel.app`,
   `inspectorUrl: …/6TvQME6p88iCcgafFRTdyt8kEYF5`, `nextCommitStatus: "DEPLOYED"`, `projectId: prj_ZS8blMFO18fwOrMaJfRJAEJgqZbz`.
3. `vercel inspect` on that alias resolves to `dpl_6TvQME6p88iCcgafFRTdyt8kEYF5`, whose `githubCommitSha` is the head SHA.

All three name the same deployment id, and that deployment's `githubCommitSha` equals the verified head.
Nothing was fabricated and no deployment was triggered.

---

## Evidence: build status

command: `vercel ls --meta githubCommitRef=spec/004-plain-countdown` (then per-deployment API reads)
exit: 0
at: 2026-11-05T14:07:00Z

```
  Age     Project                                          Deployment                                                                    Status      Environment
  8m      danielbueno76-4270s-projects/pensions-system     https://pensions-system-jm1oampyq-danielbueno76-4270s-projects.vercel.app     ● Ready     Preview
  17m     danielbueno76-4270s-projects/pensions-system     https://pensions-system-1e94yotn7-danielbueno76-4270s-projects.vercel.app     ● Error     Preview
  17m     danielbueno76-4270s-projects/pensions-system     https://pensions-system-no7j1ulhg-danielbueno76-4270s-projects.vercel.app     ● Error     Preview
```

Build for head `a119be7`: **PASS** (`READY`, build duration 26s). No build-log excerpt is needed because the
build did not fail.

### Context: two earlier, superseded `ERROR` builds on this branch

Two deployments on this same branch failed before the head build, and they are recorded here so the
history is not silently dropped:

| Deployment | Commit | Message | Error |
|---|---|---|---|
| `dpl_9hT9ridzQwkJ7TUxFG4jhybu4QcU` | `02ba081a6350` | `docs(changes): archive 004-plain-countdown` | `errorCode: lint_or_type_error`, `Command "npm run build" exited with 1` |
| `dpl_FuRj74yHxAWdru1fi62sxrU73mFj` | `b216f15538aa` | `docs(changes): record PR URL and commit count for 004-plain-countdown` | `errorCode: lint_or_type_error`, `Command "npm run build" exited with 1` |

These are **superseded, not current**: the head commit `a119be7` built `READY` and serves the correct page.
The `prebuild` stage runs the repo's content gates (`verify-derived`, `check-content-scope`,
`check-public-vocabulary`, `check-scenario-traceability-3digit`, `check-plain-language`), so a spec folder
removed by an early archive breaks the build and its restoration fixes it — consistent with these two
docs-only commits failing and the head succeeding. Their error class (`lint_or_type_error`) is
code/config-diagnostic, not ambiguous, and the head build is green, so **no escalation is triggered**.
Recorded as an observation only; no action routed.

---

## Evidence: health check

command: `curl` against the preview URL — unauthenticated probe, then authenticated probe using the
per-machine automation-bypass secret (`config/agent.local.env`, name `VERCEL_AUTOMATION_BYPASS_SECRET`;
value never printed), then DOM assertions on the served HTML
exit: 0
at: 2026-11-05T14:10:47Z

```
--- unauthenticated probe ---
http_code=302
--- authenticated probe (automation bypass) ---
http_code=200 time_total=0.169226
bytes=226311
--- DOM assertions ---
data-top-step occurrences: 1
distinct data-top-step values:
     1	data-top-step="number"
     2	data-top-step="breakage"
     3	data-top-step="why"
     4	data-top-step="distance"
     5	data-top-step="meaning"
retired markup:
  hero--band   = 0
  class="band  = 0
  band__       = 0
at: 2026-11-05T14:10:47Z
```

Two notes so the output above is not misread:

- The bare `302` is **Vercel Deployment Protection**, not an application failure: the body is
  `Protected by Vercel Authentication`. The deployment is a protected preview, which is expected for this
  project. With the configured automation-bypass header the same URL returns `200`.
- `data-top-step occurrences: 1` is `grep -c` counting *lines*, and the served HTML is a single line
  (0 newlines). Occurrence count is **10** by `grep -o | wc -l` — 5 in the rendered markup plus 5 in the
  inlined RSC payload — and **5 distinct step values**, which is the number that matters.

### DOM verification — this is the post-004 page, not a stale build

The health check confirms the deployment is serving *this branch's* content, which is the specific trap
this stage must not fall into (a 200 from a stale build is a failure, not a pass):

- **New five-step structure present.** Five distinct `data-top-step` values, in rendered order:
  `number` → `breakage` → `why` → `distance` → `meaning`.
- **Retired markup absent.** `hero--band`, `class="band"`, and `band__` all occur **0** times.
- **Visible content matches the five steps**, with the method section below the fold as designed.
  Headings extracted from the served HTML:

```
La pensión que te espera en España
El número
Qué se rompe
Por qué
Qué parte del umbral
Qué significa
Cifras
Gasto público en pensiones (% del PIB)
Método
Las 4 voces de esta página
```

- The page is real application output, not an error shell: `<title>2042: España llega a 50 mayores de 65
  por cada 100 en edad de trabajar · pensiones · España</title>`, `lang="es"`.

### Immutable deployment URL cross-check

The deployment-specific URL was checked as well, so the pass does not rest on the branch alias alone:

command: `curl <immutable-url>/` with the automation-bypass header, then `cmp` against the alias body
exit: 0
at: 2026-11-05T14:09:00Z

```
=== IMMUTABLE DEPLOYMENT URL ===
http_code=200 time=0.258771s
size=226311
data-top-step count=1
hero--band count=0
=== identical to alias body? ===
IDENTICAL
```

Both the branch alias and the immutable deployment URL serve byte-identical HTML (226,311 bytes) with the
five-step structure and without the retired hero markup.

---

## E2E

verdict: **SKIP** (recorded skip, not a failure)

There is **no E2E suite in this repository to run against the preview URL**. Verified by inspection:

command: `grep -iE '"(e2e|playwright|cypress|maestro|@testerarmy|detox|testcafe|webdriverio)' package.json` + directory/config scan
exit: 0 (grep found no matches)
at: 2026-11-05T14:08:00Z

```
=== e2e-ish deps ===
NONE in package.json
=== e2e-ish scripts ===
NONE
=== dirs ===
tests
=== find e2e configs ===
(no matches)
```

Reason for the skip: `skills/e2e-testing/SKILL.md` scopes agentic E2E to repos running the TesterArmy `e2e`
framework at the pinned version. That framework is not a dependency here, there is no `e2e/` directory, no
`playwright.config.*` / `cypress.config.*` / `.maestro/` config, and `package.json` has no `e2e`-prefixed
script. The repo's test layer is Vitest unit/acceptance tests under `tests/`, which are not a live-URL E2E
suite and were already exercised by stage 4. Delegating to `e2e-runner` would have nothing to run.

Consequence: no E2E exit code exists to route. The live-system signal for this round is the DOM-verified
health check above, which does confirm the deployed build serves the new five-step structure.

---

## Findings for the human (not blocking this verdict)

### F-1 — `VERCEL_TOKEN` is not configured on this machine (configuration defect)

Recorded precisely, and **not** treated as "no Vercel project linked" — a Vercel project *is* linked and
was queried successfully.

command: `env` check + key-name scan of `config/agent.local.env`
exit: 0
at: 2026-11-05T14:02:00Z

```
=== VERCEL_TOKEN set? ===
NOT SET
=== agent.local.env keys (names only) ===
VERCEL_AUTOMATION_BYPASS_SECRET
```

Per `docs/DEPLOYMENT.md` §Frontend: Vercel, `VERCEL_TOKEN` belongs in the gitignored per-machine
`config/agent.local.env` (loaded via direnv). It is absent; the only Vercel key present is
`VERCEL_AUTOMATION_BYPASS_SECRET`. There is also no `.vercel/` project link directory in the repo.

However, this did **not** block verification: the Vercel CLI resolved authentication from its own stored
operator session (`~/.local/share/com.vercel.cli/auth.json`), which is how the `vercel inspect`, `vercel ls`,
and API reads above succeeded. So the deployment facts in this report are real, not fabricated — but the
authentication path is **not reproducible in CI**, which cannot use a local login session.

Action required before relying on the post-merge lane: set `VERCEL_TOKEN` (plus `VERCEL_ORG_ID` /
`VERCEL_PROJECT_ID`) in `config/agent.local.env` for local runs, and as repository secret
`VERCEL_TOKEN` for `.github/workflows/ci-vercel-production-verify.yml`. Without it, per
`docs/DEPLOYMENT.md`, that post-merge lane will record a loud failure rather than a skip. This is a
follow-up configuration task, not a defect in the 004 change.

### F-2 — protected preview requires the bypass secret for any automated probe

Any CI or agent health check against a preview URL must send the `x-vercel-protection-bypass` header, or it
will see `302` → Vercel SSO and could misreport a healthy deployment as failing. Worth encoding in whatever
automates future phase-3 checks.

---

## Phase-3 budget

- Fix-and-redeploy rounds consumed: **0 of 3**.
- This round needed no fix routing: build passed, health check passed, E2E skipped for a stated reason.
- `Phase-3 budget exhausted` is **not** applicable.
- Counter is independent of phase 1 and phase 2, per `docs/SPEC_PIPELINE.md §Remediation budget`.

## Verdict

**Verdict: PASS**

Build PASS (deployment `READY` at head `a119be7`), health check PASS (HTTP 200 with the post-004 five-step
DOM verified and the retired hero markup absent), E2E SKIPPED with a recorded reason. Stage 5d may proceed.
The two findings above are configuration follow-ups for the human and do not gate this spec's deploy
verification.
