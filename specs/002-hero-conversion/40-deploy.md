# 40 — Deploy verification

Spec 002 `hero-conversion` · stage 5c (Deploy Verifier) · branch `spec/002-hero-conversion` · PR #9
**Phase-3 attempt 2 of 3** (budget max 3, counter independent of phase 1 and phase 2).
Round 1 (attempt 1) escalated on Vercel Deployment Protection; its record is preserved
verbatim-in-substance at the end of this document under §Round 1 — attempt 1.

Phase 2 was green before this round started (`frontend-ci / Build`, `Unit Tests`,
`Lint & Format` all `SUCCESS` on head `7160df1` — see *Evidence: phase-2 precondition and
head attribution*), so phase 3 was allowed to run.

## Verdict

**Verdict: PASS**

All eight checks now execute against the live preview deployment and all eight pass. The
preview is reachable because the owner configured **Protection Bypass for Automation** on the
Vercel project; this stage reads `VERCEL_AUTOMATION_BYPASS_SECRET` at runtime from the gitignored
`config/agent.local.env` and sends it as `x-vercel-protection-bypass`. The secret value is
redacted from every command and every captured output in this document, and was never echoed,
never printed, and never passed as a CLI flag.

| Field | Value |
|---|---|
| Deploy URL | `https://pensions-system-a5m7zjio2-danielbueno76-4270s-projects.vercel.app` |
| Branch alias | `https://pensions-system-git-spec-00-db19fe-danielbueno76-4270s-projects.vercel.app` |
| Deployment id | `dpl_3epFsQ2HvUUZNvdY9ETpGK1FcFfG` |
| Deployment status | `status: ● Ready`, `target: preview`, build 39s, post-build 17s |
| Build status | **`pass`** — Git integration built head `7160df1`; see *Evidence: deployment state* |
| Health check status | **`pass`** — `200` on `/` and on all four non-default locales with the bypass header (`302` without it — the control request) |
| E2E verdict | **`pass`** — the eight-check browser journey executed against the live preview URL (see §E2E on the live preview: what ran and what did not) |
| Timestamp | 2026-10-30T08:21:19Z |
| Phase-3 attempt count | **2** (of 3) |
| Deploy command run | **none** — `vercel deploy` / `vercel deploy --prod` were never invoked, and are denied in this agent's frontmatter |
| Phase-3 budget marker | **not written** — `Phase-3 budget exhausted` belongs to the 3rd *failed* round; round 2 passed |
| Protection bypass | `x-vercel-protection-bypass` read at runtime from `config/agent.local.env`; value redacted throughout |

## What changed between round 1 and round 2

One thing: the access condition. Round 1's diagnosis was that the `302 → vercel.com/sso-api`
came from Vercel's edge, not from the application, and that `vercel logs` showing `0` records
meant no request had reached the app. Round 2 confirms both halves of that diagnosis with a
direct control:

- With `x-vercel-protection-bypass`: `200`, 215 756 bytes of server-rendered HTML, `lang="es"`.
- Without the header, same URL, same second: `302 → vercel.com/sso-api` (see *Evidence: control
  request without the bypass header*).

The deployment was **not** rebuilt for this round. `dpl_3epFsQ2HvUUZNvdY9ETpGK1FcFfG` is the
deployment round 1 inspected, still `Ready`, created 2026-10-29T22:12:49Z and immutable. Nothing
in the application changed between the two rounds; only its reachability did.

## Deployment under test

| Item | Value |
|---|---|
| Vercel project | `pensions-system` (`prj_ZS8blMFO18fwOrMaJfRJAEJgqZbz`) |
| Team / scope | `danielbueno76-4270s-projects` (`team_zhU6yZm1eKX0jOZX7UFAkt6p`) |
| Repository | `RexiAI/pensions-system` |
| Branch | `spec/002-hero-conversion` |
| Head commit | `7160df18020dd8e7ccf580b60e754a44075f0ec6` |
| Commit time | 2026-10-29T22:12:43Z (`2026-10-29T23:12:43+01:00`) |
| Deployment created | 2026-10-29T22:12:49Z — **6 s after the commit**, i.e. the Git integration built this commit |
| Attribution | The PR's `Vercel` check run for head `7160df1` links to `dpl_3epFsQ2HvUUZNvdY9ETpGK1FcFfG` — resolved from the check run, not from a remembered string |
| Aliases | git branch alias only; no custom domain assigned to this project |

**Correspondence with the pushed head, stated precisely.** The round-2 brief described the branch
as carrying local commits not yet pushed. That is not the case, and the measurement says so:
`git ls-remote origin refs/heads/spec/002-hero-conversion` returns `7160df1` and
`git rev-list --left-right --count origin/spec/002-hero-conversion...HEAD` returns `0 0` — zero
commits ahead, zero behind. Local `HEAD` **is** the pushed head **is** the deployed commit.

What the working tree does carry is **uncommitted** modification: `.gitignore`, three spec
markdown files, `specs/002-hero-conversion/25-verification.md` (the phase-2 round-1 evidence
block appended by the previous stage), `tests/acceptance/first-viewport.test.ts` (a two-line
line-break reformat) and `tests/acceptance/gitignore.test.ts`, plus untracked `runs.jsonl`.
**The preview does not include any of it** — it is not committed, so it is not in `7160df1` and
not in the build. Nothing tracked under `web/` is modified (`git diff --stat HEAD -- web/` is
empty), which is what makes the local-build comparison in *Evidence: local production build*
meaningful. This stage changed none of it: nothing was stashed, committed, reverted or edited.

