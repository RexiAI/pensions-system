# AC-004: Retire the layout pins of 001–003, keep the rest

## AC-004-74 — No retired id is cited by a test
Given the retired ids `AC-001-107`, `AC-002-09`, `AC-002-10`, `AC-002-11`, `AC-002-12`, `AC-002-16`, `AC-002-18`, `AC-002-19`, `AC-002-20`, `AC-002-21`, `AC-002-29`, `AC-002-30`, `AC-002-36`, `AC-003-01`, `AC-003-06`, `AC-003-10`, `AC-003-48`, `AC-003-49`, `AC-003-50`, `AC-002-24`, `AC-003-39`, `AC-003-40`, `AC-003-42`, `AC-003-51`
When every file under `tests/` is searched
Then no occurrence of any of them is found

## AC-004-75 — Every preserved id still has a passing test
Given the preserved ids listed in `10-tasks.md` §T17
When every file under `tests/` is searched
Then each preserved id occurs in at least one test
And the full suite passes

## AC-004-76 — Scenario traceability is green
Given the repository after this spec
When `scripts/check-scenario-traceability.sh` runs
Then it exits 0
And every `AC-004-NN` id defined in this folder is cited by at least one test
And every `AC-004-NN` citation resolves to a scenario defined here

## AC-004-77 — The retired geometry constants are gone from the tests
Given `tests/acceptance/first-viewport.test.ts`
Then it asserts none of the retired measurements: the `436.52`, `613.28` and `480.91` rows, the `--measure-face: 17.5rem` value, and the 50 px clearance table
And no test asserts a fixed key count
And the surviving describes in that file carry preserved ids or are deleted with the id they carried

## AC-004-78 — The band tests are split, not silently weakened
Given `tests/acceptance/countdown-band.test.ts` and `tests/acceptance/countdown-band-browser.test.ts`
Then the describes carrying retired ids are removed
And the describes carrying re-pointed ids (`AC-003-02`, `AC-003-03`, `AC-003-04`, `AC-003-05`, `AC-003-07`) remain and assert against the new composition
And `tests/acceptance/pending.test.ts` is deleted, with its surviving assertion (computed plates keep their order and provenance) moved to the `#figuras` test

## AC-004-79 — No gate is lowered to make any of this pass
Given the repository's gate configuration
Then no contrast minimum, cyclomatic-complexity threshold, coverage threshold or mutation threshold is lowered
And a fold token may change its value only together with a recorded re-measurement
