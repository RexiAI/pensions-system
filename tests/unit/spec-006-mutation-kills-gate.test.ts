import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import {
  checkTraceability,
  declaredScenarios,
} from '../../scripts/check-scenario-traceability-3digit';
/**
 * Mutation-killing assertions for the repo-local traceability gate (stage 5a), each written for a
 * survivor of the spec-006 run.
 *
 * Every case here is about *tolerance*: a root whose `specs` or `docs/changes` path is a plain
 * file, or whose scenario-shaped text sits where the gate must not read it. The gate exists to be
 * run against a repository mid-mutation, so reading a path that is not a file is a failure of the
 * gate, not of the repository.
 *
 * Every scenario id is *built*, never written as a literal: the gate scans `tests/**` for
 * citations, so a bare unknown id here would be a citation of a scenario that does not exist.
 */

const created: string[] = [];

afterEach(() => {
  for (const root of created.splice(0)) rmSync(root, { recursive: true, force: true });
});

function id(scenario: number): string {
  return ['AC', '001', String(scenario)].join('-');
}

function heading(scenario: number): string {
  return `## ${id(scenario)} — a fixture scenario`;
}

function citingTest(scenario: number): string {
  return `it('${id(scenario)}: a fixture test', () => {});`;
}

/** Writes `{ 'relative/path': 'contents' }` under a fresh temp root, creating parent directories. */
function tree(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), 'traceability-kills-'));
  created.push(root);
  for (const [path, contents] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), contents);
  }
  return root;
}

describe('AC-001-119: a path that is not a directory declares nothing', () => {
  it('AC-001-119: a docs/changes path that is a plain file declares nothing', () => {
    // The acceptance branch filters on the directory name, so a bogus entry there is discarded;
    // the archived branch does not, and reads every path it is handed. A file named `changes`
    // must therefore yield no files rather than a path to read.
    const root = tree({ 'docs/changes': 'not a directory' });

    expect([...declaredScenarios(root).keys()]).toEqual([]);
  });
});

describe('AC-001-119: the gate reads only the four directories it names', () => {
  it('AC-001-119: an acceptance directory outside specs does not declare a scenario', () => {
    // `filesUnder(join(root, 'specs'))`: dropping `specs` walks the whole root, and any directory
    // whose name contains `20-acceptance` then becomes an id source.
    const root = tree({ 'other/20-acceptance/AC-001-fixture.md': heading(500) });

    expect([...declaredScenarios(root).keys()]).toEqual([]);
  });

  it('AC-001-119: a markdown file beside docs/changes does not declare a scenario', () => {
    // Dropping the `changes` segment widens the source to every markdown file under `docs/`.
    const root = tree({ 'docs/notes.md': heading(501) });

    expect([...declaredScenarios(root).keys()]).toEqual([]);
  });

  it('AC-001-119: a TypeScript file outside tests is not a citation', () => {
    // Dropping the `tests` segment walks the whole root for `.ts`/`.tsx`, so a helper that
    // mentions an id would silence the scenario it never tests.
    const root = tree({
      'specs/001-fixture/20-acceptance/AC-001-fixture.md': heading(502),
      'scripts/helper.ts': citingTest(502),
    });

    expect(checkTraceability(root).untested).toEqual([id(502)]);
  });
});

describe('AC-001-119: importing the gate does not run it', () => {
  it('AC-001-119: a process with no argv entry imports the module without throwing', async () => {
    // `invokedAsScript` short-circuits on `process.argv[1] !== undefined` before it builds a file
    // URL. Without that guard the import evaluates `pathToFileURL(undefined)` and throws in the
    // importer, so every test that imports the gate dies.
    const argv = process.argv as unknown as (string | undefined)[];
    const entry = argv[1];
    argv[1] = undefined;
    vi.resetModules();
    try {
      const module = await import('../../scripts/check-scenario-traceability-3digit');
      expect(typeof module.checkTraceability).toBe('function');
    } finally {
      argv[1] = entry;
    }
  });
});