## Evidence: deployment state

command: `vercel inspect 3epFsQ2HvUUZNvdY9ETpGK1FcFfG --scope danielbueno76-4270s-projects`
exit: 0
at: 2026-10-30T08:20:38Z

```
Vercel CLI 64.5.0 (Node.js 24.21.0)
Fetching deployment "dpl_3epFsQ2HvUUZNvdY9ETpGK1FcFfG" in danielbueno76-4270s-projects
> Fetched deployment "pensions-system-a5m7zjio2-danielbueno76-4270s-projects.vercel.app" in danielbueno76-4270s-projects [584ms]

  General

    id		dpl_3epFsQ2HvUUZNvdY9ETpGK1FcFfG
    name	pensions-system
    target	preview
    status	● Ready
    url		https://pensions-system-a5m7zjio2-danielbueno76-4270s-projects.vercel.app
    created	Thu Oct 29 2026 23:12:49 GMT+0100 (Central European Standard Time) [10h ago]

  Build Machine

    requested build machine basic
    actual assigned cores   2 vCPU (actual assignment)
    memory                  8192 MiB
    selection type          fixed
    selection source        plan-default

  Duration

    build duration	39s
    post-build duration	17s
    billable duration	1m
    CPU Minutes Usage	2 minutes (1m x 2vCPU)

  Aliases

    ╶ https://pensions-system-git-spec-00-db19fe-danielbueno76-4270s-projects.vercel.app
```

## Evidence: phase-2 precondition and head attribution

command: `gh pr checks 9 --json name,state,bucket --jq '.[] | "\(.bucket)\t\(.state)\t\(.name)"'`
exit: 0
at: 2026-10-30T08:21:19Z

```
skipping	SKIPPED	frontend-ci / Docker Build & Push
pass	SUCCESS	frontend-ci / Build
pass	SUCCESS	Vercel Preview Comments
pass	SUCCESS	frontend-ci / Unit Tests
pass	SUCCESS	frontend-ci / Lint & Format
pass	SUCCESS	Vercel
```

command: `git ls-remote origin refs/heads/spec/002-hero-conversion && git rev-list --left-right --count origin/spec/002-hero-conversion...HEAD && git rev-parse HEAD && gh pr checks 9 --json name,state,bucket,workflow,link --jq '.[] | select(.name=="Vercel")'`
exit: 0
at: 2026-10-30T08:21:14Z

```
7160df18020dd8e7ccf580b60e754a44075f0ec6	refs/heads/spec/002-hero-conversion
0	0
7160df18020dd8e7ccf580b60e754a44075f0ec6
{"bucket":"pass","link":"https://vercel.com/danielbueno76-4270s-projects/pensions-system/3epFsQ2HvUUZNvdY9ETpGK1FcFfG","name":"Vercel","state":"SUCCESS","workflow":""}
```

The `Vercel` check run's `link` is how the deployment under test was identified in this round: the
URL was read out of the check run for head `7160df1`, never carried over from round 1's text.

## Evidence: health check `GET /` with protection bypass

command: `curl -sS -D - -o /tmp/r2-h1.html -w 'http=%{http_code} time=%{time_total}s size=%{size_download} redirect=%{redirect_url}\n' --max-time 60 -H "x-vercel-protection-bypass: $VERCEL_AUTOMATION_BYPASS_SECRET" https://pensions-system-a5m7zjio2-danielbueno76-4270s-projects.vercel.app/`
exit: 0
at: 2026-10-30T08:20:43Z

```
http=200 time=0.199905s size=215756 redirect=
HTTP/2 200 
accept-ranges: bytes
access-control-allow-origin: *
age: 432
cache-control: public, max-age=0, must-revalidate
content-disposition: inline
content-type: text/html; charset=utf-8
date: Fri, 30 Oct 2026 08:20:43 GMT
etag: "26d7a533a60adf00a99040b6b7469972"
server: Vercel
strict-transport-security: max-age=63072000; includeSubDomains; preload
vary: rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch
x-matched-path: /
x-nextjs-prerender: 1
x-robots-tag: noindex
x-vercel-cache: PRERENDER
content-length: 215756
```

`$VERCEL_AUTOMATION_BYPASS_SECRET` was read from `config/agent.local.env` at runtime. Its value is
32 characters and is redacted here and everywhere else in this document; the length is the only
property recorded, and the header value was never echoed to stdout.

## Evidence: control request without the bypass header

command: `curl -sS -o /dev/null -w 'http=%{http_code} redirect=%{redirect_url}\n' --max-time 30 https://pensions-system-a5m7zjio2-danielbueno76-4270s-projects.vercel.app/`
exit: 0
at: 2026-10-30T08:20:43Z

```
http=302 redirect=https://vercel.com/sso-api?url=https%3A%2F%2Fpensions-system-a5m7zjio2-danielbueno76-4270s-projects.vercel.app%2F&nonce=ba5324272f98201d214212a93424e2353290d07ec70ae48933e296b404459010
```

Same URL, same second, no header — still `302` to the SSO edge. The bypass header is doing the
work and the preview has **not** been left open to the public. This is also the positive control
that round 1 lacked: `200`-with-header next to `302`-without-header proves the `200` came from the
application, not from a protection setting that had been disabled account-wide.

## Evidence: five locales render

command: `for loc in "" en fr de it; do curl -sS -o /tmp/r2-l.html -w '%{http_code}' --max-time 60 -H "x-vercel-protection-bypass: $VERCEL_AUTOMATION_BYPASS_SECRET" "$URL/$loc"; done`
exit: 0
at: 2026-10-30T08:20:43Z → 2026-10-30T08:20:44Z

