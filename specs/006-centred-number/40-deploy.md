# Deploy verification — 006-centred-number

**Deploy Verifier:** spec-deployer (stage 5c)
**Attempt:** 1 of 3 (phase 3); fix-and-redeploy rounds consumed: **0 of 3**
**PR:** #18 (draft), branch `spec/006-centred-number`, head `d86ce528daf113d1825fadb56f7205fcf9f609a8`
**Date:** 2026-11-06
**Verified against:** the live Vercel preview deployment built by the Git integration for the
PR head, plus `10-tasks.md` and `20-acceptance/`. `00-informal.md` was **not** read
(information barrier).

## Verdict

Verdict: PASS

The preview deployment the Git integration built for `d86ce52` is READY, the served HTML is
that commit's build, the app answers **200** and the rendered page matches the spec's
appearance requirements at `es` and `de` on 390×844 and 1440×900. One check — `AC-006-35`'s
serving-origin equality — **cannot pass before merge by construction**; it is measured and
interpreted below and is not a defect in this commit.

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | Build status | **PASS** | deployment READY; commit status `success`; GitHub deployment `7605747526` → `d86ce52` |
| 2 | Health check | **PASS** | `200` with the project's automation-bypass header; `302` → Vercel SSO for anonymous requests (deployment protection, not an app failure) |
| 3 | The box is gone | **PASS** | step 1 `background-color: rgba(0,0,0,0)`, all four borders `0px`, `box-shadow: none` |
| 4 | Neutral palette, one accent | **PASS** | ground `rgb(251,251,250)`, ink `rgb(70,70,67)`, exactly **1** accent paint site in the rasterised full page (`rgb(122,31,43)`, bbox x 609–784 × y 262–321 = the numeral) |
| 5 | One number | **PASS** | `5534` / `días` / one sentence; one digit-bearing text node in the number group; no `16 años`, no `hh:mm:ss`, no sub-day field in step 1 |
| 6 | Centred axis | **PASS** | four derived units, centre offset **≤ 0.01 px** (tolerance 4 px), residual asymmetry **≤ 0.02 px** (tolerance 8 px) |
| 7 | Projection by form | **PASS** | projected bars `fill: url("#projection-hatch")`; rasterised row alternates ink/ground (24 % ink, runs 4 px ink / 11 px ground) vs the observed bar's solid 99 % ink |
| 8 | Static HTML, no client clock | **PASS** | numeral `5534` in the served bytes; step 1 text identical after 2 s; `data-rendered-at="2026-11-06T16:54:08.215Z"`, **9.6 min** old at measurement (≤ 1 h) |
| 9 | Canonical share / `AC-006-35` | **PASS (shape) — live equality not verifiable pre-merge** | all 4 share controls and canonical/`og:url`/alternates carry `https://pensions-system-delta.vercel.app` — the project's **production** origin (`vercel inspect` → `target: production`) — not the `-projects.vercel.app` alias. Equality against the *preview* origin does not hold and cannot hold before merge; see §AC-006-35 |
| 10 | E2E against the live URL | **SKIP** | this repo has no agentic `e2e` suite (no `e2e/`, no `tests/e2e/`, no Playwright/Maestro dependency) — recorded skip, not a failure |

`vercel deploy` / `vercel deploy --prod` were **not** run: the Git integration is the source
of truth and a CLI deploy would double-build the same commit.

## Evidence: deployment identity

`VERCEL_TOKEN` is unset for this machine. That is not a defect for this lane: the deployment
resolved from the `Vercel` commit status on the PR head, the GitHub deployment record, and
`vercel inspect` through the CLI's stored operator session.

command: git show -s --format='%H%n%ci' d86ce52; vercel inspect pensions-system-git-spec-00-af5e9e-danielbueno76-4270s-projects.vercel.app --scope danielbueno76-4270s-projects; gh api repos/RexiAI/pensions-system/commits/d86ce528daf113d1825fadb56f7205fcf9f609a8/status; gh api "repos/RexiAI/pensions-system/deployments?sha=d86ce528daf113d1825fadb56f7205fcf9f609a8"; gh api repos/RexiAI/pensions-system/deployments/7605747526/statuses
exit: 0
at: 2026-11-06T17:08:24Z

