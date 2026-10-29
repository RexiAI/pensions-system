import { afterEach, describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { checkTraceability, declaredScenarios } from '../../scripts/check-scenario-traceability-3digit';

/**
 * Which files declare a scenario and which files count as a citation.
 *
 * The gate is only as good as its two ID sources: a heading in a task file, or a citation in a
 * note, must not enter the report — and an archived one-pager must, because after a spec merges
 * `docs/changes/` is the only place its IDs still exist.
 *
 * Every scenario id here is *built*, never written as a literal: the gate scans `tests/**` for
 * citations, so a bare unknown id in this file would be a citation of a scenario that does not
 * exist, and would fail the gate it is testing.
 */

const created: string[] = [];

afterEach(() => {
  for (const root of created.splice(0)) rmSync(root, { recursive: true, force: true });
});

/** `id(500)` composes a three-digit-suffix id without leaving a literal citation in this file. */
function id(scenario: number): string {
  return ['AC', '001', String(scenario)].join('-');
}

/** Writes `{ 'relative/path': 'contents' }` under a fresh temp root. */
function tree(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), 'traceability-sources-'));
  created.push(root);
  for (const [path, contents] of Object.entries(files)) {
    const target = join(root, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, contents);
  }
  return root;
}

function heading(scenario: number): string {
  return `## ${id(scenario)} — a fixture scenario`;
}

function citingTest(scenario: number): string {
  return `it('${id(scenario)}: a fixture test', () => {});`;
}

describe('AC-001-119: only an acceptance file declares a scenario', () => {
  it('AC-001-119: a heading in a task file is not a declaration', () => {
    // `10-tasks.md` discusses scenarios by number; only `20-acceptance/` declares them. The gate
    // filters on the directory for exactly this reason.
    const root = tree({
      'specs/001-fixture/10-tasks.md': `# tasks\n\n${heading(500)}`,
      'tests/fixture.test.ts': '',
    });

    expect([...declaredScenarios(root).keys()]).toEqual([]);
    expect(checkTraceability(root)).toEqual({ untested: [], unknown: [], declared: 0, cited: 0 });
  });

  it('AC-001-119: only markdown declares a scenario, not every file under the acceptance directory', () => {
    const root = tree({
      'specs/001-fixture/20-acceptance/notes.txt': heading(500),
      'specs/001-fixture/20-acceptance/AC-001-fixture.md': heading(501),
      'tests/fixture.test.ts': citingTest(501),
    });

    expect([...declaredScenarios(root).keys()]).toEqual([id(501)]);
    expect(checkTraceability(root).untested.filter((entry) => entry.endsWith('00'))).toEqual([]);
  });
});

describe('AC-001-119: an archived one-pager is an id source', () => {
  it('AC-001-119: a scenario declared only under docs/changes is still traced', () => {
    // Once a spec merges, `specs/` is gone and the one-pager is what the tests still cite.
    const root = tree({
      'docs/changes/001-fixture.md': `# 001 — fixture\n\n${heading(500)}`,
      'tests/fixture.test.ts': citingTest(500),
    });

    expect(checkTraceability(root)).toEqual({ untested: [], unknown: [], declared: 1, cited: 1 });
  });

  it('AC-001-119: only markdown under docs/changes declares a scenario', () => {
    const root = tree({
      'docs/changes/notes.txt': heading(500),
      'tests/fixture.test.ts': '',
    });

    expect([...declaredScenarios(root).keys()]).toEqual([]);
  });
});

describe('AC-001-119: a heading has to look like a heading', () => {
  it('AC-001-119: a heading must start its line', () => {
    // Prose that mentions a heading inline is prose, not a declaration.
    const root = tree({
      'specs/001-fixture/20-acceptance/AC-001-fixture.md': `See ${heading(500)} for the wording.`,
      'tests/fixture.test.ts': '',
    });

    expect([...declaredScenarios(root).keys()]).toEqual([]);
  });

  it('AC-001-119: extra whitespace after the hashes is tolerated', () => {
    const root = tree({
      'specs/001-fixture/20-acceptance/AC-001-fixture.md': `##   ${id(500)} — spaced`,
      'tests/fixture.test.ts': '',
    });

    expect([...declaredScenarios(root).keys()]).toEqual([id(500)]);
  });
});

describe('AC-001-119: a citation is read from test source only', () => {
  it('AC-001-119: an id mentioned in a markdown note is not a citation', () => {
    // A scenario covered only by a note about it is still untested.
    const root = tree({
      'specs/001-fixture/20-acceptance/AC-001-fixture.md': heading(500),
      'tests/notes.md': `Covered by ${id(500)}.`,
    });

    expect(checkTraceability(root).untested).toEqual([id(500)]);
  });

  it('AC-001-119: an id cited in a .tsx test counts', () => {
    const root = tree({
      'specs/001-fixture/20-acceptance/AC-001-fixture.md': heading(500),
      'tests/fixture.test.tsx': citingTest(500),
    });

    expect(checkTraceability(root)).toEqual({ untested: [], unknown: [], declared: 1, cited: 1 });
  });
});

describe('AC-001-119: the report is ordered, so the gate reads the same twice', () => {
  it('AC-001-119: untested and unknown ids come back sorted, not in discovery order', () => {
    // Declared in descending order, cited in descending order: an unsorted report would print
    // (and diff) in whatever order the filesystem returned.
    const root = tree({
      'specs/001-fixture/20-acceptance/AC-001-fixture.md': [heading(620), heading(610)].join('\n\n'),
      'tests/fixture.test.ts': [id(640), id(630)].map((entry) => `it('${entry}: x', () => {});`).join('\n'),
    });

    const report = checkTraceability(root);
    expect(report.untested).toEqual([id(610), id(620)]);
    expect(report.unknown).toEqual([id(630), id(640)]);
    expect(report.declared).toBe(2);
    expect(report.cited).toBe(2);
  });
});