```
GET / -> 200  <html lang="es"  <title>pensiones · España</title>
GET /en -> 200  <html lang="en"  <title>pensiones · Spain</title>
GET /fr -> 200  <html lang="fr"  <title>pensiones · Espagne</title>
GET /de -> 200  <html lang="de"  <title>pensiones · Spanien</title>
GET /it -> 200  <html lang="it"  <title>pensiones · Spagna</title>
```

## Evidence: deployed stylesheet — accent tokens

command: `curl -sS -o /tmp/r2-css3.css -w 'css http=%{http_code} size=%{size_download}\n' -H "x-vercel-protection-bypass: $VERCEL_AUTOMATION_BYPASS_SECRET" "$URL/_next/static/immutable/chunks/37zq0gke2eu09.css" && sha256sum /tmp/r2-css3.css && grep -o -- '--accent:[^;}]*' /tmp/r2-css3.css && echo "old-hex-total: $(grep -o -i -e 425425 -e 9cc17f /tmp/r2-css3.css | wc -l)" && echo "font-face-count: $(grep -o '@font-face' /tmp/r2-css3.css | wc -l)" && grep -o -- '--rule-projection:[^;}]*' /tmp/r2-css3.css && grep -o '\.clock{[^}]*}' /tmp/r2-css3.css`
exit: 0
at: 2026-10-30T08:22:22Z

```
css http=200 size=37462
f99e37e32d54aaf695b9aae892b86e38547c3ac183bb11d553467e15de6e8e8f  /tmp/r2-css3.css
--accent:#3b5512
--accent:#91c46d
old-hex-total: 0
font-face-count: 0
--rule-projection:3px
.clock{margin-top:var(--space-4);text-align:center;justify-self:stretch}
```

The `#3b5512` declaration sits in the `:root` token block (light theme); `#91c46d` sits in the
`[data-theme=dark]` block. The two superseded hexes (`#425425` light, `#9cc17f` dark) do not
appear anywhere in the served stylesheet. `.clock`'s rule carries **no `border-top`** — the
separator is gone from the declaration, not merely overridden. `--rule-projection: 3px` is intact,
which is the height the projection rule above the year line still uses.

The `@font-face` count of `0` is recorded here because it becomes material in
§Discrepancy with the recorded local measurement, below.

## Evidence: eight-check browser journey against the live preview (checks 1–5, 7, 8)

command: `node /tmp/r2-final.cjs` (Playwright 153.0.8010.12, real Chromium,
`newContext({ viewport: 390x844, extraHTTPHeaders: { 'x-vercel-protection-bypass': $VERCEL_AUTOMATION_BYPASS_SECRET } })`, `PREVIEW_URL=https://pensions-system-a5m7zjio2-danielbueno76-4270s-projects.vercel.app`)
exit: 0
at: 2026-10-30T08:20:18Z → 2026-10-30T08:20:30Z

```
browser: 153.0.8010.12
base: https://pensions-system-a5m7zjio2-danielbueno76-4270s-projects.vercel.app
bypass header sent: x-vercel-protection-bypass (value redacted)

CHECK 1+2+3+4+5+7+8 — per locale, viewport 390x844
/    http=200 lang=es title="pensiones · España"
     accent=#3b5512 clock: top=424.91 bottom=768.08 clearance=75.92 (viewport 844, limit 794)
     clock present: border-top=0px hr-inside=0 rule-inside=0 numerals-inside=16 sub-rows-inside=3
     countdown__rule count=1 height=3px bg=rgb(107, 82, 10) above-year-line=true
     cta=1 "Ver cuánto te queda" bg=rgb(59, 85, 18) | cta2=1 "Cómo se calcula" bg=rgba(0, 0, 0, 0) color=rgb(71, 57, 42)
     consoleErrors=0 pageErrors=0

/en  http=200 lang=en title="pensiones · Spain"
     accent=#3b5512 clock: top=424.91 bottom=768.08 clearance=75.92 (viewport 844, limit 794)
     clock present: border-top=0px hr-inside=0 rule-inside=0 numerals-inside=16 sub-rows-inside=3
     countdown__rule count=1 height=3px bg=rgb(107, 82, 10) above-year-line=true
     cta=1 "See your figure" bg=rgb(59, 85, 18) | cta2=1 "How it is calculated" bg=rgba(0, 0, 0, 0) color=rgb(71, 57, 42)
     consoleErrors=0 pageErrors=0

/fr  http=200 lang=fr title="pensiones · Espagne"
     accent=#3b5512 clock: top=424.91 bottom=768.08 clearance=75.92 (viewport 844, limit 794)
     clock present: border-top=0px hr-inside=0 rule-inside=0 numerals-inside=16 sub-rows-inside=3
     countdown__rule count=1 height=3px bg=rgb(107, 82, 10) above-year-line=true
     cta=1 "Voir votre montant" bg=rgb(59, 85, 18) | cta2=1 "Comment on calcule" bg=rgba(0, 0, 0, 0) color=rgb(71, 57, 42)
     consoleErrors=0 pageErrors=0

/de  http=200 lang=de title="pensiones · Spanien"
     accent=#3b5512 clock: top=424.91 bottom=787.52 clearance=56.48 (viewport 844, limit 794)
     clock present: border-top=0px hr-inside=0 rule-inside=0 numerals-inside=16 sub-rows-inside=3
     countdown__rule count=1 height=3px bg=rgb(107, 82, 10) above-year-line=true
     cta=1 "Deinen Betrag sehen" bg=rgb(59, 85, 18) | cta2=1 "Wie gerechnet wird" bg=rgba(0, 0, 0, 0) color=rgb(71, 57, 42)
     consoleErrors=0 pageErrors=0

/it  http=200 lang=it title="pensiones · Spagna"
     accent=#3b5512 clock: top=424.91 bottom=768.08 clearance=75.92 (viewport 844, limit 794)
     clock present: border-top=0px hr-inside=0 rule-inside=0 numerals-inside=16 sub-rows-inside=3
     countdown__rule count=1 height=3px bg=rgb(107, 82, 10) above-year-line=true
     cta=1 "Vedere quanto ti resta" bg=rgb(59, 85, 18) | cta2=1 "Come si calcola" bg=rgba(0, 0, 0, 0) color=rgb(71, 57, 42)
     consoleErrors=0 pageErrors=0

CHECK 4 — accent, both themes (desktop viewport)
light --accent=#3b5512  dark[data-theme=dark] --accent=#91c46d
dark: hero__cta bg=rgb(145, 196, 109)  hero__cta-secondary color=rgb(203, 190, 173)
```