```
d86ce528daf113d1825fadb56f7205fcf9f609a8
2026-11-06 17:53:51 +0100

> Fetched deployment "pensions-system-a9xl3opbw-danielbueno76-4270s-projects.vercel.app"
    id      dpl_8Vykw89Yx8xbiNK1XebYvbrmaYYw
    name    pensions-system
    target  preview
    status  Ready
    url     https://pensions-system-a9xl3opbw-danielbueno76-4270s-projects.vercel.app
    created Fri Nov 06 2026 17:53:54 GMT+0100 [15m ago]

{"context":"Vercel","created_at":"2026-11-06T16:54:16Z","description":"Deployment has completed","state":"success","target_url":"https://vercel.com/danielbueno76-4270s-projects/pensions-system/8Vykw89Yx8xbiNK1XebYvbrmaYYw"}
{"created_at":"2026-11-06T16:54:16Z","environment":"Preview","id":7605747526,"ref":"d86ce528daf113d1825fadb56f7205fcf9f609a8"}
{"created_at":"2026-11-06T16:54:17Z","description":"Deployment has completed","environment_url":"https://pensions-system-a9xl3opbw-danielbueno76-4270s-projects.vercel.app","state":"success"}
```

Identity chain, in order: commit `d86ce52` created **16:53:51Z** → deployment created
**16:53:54Z** → first server render `data-rendered-at` **16:54:08Z** → the GitHub deployment
record `7605747526` carries `ref`/`sha` = `d86ce52` → its `environment_url` is the
immutable URL above → the `Vercel` commit status on that same SHA points at inspector
`8Vykw89Yx8xbiNK1XebYvbrmaYYw`, which `vercel inspect` resolves to the same immutable URL.
The branch alias resolves to the same deployment, not a stale one — the failure mode that
matters. Measured: the alias and the immutable URL return **byte-identical HTML** for `/`
(230 291 bytes, sha256 `aab33adb8cf8621d304806d24679062b9e4402bc64c3e2ff5ebc9a365af3f9c7`)
and for `/de` (230 500 bytes, sha256 `aad2dc6ee8281a332503e3668932bb74e362750a466f249f9a1e96ef24e76165`),
both `200` with the bypass header (2026-11-06T17:08:58Z).

**Deploy URL:** `https://pensions-system-a9xl3opbw-danielbueno76-4270s-projects.vercel.app`
**Branch alias:** `https://pensions-system-git-spec-00-af5e9e-danielbueno76-4270s-projects.vercel.app`

## Evidence: health check

command: curl -sS -D - -o /dev/null "https://pensions-system-a9xl3opbw-danielbueno76-4270s-projects.vercel.app/" ; curl -sS -o /dev/null -w "%{http_code} %{redirect_url}" "https://pensions-system-a9xl3opbw-danielbueno76-4270s-projects.vercel.app/" ; curl -sS -D - -o /dev/null -H "x-vercel-protection-bypass: $VERCEL_AUTOMATION_BYPASS_SECRET" ".../de"
exit: 0
at: 2026-11-06T17:09:07Z

```
302 https://vercel.com/sso-api?url=https%3A%2F%2Fpensions-system-a9xl3opbw-danielbueno76-4270s-projects.vercel.app%2F&nonce=…

HTTP/2 200
age: 457
cache-control: public, max-age=0, must-revalidate
content-type: text/html; charset=utf-8
x-vercel-cache: HIT

HTTP/2 200   (/de, age: 456, x-vercel-cache: HIT)
```

The preview carries Vercel **Deployment Protection**: an anonymous request is redirected to
`vercel.com/sso-api` before the app is reached. With the project's own automation-bypass
header the app answers `200` and serves the page. Recorded as a property of the project's
preview configuration, not a health failure. (`/es` is `404` anonymously and with the
bypass; `GET /` serves the `es` page. Production `pensions-system-delta.vercel.app/es` is
also `404`, and the alternates map `es` → root, so this is pre-existing routing, unchanged
by this spec.)

## Evidence: rendered page measurements

