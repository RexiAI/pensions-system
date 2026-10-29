import { afterEach, describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  checkTraceability,
  declaredScenarios,
} from '../../scripts/check-scenario-traceability-3digit';

/**
 * The repo-local traceability wrapper must fail, not report green, when a scenario has no
 * citing test — including for the three-digit scenario numbers the shared upstream gate cannot
 * see (`AC-001-100`…`-119`).
 *
 * Every scenario id here is *built*, never written as a literal: the gate scans `tests/**` for
 * citations, so a bare unknown id in this file would be a citation of a scenario that does not
 * exist, and would fail the gate it is testing.
 */
const created: string[] = [];

afterEach(() => {
  for (const root of created.splice(0)) rmSync(root, { recursive: true, force: true });
});

/** `id(7)` and `id(120)` compose the padded ids the scenario format uses. */
function id(scenario: number): string {
  return ['AC', '001', String(scenario).padStart(2, '0')].join('-');
}

interface Fixture {
  /** Scenario headings to declare under `specs/001-fixture/20-acceptance/`. */
  scenarios: number[];
  /** Ids to cite from `tests/fixture.test.ts`. */
  citations: string[];
}

function fixture({ scenarios, citations }: Fixture): string {
  const root = mkdtempSync(join(tmpdir(), 'traceability-'));
  created.push(root);
  const acceptance = join(root, 'specs', '001-fixture', '20-acceptance');
  mkdirSync(acceptance, { recursive: true });
  writeFileSync(
    join(acceptance, 'AC-001-fixture.md'),
    ['# AC-001: fixture', ...scenarios.map((n) => `## ${id(n)} — a fixture scenario`)].join('\n\n'),
  );
  const tests = join(root, 'tests');
  mkdirSync(tests, { recursive: true });
  writeFileSync(
    join(tests, 'fixture.test.ts'),
    citations.map((cited) => `it('${cited}: a fixture test', () => {});`).join('\n'),
  );
  return root;
}

function runGate(root: string): { status: number | null; stdout: string; stderr: string } {
  const run = spawnSync(
    'node_modules/.bin/tsx',
    ['scripts/check-scenario-traceability-3digit.ts', root],
    { encoding: 'utf8', cwd: process.cwd() },
  );
  return { status: run.status, stdout: run.stdout, stderr: run.stderr };
}

describe('three-digit scenario traceability', () => {
  it('passes when every scenario, two- or three-digit, is cited', () => {
    const root = fixture({
      scenarios: [7, 100, 119],
      citations: [id(7), id(100), id(119)],
    });

    const report = checkTraceability(root);
    expect(report).toEqual({ untested: [], unknown: [], declared: 3, cited: 3 });
    expect(runGate(root).status).toBe(0);
  });

  it('fails on a synthetic missing citation above 99', () => {
    const root = fixture({ scenarios: [99, 100], citations: [id(99)] });

    const run = runGate(root);

    expect(run.status).toBe(1);
    expect(run.stderr).toContain(id(100));
    expect(checkTraceability(root).untested).toEqual([id(100)]);
  });

  it('fails on a synthetic missing citation below 100 as well', () => {
    const root = fixture({ scenarios: [1, 2], citations: [id(1)] });

    expect(runGate(root).status).toBe(1);
    expect(checkTraceability(root).untested).toEqual([id(2)]);
  });

  it('fails when a test cites an id no scenario declares', () => {
    const unknown = id(120);
    const root = fixture({ scenarios: [100], citations: [id(100), unknown] });

    const run = runGate(root);

    expect(run.status).toBe(1);
    expect(run.stderr).toContain(unknown);
    expect(checkTraceability(root).unknown).toEqual([unknown]);
  });

  it('accepts the underscore form a JUnit or Go test name would use', () => {
    const root = fixture({ scenarios: [101], citations: [id(101).replace(/-/g, '_')] });

    expect(checkTraceability(root).untested).toEqual([]);
    expect(runGate(root).status).toBe(0);
  });

  it('covers this repository beyond the 99-scenario ceiling', () => {
    const declared = declaredScenarios('.');
    const report = checkTraceability('.');

    // The shared upstream gate stops at AC-NNN-99; this one must not.
    expect(declared.size).toBeGreaterThan(99);
    for (const scenario of [100, 110, 119]) {
      expect(declared.has(id(scenario)), `${id(scenario)} must be counted`).toBe(true);
    }
    expect(report.untested).toEqual([]);
    expect(report.unknown).toEqual([]);
  });
});