Notes on individual checks, read off the above:

- `rgb(59, 85, 18)` is `#3b5512`; `rgb(107, 82, 10)` is `#6b520a` (`--data-projection`, the ochre
  the projection rule is drawn in); `rgb(71, 57, 42)` is `#47392a` (`--ink-2`); `rgb(145, 196, 109)`
  is `#91c46d`.
- `numerals-inside=16` reads "the `.clock` element contains exactly one `.countdown__numeral`,
  whose text is `16`" — the years numeral is inside the group, not beside it.
- `hr-inside=0` and `rule-inside=0` are measured against the `.clock` subtree, so the page's four
  other `<hr>` elements (the hero panel rules) are correctly excluded.
- `above-year-line=true` compares the projection rule's `getBoundingClientRect().bottom` against
  the year line's `top`: `158.44 ≤ 166.44`. The 3px ochre rule is still there, still above the year.
- CTA hierarchy is one `.hero__cta` (filled `#3b5512`, text `--on-accent` `#fdf2e1`) and exactly
  one `.hero__cta-secondary` (transparent background, `--ink-2` ink, no accent).

`/tmp/r2-final.cjs` is a throwaway verification harness written for this round — it is not
committed, and it is not production code. It launches Chromium directly
(`playwright.chromium.launch`), reads the bypass secret from `config/agent.local.env` itself so the
value never crosses a tool argument, and prints the block above verbatim. The same harness with
`PREVIEW_URL=http://127.0.0.1:3199` produces the local-build block further down.

## Evidence: zero-JS first paint (check 6)

command: `node /tmp/r2-final.cjs` — `newContext({ viewport: 390x844, javaScriptEnabled: false, extraHTTPHeaders: { 'x-vercel-protection-bypass': $VERCEL_AUTOMATION_BYPASS_SECRET } })`
exit: 0
at: 2026-10-30T08:20:18Z → 2026-10-30T08:20:30Z

```
CHECK 6 — zero-JS (javascriptEnabled: false), 390x844
/    http=200 hero=true clock=true numeral=16 subRows=3 clockBottom=768.08 ctaBg=rgb(59, 85, 18) textLen=10480
/en  http=200 hero=true clock=true numeral=16 subRows=3 clockBottom=768.08 ctaBg=rgb(59, 85, 18) textLen=10141
/fr  http=200 hero=true clock=true numeral=16 subRows=3 clockBottom=768.08 ctaBg=rgb(59, 85, 18) textLen=10834
/de  http=200 hero=true clock=true numeral=16 subRows=3 clockBottom=787.52 ctaBg=rgb(59, 85, 18) textLen=10632
/it  http=200 hero=true clock=true numeral=16 subRows=3 clockBottom=768.08 ctaBg=rgb(59, 85, 18) textLen=10419
```

With script execution disabled in the context, the hero, the years numeral, the three sub-day
fields and the accent-filled primary CTA are all present in every locale — they are
server-rendered, and the same geometry is reproduced (`de` is 787.52 here too, which is an
independent confirmation that the fold result does not depend on the client ticker running).

## Evidence: local production build of the same head reproduces every measured value

This block exists to answer one question: does the **deployed** artifact match a build of the same
commit, or has the deployment drifted? The build was made from the working tree, and `web/` is
byte-identical to `HEAD` (`git diff --stat HEAD -- web/` empty), so it serves `7160df1`'s source.

command: `npm run build` && `PORT=3199 npx next start -p 3199` && `PREVIEW_URL=http://127.0.0.1:3199 node /tmp/r2-node.cjs`
exit: 0, 0, 0
at: 2026-10-30T08:18:52Z (build finished) · 2026-10-30T08:19:16Z (measurement)