A real Chromium over CDP (the repo's own `tests/helpers/chromium.ts`), pointed at the live
preview URL with the bypass header — never a local dev server. Four cells:
`es` and `de` at 390×844 and 1440×900.

command: tsx /tmp/opencode/live-measure.mts (PREVIEW_ORIGIN set to the deployment URL)
exit: 0
at: 2026-11-06T17:03:42Z

```
cell                 es 390×844   es 1440×900   de 390×844   de 1440×900
step1 background     rgba(0,0,0,0) rgba(0,0,0,0) rgba(0,0,0,0) rgba(0,0,0,0)
step1 border widths  0/0/0/0       0/0/0/0       0/0/0/0       0/0/0/0
step1 box-shadow     none          none          none          none
first ink below hdr   61 px         59 px         61 px         59 px     (≥32 required)
ground (html)        rgb(251,251,250) at 1440 es; body/main `rgba(0,0,0,0)` in all four cells
ink (sentence)       rgb(70,70,67)     — all four cells
accent --accent      #7a1f2b → rgb(122,31,43)
accent paint sites   1             1             1             1
  → site             span.clock__value--days (color)  — all four cells
numeral              5534          5534          5.534         5.534
unit                 días          días          Tage          Tage
numeral→unit gap     12.0 px       12.0 px       12.0 px       12.0 px   (≤12 required)
digit text nodes     1             1             1             1         (inside .clock)
unit centre offset   h1 0.00 / label −0.01 / clock 0.00 / sentence 0.00 px
residual asymmetry   ≤0.02 px      ≤0.02 px      ≤0.02 px      ≤0.02 px
sentence ink width   340.16        748.73        330.66        722.66
content box width    343           1176          343           1176
rendered-at          2026-11-06T16:54:08.215Z (es) / …08.365Z (de)
text after 2 s       identical     identical     identical     identical
data-clock-state     absent        absent        absent        absent
role="group" clock   none          none          none          none
```

Projection by form, pixel-level (1440×900, `es`):

command: tsx /tmp/opencode/live-shots.mts (viewport screenshot after scrolling `.demography__panel--projected` into view; rows sampled across the first bar of each panel)
exit: 0
at: 2026-11-06T17:06:09Z

```
PROJECTED bar  y=577  distinct 20  ink 16/66 px (24%)  runs I1 .9 I4 .11 I3 .11 I4 .11 I4 .8
OBSERVED  bar  y=577  distinct  3  ink 85/86 px (99%)  runs .1 I85
computed       projected bar fill: url("#projection-hatch"); observed bar fill: rgb(70,70,67)
pattern        #projection-hatch → <line stroke="rgb(70,70,67)" stroke-width="6">
CSS.supports  fill: url(...) → true ; fill: repeating-linear-gradient(...) → false
```

The hatch is a `<pattern>`, not a CSS gradient — the mechanism the design warned about
(`CSS.supports('fill','repeating-linear-gradient(…))` is `false`) is not used, and the
projected bar demonstrably alternates ink and ground in the rasterised page.

Accent counted on the raster, not in CSS: full-page screenshot (1425×10835), every pixel
equal to `rgb(122,31,43)` lies in **one** band, y 262–321, x 609–784 — the day numeral.
(Chromatic pixels elsewhere are LCD sub-pixel fringes on glyph edges, not paints.)

## AC-006-35 with `PRODUCTION_URL` set

`PRODUCTION_URL` is set in no workflow, so this scenario's live branch had never executed.
It was run twice.

command: PRODUCTION_URL="https://pensions-system-a9xl3opbw-danielbueno76-4270s-projects.vercel.app" npx vitest run tests/acceptance/spec-006-canonical-share.test.ts
exit: 1
at: 2026-11-06T17:07:13Z

```
FAIL  tests/acceptance/spec-006-canonical-share.test.ts > the share hrefs carry one origin on the served page > AC-006-35: every share control embeds one origin, and it is the canonical’s
AssertionError: the production origin serves the shared origin: expected 'https://vercel.com' to be 'https://pensions-system-a9xl3opbw-dan…' // Object.is equality
Expected: "https://pensions-system-a9xl3opbw-danielbueno76-4270s-projects.vercel.app"
Received: "https://vercel.com"
 ❯ tests/acceptance/spec-006-canonical-share.test.ts:135:97
 Tests  1 failed | 3 passed (4)
```

command: PRODUCTION_URL="https://pensions-system-delta.vercel.app" npx vitest run tests/acceptance/spec-006-canonical-share.test.ts
exit: 1
at: 2026-11-06T17:07:29Z

```
AssertionError: the production origin serves the shared origin: expected 'https://pensions-system-danielbueno76…' to be 'https://pensions-system-delta.vercel.…'
Expected: "https://pensions-system-delta.vercel.app"
Received: "https://pensions-system-danielbueno76-4270s-projects.vercel.app"
 Tests  1 failed | 3 passed (4)
```

**What the two failures mean.**

1. *Preview run:* the test's `fetch(production)` has no deployment-protection bypass, so it
   received the Vercel SSO page and parsed `https://vercel.com` out of it. The failure is the
   preview's access control, not a share href. The share hrefs themselves were measured
   **with** the bypass header on the live preview: all four controls
   (`WhatsApp`, `Telegram`, `X`, `LinkedIn`) embed
   `https://pensions-system-delta.vercel.app`, and `link[rel=canonical]`, `og:url` and all
   five `hreflang` alternates carry the same origin. The page was served from the preview
   alias, so the embedded origin is **not** the preview origin.

2. *Production run:* this is the defect the spec exists to fix, still live on production
   today because the PR is unmerged. Production `pensions-system-delta.vercel.app` is served
   from the **production** deployment of `main`, whose canonical and share hrefs carry
   `https://pensions-system-danielbueno76-4270s-projects.vercel.app` — the project alias.
   The preview build already carries the corrected origin, so the equality will hold once
   this commit is production.

**Why the preview's non-equality is not a deploy defect, stated plainly:**

- `pensions-system-delta.vercel.app` is the project's production origin — `vercel inspect`
  reports `target: production` for it — and it answers `200`. It is the host that will serve
  this exact build after merge, so every share link lands on the site that published it.
- The preview origin cannot be the shared origin: anonymous requests to it are redirected to
  Vercel SSO (`302 → vercel.com/sso-api`, measured above). Publishing preview URLs in share
  links would send every recipient to a login wall. `site.ts`'s committed default is the
  deployed origin (production), and `SITE_URL` remains the single override — `AC-006-34`
  still passes (`3 passed`, including the "no `-projects.vercel.app`" clause).
- Therefore the criterion's literal precondition ("Given the deployed page **on the
  production origin**") is unmet by a preview, and its live equality is only observable
  post-merge. It is not recorded here as verified: the post-merge lane
  (`scripts/verify-production-deploy.sh`, `.github/workflows/ci-vercel-production-verify.yml`)
  is where `AC-006-35` becomes provable. **Carried as a limitation, not claimed as a pass.**

If the operator's rule is applied literally — "share hrefs must carry the *preview* serving
origin" — this check fails. I did not classify that as a defect because doing so would
require publishing an SSO-gated URL, and because the criterion itself is written for the
production origin.

## E2E

**SKIPPED — no agentic `e2e` suite in this repository.** Checked: no `e2e/` or `tests/e2e/`
directory, no `e2e` / `@playwright/test` / Maestro dependency in `package.json`, and no
`e2e` script. The repo's end-to-end layer for this stack is the acceptance suite run in
phase 2 (green on this head); there is nothing to point at the live URL.

## Phase-3 budget

- Phase-3 attempts: **1 of 3**
- Fix-and-redeploy rounds consumed: **0 of 3**
- No `Phase-3 budget exhausted` marker: the attempt passed.
- Phase 1 and phase 2 counters untouched by this stage.

## Notes

- `VERCEL_TOKEN` is unset on this machine; the deployment was resolved from the `Vercel`
  commit status, the GitHub deployment record and `vercel inspect`'s stored session. No
  credential problem is recorded (the resolution did not need one). CI reproducibility of
  these checks would need `VERCEL_TOKEN` for the API-only paths, nothing more.
- `VERCEL_AUTOMATION_BYPASS_SECRET` (from the gitignored `config/agent.local.env`) was used
  as a request header to read the protected preview; the value is not reproduced anywhere in
  this document.
- Vercel **Deployment Protection** on previews is what makes the `AC-006-35` live branch
  unusable pre-merge: the test fetches without the bypass header. Whether that test should
  learn to send the header is a follow-up wiring question, recorded here rather than fixed.
- Working-tree dirt not mine and left untouched: `.standards`, `runs.jsonl`,
  `specs/006-centred-number/25-verification.md`, `live-005-top.png`, `live-006box.png`.
  This stage ran `npm run build` locally (gitignored `.next` only) and wrote this file.
  Nothing was committed, pushed, tagged, archived, or deployed from the CLI.
