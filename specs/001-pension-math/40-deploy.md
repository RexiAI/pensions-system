# 40 — Deploy verification

Spec 001 `pension-math` · stage 5c · branch `spec/001-pension-math`

## Verdict

**Verdict: PASS**

## Fields

| Field | Value |
|---|---|
| Deploy URL | https://pensions-system-rnw6ofr53-danielbueno76-4270s-projects.vercel.app |
| Build status | `pass` — Vercel built head `7f72167` to `readyState: READY` |
| Health check status | `pass` — 2xx on `/` and `/en`; served HTML carries the expected computed value in both locales; `/admin` fail-closed |
| E2E verdict | `skip` — no E2E suite exists in this repository; equivalent verification performed as live HTTP + rendered-value assertions (below) |
| Timestamp | 2026-10-26T11:47:38Z |
| Phase-3 attempt count | 1 |
| Deploy command run | **none** — Git integration built it; `vercel deploy` was never invoked |

## Deployment identity

| Item | Value |
|---|---|
| Vercel project | `pensions-system` (`prj_ZS8blMFO18fwOrMaJfRJAEJgqZbz`) |
| Team | `danielbueno76-4270s-projects` |
| Git integration | `github` — `RexiAI/pensions-system`, production branch `main` |
| Deployment | `pensions-system-rnw6ofr53-danielbueno76-4270s-projects.vercel.app` |
| Branch / commit | `spec/001-pension-math` / `7f72167` |
| Project settings | framework `nextjs`, node `24.x`, build / install / output / root all defaults |
| Environment variables | **none set** — including `ADMIN_PASSWORD_HASH` and `ADMIN_SESSION_SECRET` |

## Live checks

The deployment is protected by Vercel Authentication, which is normal for a newly
created project and correct — it is not a public surface. Checks were therefore
performed through the CLI's authenticated fetch (`vercel curl`), not by exposing the
deployment.

| Check | Observed |
|---|---|
| `GET /` | 121 908 bytes; contains `13,23 %` |
| `GET /en` | 121 034 bytes; contains `13.23%` |
| Wrong-scale regression on `/` | **0** occurrences of `1323` |
| `GET /admin` | 195 bytes — `CONFIG. Administración no configurada. La superficie está cerrada porque la configuración administrativa del despliegue está incompleta. Nadie puede entrar hasta completarla en el despliegue.` — **0** `<input>` elements |

The `/admin` result is the correct outcome with no admin configuration present: the
surface fails closed and reveals no form, no navigation and no configuration detail.

## Deployment history — read before judging the project

Two pre-existing conditions explain an artifact that would otherwise look like a
failure of this spec:

1. The project's only other deployment is an `ERROR` from `main` @ `d7f976e` — the
   bootstrap commit, which contained no `package.json` — with
   `errorCode: NEXT_NO_VERSION`, `source: import`. That is an import-time artifact of
   an empty scaffold, not a build of this work.
2. The project had `gitProviderOptions.createDeployments: "disabled"`, so no commit
   after the import was built at all. The owner enabled deployments during this stage;
   `7f72167` is the first genuinely built deployment of this repository.

## Not covered by this verification

- **The preview is not publicly reachable** — Vercel Authentication gates it. Phase-3
  verification was performed with authenticated fetch; a member of the public cannot
  currently see this deployment.
- **Production still points at `main`**, which holds only the scaffold commit, so the
  production alias will continue to error until this PR merges. Expected, not a defect
  of this spec.
- **No end-to-end journey suite exists**, so the E2E verdict is a skip. What was
  verified instead is listed above and is deliberately narrow: status codes, the
  published value in both locales, absence of the known wrong-scale string, and the
  admin fail-closed response.

## What would upgrade this to a full public verification

- A Vercel protection bypass scoped to CI, or a custom domain on the project, so the
  preview can be checked unauthenticated.
- `ADMIN_PASSWORD_HASH` and `ADMIN_SESSION_SECRET` set on the **Preview** environment
  only, if the admin login flow is to be exercised end-to-end. They are deliberately
  unset now, which is why `503` is the correct observed behaviour rather than a gap.
- An E2E journey suite, which this repository does not yet have.