```
LOCAL BUILD of HEAD (next start, same Chromium)
/     http=200 lang=es clockTop=424.91 clockBottom=768.08 clearance=75.92 height=343.17 borderTop=0px hrInClock=0 ruleInClock=0 numeral='16' subs=3 ruleH=3px ruleBg=rgb(107, 82, 10) ruleAbove=True accent=#3b5512 ctaBg=rgb(59, 85, 18) cta2Bg=rgba(0, 0, 0, 0) cta2Color=rgb(71, 57, 42) console=[] pageerr=[]
/en   http=200 lang=en clockTop=424.91 clockBottom=768.08 clearance=75.92 height=343.17 borderTop=0px hrInClock=0 ruleInClock=0 numeral='16' subs=3 ruleH=3px ruleBg=rgb(107, 82, 10) ruleAbove=True accent=#3b5512 ctaBg=rgb(59, 85, 18) cta2Bg=rgba(0, 0, 0, 0) cta2Color=rgb(71, 57, 42) console=[] pageerr=[]
/fr   http=200 lang=fr clockTop=424.91 clockBottom=768.08 clearance=75.92 height=343.17 borderTop=0px hrInClock=0 ruleInClock=0 numeral='16' subs=3 ruleH=3px ruleBg=rgb(107, 82, 10) ruleAbove=True accent=#3b5512 ctaBg=rgb(59, 85, 18) cta2Bg=rgba(0, 0, 0, 0) cta2Color=rgb(71, 57, 42) console=[] pageerr=[]
/de   http=200 lang=de clockTop=424.91 clockBottom=787.52 clearance=56.48 height=362.61 borderTop=0px hrInClock=0 ruleInClock=0 numeral='16' subs=3 ruleH=3px ruleBg=rgb(107, 82, 10) ruleAbove=True accent=#3b5512 ctaBg=rgb(59, 85, 18) cta2Bg=rgba(0, 0, 0, 0) cta2Color=rgb(71, 57, 42) console=[] pageerr=[]
/it   http=200 lang=it clockTop=424.91 clockBottom=768.08 clearance=75.92 height=343.17 borderTop=0px hrInClock=0 ruleInClock=0 numeral='16' subs=3 ruleH=3px ruleBg=rgb(107, 82, 10) ruleAbove=True accent=#3b5512 ctaBg=rgb(59, 85, 18) cta2Bg=rgba(0, 0, 0, 0) cta2Color=rgb(71, 57, 42) console=[] pageerr=[]

light: {'accent': '#3b5512'} dark: {'before': '#3b5512', 'after': '#91c46d', 'ctaBg': 'rgb(145, 196, 109)', 'cta2Color': 'rgb(203, 190, 173)'}
```

Deployed and local-build values are **identical on every measured property in every locale**,
including the per-locale clock heights (`343.17` es/en/fr/it, `362.61` de), the console-error count
(`0`), and both accents. The deployed artifact is the same artifact a local build of this commit
produces. A further cross-check: the hero markup of `/fr` is 2 809 bytes on both sides and differs
only in the live clock numerals (`5542` vs `5541` days) — the pages are the same HTML with a
different tick.

The `.next/` output the build wrote is gitignored (`git check-ignore` → `.gitignore:2:.next/`), and
`git status --short` was byte-identical before and after the build. No deployment was created: this
is a local `next build`/`next start`, not a Vercel build.

## Evidence: runtime log query (round 2)

command: `vercel logs --deployment https://pensions-system-a5m7zjio2-danielbueno76-4270s-projects.vercel.app --scope danielbueno76-4270s-projects`
exit: 0
at: 2026-10-30T08:20:47Z

```
{"type":"summary","recordsReturned":0,"timeRange":{"start":"2026-10-30T07:50:48.404Z","end":"2026-10-30T08:20:48.404Z"},"pagination":{"hasMore":false,"next":null},"excludedIntervals":[]}
```

Still `0` records over a window that contains several hundred served requests — and this time the
requests demonstrably succeeded. The explanation is visible in the health-check headers:
`x-vercel-cache: PRERENDER` and `x-nextjs-prerender: 1`. These routes are fully prerendered and
served from the CDN, so no serverless function is invoked and there is no runtime log to return.

Recorded as a correction to round 1's reasoning: `recordsReturned: 0` on its own does **not**
prove "no request reached the application" for a prerendered deployment — it only proves no
function ran. Round 1's conclusion was still right, but the decisive evidence there was the `302`,
not the zero. `vercel logs` is not a usable diagnostic for this deployment's runtime behaviour.

## Per-check verdicts

| # | Check | Verdict | Evidence |
|---|---|---|---|
| 1 | `GET /` returns 2xx | **pass** | `200`, 215 756 B, `lang="es"` |
| 2 | `/en`, `/fr`, `/de`, `/it` each render | **pass** | `200` each, correct `lang` and title (5/5) |
| 3 | Years numeral + sub-day row inside one group; separator absent; 3px ochre rule still above the year line | **pass** | `.clock` `border-top: 0px`; 0 `<hr>` and 0 `.countdown__rule` inside `.clock`; one `.countdown__numeral` inside it; `.countdown__rule` count 1, `3px`, `rgb(107, 82, 10)`, bottom `158.44` ≤ year-line top `166.44` |
| 4 | New accent applied, old absent | **pass** | `--accent:#3b5512` light, `#91c46d` on `[data-theme=dark]`; compound styles resolve to `rgb(59,85,18)` / `rgb(145,196,109)`; `#425425` and `#9cc17f` appear 0 times in the served stylesheet |
| 5 | One dominant filled primary CTA + one non-accent secondary | **pass** | 1 × `.hero__cta` filled `rgb(59,85,18)`; 1 × `.hero__cta-secondary`, background transparent, ink `rgb(71,57,42)` |
| 6 | Zero-JS: hero and clock render | **pass** | With `javaScriptEnabled: false`, all five locales: hero, `16`, 3 sub-day rows, accent CTA |
| 7 | Clock bottom ≤ 844 − 50 = 794 at 390×844, every locale | **pass** | es 768.08 (75.92 clearance), en 768.08 (75.92), fr 768.08 (75.92), **de 787.52 (56.48)**, it 768.08 (75.92) — worst case 6.48 px inside the limit |
| 8 | No console errors on first paint | **pass** | `consoleErrors=0 pageErrors=0` in all five locales |

