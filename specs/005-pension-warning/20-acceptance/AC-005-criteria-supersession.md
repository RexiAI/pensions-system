# AC-005: Supersede the two pinned-copy criteria and keep the rest

Task T8. Two inherited criteria pin copy this spec deliberately changes. Both are named here;
nothing else is retired.

## AC-005-36 — `AC-004-11` is superseded, not weakened silently

Given `tests/acceptance/story-steps.test.ts`
When its threshold-carrier assertion is read
Then it asserts the carrier set is exactly `['number', 'breakage']`
And it cites `AC-005-10` rather than `AC-004-11`
And no file under `tests/` contains the string `AC-004-11`
And `retired-criteria.test.ts`'s `RETIRED` list is unchanged: this criterion is superseded, not
  retired, and its subject (the threshold statement) still exists

## AC-005-37 — The editorial digest is recomputed, with the reason recorded

Given `tests/acceptance/hero-copy.test.ts` and the five shipped locale documents
When the recomputed `EXPECTED` editorial digests are compared with
  `sha256(JSON.stringify(document.editorial)).slice(0, 16)` for each document
Then all five match
And the comment beside `EXPECTED` names spec 005 as the reason the digest moved, naming the two
  additions (the mechanism claims and the reading)
And the `countdown.clock.` and `fig.` digests in the same file are unchanged from the shipped
  values
And `AC-002-26`'s other clauses still pass: no `hero.*` string of `REWRITTEN` carries a digit,
  an institution or a source

## AC-005-38 — Nothing else is retired, and every preserved id still passes

Given `tests/acceptance/retired-criteria.test.ts`
When its `RETIRED` and `PRESERVED` lists are read
Then `RETIRED` is byte-identical to the shipped list
And every id in spec 004 T17's preserved set occurs in at least one test file
And `AC-004-76` still finds exactly 79 declared `AC-004-*` scenarios
And each of `AC-004-07`, `AC-004-08`, `AC-004-29`, `AC-004-60`, `AC-004-61`, `AC-004-69`,
  `AC-004-70`, `AC-004-72`, `AC-001-41`, `AC-001-43`, `AC-001-91`, `AC-001-118`,
  `AC-002-22`, `AC-002-23`, `AC-002-25`, `AC-002-26`, `AC-002-27` has a passing test that
  cites it
And the test suite is green with no test skipped, disabled or marked `todo`

## AC-005-39 — Traceability is green and no gate is lowered

Given the repository at the end of this spec
When `scripts/check-scenario-traceability.sh` runs
Then it exits 0
And every `AC-005-01` … `AC-005-39` id is cited by a test
And every citation resolves
And no id from the shipped retired list is cited
When the gate configuration is read
Then `HERO_STATEMENT_BUDGETS` still equals `{ es: 42, de: 55, en: 46, fr: 52, it: 50 }`
  (preserved AC-002-27)
And `eslint.config.mjs` still carries `complexity: ['error', 6]`
And no coverage or mutation threshold was lowered (preserved AC-004-79)