Check 7 passes, but see the finding immediately below: the locale that binds is **de**, not **fr**
as the repository's recorded measurement states.

## Discrepancy with the recorded local measurement (finding, not a blocker)

The round-2 brief expected `es/en/de/it 768.08` and `fr 787.52`. The deployed artifact — and a
local build of the same commit measured in the same Chromium, and the zero-JS render — all produce
the opposite attribution: **de 787.52, fr 768.08**. Both figures appear in the repo, attached to
the wrong locale:

- `tests/acceptance/first-viewport.test.ts:150` (`MEASURED_CLOCK_BY_LOCALE`) records
  `fr: { clock: [444.34, 787.52] }` and `de: { clock: [424.91, 768.08] }`.
- The PR body's "How to verify" step 3 states "measured clearance: es/en/de/it 75.92px,
  fr 56.48px".

Measured cause, from the deployed page:

```
element                               /      /en      /fr      /de      /it
.clock__fields                      131      131      131   150.44      131
.clock__anchor                    48.59    48.59    48.59    48.59    48.59
.clock__definition                97.19    97.19    97.19    97.19    97.19
```

```
/de   sub label='Stunden' fieldH=67.17 labelH=38.88 labelW=48    labelFS=12px lh=19.44px ws=normal
/fr   sub label='heures'  fieldH=47.73 labelH=19.44 labelW=40.91 labelFS=12px lh=19.44px ws=normal
```

German's hours label `Stunden` measures exactly `48px` — the value of `--clock-sub-col: 3rem` —
so it wraps to a second line, its grid row grows by one `19.44px` line, and the whole clock grows
from `343.17` to `362.61`. French's `heures` (`40.91px`) fits and does not wrap. The record's
`fr` entry instead shows the clock **starting** 19.43 px lower (`444.34` vs `424.91`), which is the
signature of an extra line in the projection block **above** the clock — a different mechanism
that does not reproduce here in either build.

The reason both numbers travel without contradiction is that nothing measures them
mechanically: the suite asserts only inequalities against these constants
(`bottom <= 844 - 50`, `fields[1] <= 844`, `clock[0] >= 0`), and the `tokens.css` comment check
requires the strings `75.92` and `56.48` to be present, not to be attached to the right locale. A
swapped attribution passes all of it.

The likely driver is font metrics: the served stylesheet contains **no `@font-face` at all** (see
*Evidence: deployed stylesheet*), so `--font-sans: 'Instrument Sans', system-ui, …` falls back to
whatever `system-ui` the client resolves. `Stunden` sitting at exactly the 48 px column width means
the wrap is decided by font metrics, so the per-locale clearance figures are a property of the
measuring client, not of the artifact. On a client with wider metrics than this one, German would
still wrap (it already does) but could tip past the 794 limit; nothing currently measures that.

**Verdict impact: none for this gate.** The deployed artifact satisfies the check-7 criterion in
every locale (worst case `787.52 ≤ 794`), which is what the gate asserts. The defect is in the
recorded numbers and their attribution, not in the deployed behaviour.

**Routing: recorded, not fixed, not re-routed.** This is neither an E2E-exit-code failure against
the live preview (the deployed artifact passes), nor a Vercel configuration-classified error, nor a
structural gate failure, and it is not an ambiguous build or health-check failure — the cause is
established, not ambiguous. Per the Stop-and-Ask matrix's *Out-of-scope finding* row, this stage
records it and proposes a follow-up rather than fixing it: stage 5c writes no production code and
commits nothing. Proposed follow-up (a small docs/fixture spec, not a behaviour fix): re-measure
`MEASURED_CLOCK_BY_LOCALE` per locale on two font stacks, correct the `fr`/`de` rows, and decide
whether the fold guarantee should be asserted against a named font stack instead of `system-ui`.

## E2E on the live preview: what ran and what did not

The E2E lane for this spec **was** executed against the live preview URL (never a local dev
server): the eight-check browser journey in §Evidence: eight-check browser journey is that
execution, driven through a real Chromium with the bypass header on the context, at 390×844, in all
five locales, with console and page-error capture on first paint. Its verdict is `pass`.

What did **not** happen is a delegation to the `e2e-runner` subagent, and the reason is recorded
rather than glossed: this repository has no agentic E2E suite to run. There is no `e2e/` directory,
no `playwright.config.*`, no `*.e2e.*` file, and no `e2e` script in `package.json`; the
`skills/e2e-testing` standard applies to child repos that have adopted the `e2e` framework, and this
one has not. Authoring a suite is outside stage 5c's mandate — this stage verifies, it does not
write tests or production code. Recording the gap is the honest option; inventing a runner
invocation that could only report "no suite" would have produced a meaningless exit code.

No non-zero runner exit was consumed, so no behaviour fix was routed to `spec-coder`.

## Fix routing

| Lane | Applies? | Reason |
|---|---|---|
| E2E runner non-zero → `spec-coder` (behaviour) | **no** | The live-preview journey exited 0; eight of eight checks pass. |
| Vercel configuration-classified error → self-retry after repair | **no** | The round-1 access condition was resolved by the owner's Protection Bypass configuration; nothing remains mis-configured. `vercel.json`, framework preset and project env vars were not changed by this stage. |
| Structural / complexity gate → `spec-refactorer` | **no** | No gate ran and none failed; the cloud build is green. |
| Ambiguous build/health failure → STOP and escalate | **no** | Neither applies: the build is `Ready` with no failure to classify, and the health check is `200`. The one anomaly (the fr/de attribution) has a measured cause and is recorded as an out-of-scope finding, not an ambiguous failure. |

**Routing: no fix to route. Phase-3 round 2 ends with `Verdict: PASS`.** Nothing was committed,
pushed, tagged, or PR-edited; the archive (stage 5d) is unblocked.

## Conditions resolved per the Stop-and-Ask matrix

| Condition | Resolution |
|---|---|
| Working tree dirty | Encountered and left untouched. Modified paths: `.gitignore`, three spec markdown files, `25-verification.md` (the phase-2 round-1 evidence block appended by a prior stage), `tests/acceptance/first-viewport.test.ts` (a two-line reformat), `tests/acceptance/gitignore.test.ts`, plus untracked `runs.jsonl`. Nothing was stashed, committed, reverted or edited. `git diff --stat HEAD -- web/` is empty, which is what made the local-build comparison valid. Recorded, not resolved. |
| Local commits not yet pushed | Investigated and found **not** to be the case: `git ls-remote` returns `7160df1`, ahead/behind is `0 0`. What exists is uncommitted working-tree modification, which the preview does not include. Stated explicitly under §Deployment under test. |
| Protection bypass secret absent or rejected | Not encountered. The secret was present (32 characters) and accepted on the first request; a control request without it still returns `302`, so the header is what is being honoured. |
| Design / structural gate | Not applicable at this stage; none run. |
| Version bump / git tag | Not requested, not created. CI owns versioning. |

## Prohibitions honoured

- **No deployment was created.** `vercel deploy` / `vercel deploy --prod` were never invoked; the
  Git integration remains the only builder in this lane. The `vercel deploy*` command is denied in
  this agent's `permission.bash` frontmatter and was not attempted.
- Only `vercel inspect` and `vercel logs` were run this round — both observation. No `env add`, no
  `pull`, no `domains` mutation.
- **The bypass secret was never printed, echoed, or passed as a flag.** It was read from the
  gitignored `config/agent.local.env` into a shell variable (and, in the Playwright script, read
  from the same file by the script itself, so it never crossed a tool argument), sent only as the
  `x-vercel-protection-bypass` request header, and redacted from every command and captured output
  in this document. Its length is the only property recorded anywhere.
- `VERCEL_TOKEN` was never printed and never passed as a `--token` flag; the CLI used its existing
  per-machine session.
- Nothing was committed, pushed, tagged, or PR-edited. `specs/002-hero-conversion/00-informal.md`
  was never read.

---

# Round 1 — attempt 1 (ESCALATED) — historical record, preserved

Round 1 ended in `Verdict: ESCALATED` for the reason recorded below. It is kept because the
escalation is part of this spec's audit trail and because round 2 is only meaningful against it.
Evidence headings in this appendix are demoted to `###` to keep them distinguishable from round 2's
`##` blocks; the commands, exit codes, timestamps and outputs are the originals, unedited.

**Round-1 verdict: ESCALATED.**

The Vercel build of the PR head **succeeded** (`status: Ready`, 39s). The live surface could **not**
be checked: Vercel Deployment Protection gated the preview and every unauthenticated request was
answered by Vercel's SSO edge with a `302` before the application was reached. Both available
observation clients — `curl` and a real Chromium (`playwright`) — hit that wall, and `vercel logs`
returned **zero** records for the deployment.

| Round-1 field | Value |
|---|---|
| Deploy URL | `https://pensions-system-a5m7zjio2-danielbueno76-4270s-projects.vercel.app` |
| Deployment id | `dpl_3epFsQ2HvUUZNvdY9ETpGK1FcFfG` (the same deployment round 2 verified) |
| Build status | `pass` — `status: ● Ready`, `target: preview`, build 39s, post-build 17s |
| Health check status | `fail (blocked)` — `302` to `vercel.com/sso-api` on `/` and `/en` |
| E2E verdict | `skip (blocked)` — target unreachable |
| Timestamp | 2026-10-29T22:17:47Z |
| Phase-3 attempt count | 1 (of 3) |
| Deploy command run | none |
| Phase-3 budget marker | not written — belongs to the 3rd failed round |

### Round 1 — Evidence: deployment state

command: `vercel inspect 3epFsQ2HvUUZNvdY9ETpGK1FcFfG --scope danielbueno76-4270s-projects`
exit: 0
at: 2026-10-29T22:16:50Z

```
Vercel CLI 64.5.0 (Node.js 24.21.0)
Fetching deployment "dpl_3epFsQ2HvUUZNvdY9ETpGK1FcFfG" in danielbueno76-4270s-projects
> Fetched deployment "pensions-system-a5m7zjio2-danielbueno76-4270s-projects.vercel.app" in danielbueno76-4270s-projects [532ms]

  General

    id		dpl_3epFsQ2HvUUZNvdY9ETpGK1FcFfG
    name	pensions-system
    target	preview
    status	● Ready
    url		https://pensions-system-a5m7zjio2-danielbueno76-4270s-projects.vercel.app
    created	Thu Oct 29 2026 23:12:49 GMT+0100 (Central European Standard Time)

  Aliases

    ╶ https://pensions-system-git-spec-00-db19fe-danielbueno76-4270s-projects.vercel.app
```

### Round 1 — Evidence: head-commit attribution

command: `gh api repos/RexiAI/pensions-system/commits/7160df18020dd8e7ccf580b60e754a44075f0ec6/check-runs --jq '.check_runs[] | {name, conclusion, status, details_url}'`
exit: 0
at: 2026-10-29T22:15:40Z

```
{"conclusion":"skipped","details_url":"https://github.com/RexiAI/pensions-system/actions/runs/40964107401/job/123764640883","id":123764640883,"name":"frontend-ci / Docker Build & Push","status":"completed","target_url":null}
{"conclusion":"success","details_url":"https://github.com/RexiAI/pensions-system/actions/runs/40964107401/job/123764401186","id":123764401186,"name":"frontend-ci / Build","status":"completed","target_url":null}
{"conclusion":"success","details_url":"https://vercel.com/github","id":123764351378,"name":"Vercel Preview Comments","status":"completed","target_url":null}
{"conclusion":"success","details_url":"https://github.com/RexiAI/pensions-system/actions/runs/40964107401/job/123764076721","id":123764076721,"name":"frontend-ci / Unit Tests","status":"completed","target_url":null}
{"conclusion":"success","details_url":"https://github.com/RexiAI/pensions-system/actions/runs/40964107401/job/123764076185","id":123764076185,"name":"frontend-ci / Lint & Format","status":"completed","target_url":null}
```

### Round 1 — Evidence: health check `GET /`

command: `curl -sS -o /tmp/home.html -w 'http=%{http_code} time=%{time_total}s size=%{size_download} redirect=%{redirect_url}\n' --max-time 45 https://pensions-system-a5m7zjio2-danielbueno76-4270s-projects.vercel.app/`
exit: 0
at: 2026-10-29T22:16:23Z

```
http=302 time=0.258311s size=263 redirect=https://vercel.com/sso-api?url=https%3A%2F%2Fpensions-system-a5m7zjio2-danielbueno76-4270s-projects.vercel.app%2F&nonce=e5836f3062a3864f6732e0d8c4b45f95bd1a5b062c7ddce972795ec51487e926
```

Response headers on `GET /en` showed the identical edge behaviour:

```
HTTP/2 302 
cache-control: no-store, max-age=0
content-type: text/plain
date: Thu, 29 Oct 2026 22:16:35 GMT
location: https://vercel.com/sso-api?url=https%3A%2F%2Fpensions-system-a5m7zjio2-danielbueno76-4270s-projects.vercel.app%2Fen&nonce=ec5b8dfd80bd68bddc4a003626f9d6731dd802e24b9fc01d5520c591c4daa3d9
server: Vercel
set-cookie: _vercel_sso_nonce=2199cfb35984c123c769675457b4247b86f2cea944c9ab17; Max-Age=3600; Path=/; Secure; HttpOnly; SameSite=Lax
strict-transport-security: max-age=63072000; includeSubDomains; preload
x-frame-options: DENY
x-robots-tag: noindex
x-vercel-id: cdg1::9gdht-1793312195670-becb7d98c1d4
```

### Round 1 — Evidence: browser first paint

Playwright (real Chromium, unauthenticated profile) against the same deployment URL:

command: `playwright browser_navigate { url: "https://pensions-system-a5m7zjio2-danielbueno76-4270s-projects.vercel.app/" }`
exit: 0 (navigate succeeded; landed on Vercel's login, not the app)
at: 2026-10-29T22:17:06Z

```
- Page URL: https://vercel.com/login?next=%2Fsso-api%3Furl%3Dhttps%253A%252F%252Fpensions-system-a5m7zjio2-danielbueno76-4270s-projects.vercel.app%252F%26nonce%3Da2b69338ce6b732d382a6746d8a1f9ba964baac2a9112c07bde4cedf059ccc62
- Page Title: Login – Vercel
```

### Round 1 — Evidence: runtime log query

command: `vercel logs --deployment https://pensions-system-a5m7zjio2-danielbueno76-4270s-projects.vercel.app --scope danielbueno76-4270s-projects`
exit: 0
at: 2026-10-29T22:17:31Z

```
{"type":"summary","recordsReturned":0,"timeRange":{"start":"2026-10-29T21:47:31.036Z","end":"2026-10-29T22:17:31.036Z"},"pagination":{"hasMore":false,"next":null},"excludedIntervals":[]}
```

### Round 1 — Evidence: project domain inventory

command: `vercel domains ls --scope danielbueno76-4270s-projects`
exit: 0
at: 2026-10-29T22:17:45Z

```
 Domain             Registrar           Nameservers         Expiration Date    Creator                     Age    
 rexi-ai.com        Third Party         Third Party         -                  danielbueno76-4270          20d
```

### Round 1 — routing, and what unblocked round 2

Round 1's fix-routing table concluded that none of the three deterministic lanes applied — no
runner exit existed, the condition was Deployment Protection rather than a repairable Vercel
configuration error, and the cloud build was green — so the health check's failure was treated as
the ambiguous case and escalated rather than guessed. It named two ways to unblock:

1. Add a documented exception for `vercel curl` to this agent's permitted-command list (the CLI's
   authenticated fetch, which spec 001's phase-3 verification had used on this project).
2. **Configure a protection bypass for automation** and hand the secret to the pipeline as an env
   var, so a plain `curl -H "x-vercel-protection-bypass: …"` satisfies every check without
   widening the CLI allow-list.

The owner took option 2. That is what made round 2 possible, and it is why no command outside the
permitted set was needed to carry it out.

Verdict: PASS
