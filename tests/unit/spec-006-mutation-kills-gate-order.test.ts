import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { citedScenarios } from '../../scripts/check-scenario-traceability-3digit';

/**
 * Mutation-killing assertions for the two places the traceability gate depends on the filesystem's
 * *order* and on `readdir` failing (stage 5a, spec 006).
 *
 * Both are only observable through the file walk, and the walk's order is whatever the directory
 * returns. Rather than assert on whatever this machine's filesystem happens to do, the module's
 * `readdirSync` is replaced for this file alone and driven deliberately: reversed, so a missing
 * sort is visible; and throwing, so the walk's error path runs.
 *
 * The gate itself is unchanged — only the test's view of `node:fs` is.
 */

const harness = vi.hoisted(() => ({
  /** Replaces `readdirSync` for this test file when set; `null` restores the real one. */
  override: null as null | ((...args: unknown[]) => unknown),
  real: null as null | ((...args: unknown[]) => unknown),
}));

vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs')>();
  harness.real = actual.readdirSync as unknown as (...args: unknown[]) => unknown;
  return {
    ...actual,
    readdirSync: (...args: unknown[]) =>
      harness.override === null
        ? (actual.readdirSync as unknown as (...inner: unknown[]) => unknown)(...args)
        : harness.override(...args),
  };
});

const created: string[] = [];

afterEach(() => {
  for (const root of created.splice(0)) rmSync(root, { recursive: true, force: true });
});

beforeEach(() => {
  harness.override = null;
});

function id(scenario: number): string {
  return ['AC', '001', String(scenario)].join('-');
}

function citingTest(scenario: number): string {
  return `it('${id(scenario)}: a fixture test', () => {});`;
}

function tree(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), 'traceability-order-'));
  created.push(root);
  for (const [path, contents] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), contents);
  }
  return root;
}

/** Every directory lists its entries in reverse, so an unsorted walk is not the sorted walk. */
function listInReverse(): void {
  harness.override = (...args) => [...(harness.real as (...inner: unknown[]) => unknown[])(...args)].reverse();
}

describe('AC-001-119: a duplicated id is attributed to one file, whatever order the directory lists', () => {
  it('AC-001-119: the citation is recorded against the first path of the sorted walk', () => {
    // Two files cite the same id. The walk sorts, so the first one wins; without the sort the
    // winner is whichever name the filesystem returned first, and the report stops being
    // reproducible. Reversing the listing makes the two orders differ on every run.
    const root = tree({ 'tests/z.test.ts': citingTest(500), 'tests/a.test.ts': citingTest(500) });
    listInReverse();

    expect(citedScenarios(root).get(id(500))).toBe(join('tests', 'a.test.ts'));
  });
});

describe('AC-001-119: an unreadable directory yields no citations', () => {
  it('AC-001-119: a readdir that throws is an empty listing, not a thrown walk', () => {
    // The walk's own catch returns `[]`. An empty body leaves the caller sorting `undefined`; a
    // placeholder entry leaves it reading a path that does not exist.
    const root = tree({ 'tests/a.test.ts': citingTest(501) });
    harness.override = () => {
      throw Object.assign(new Error('EACCES: permission denied'), { code: 'EACCES' });
    };

    expect([...citedScenarios(root).keys()]).toEqual([]);
  });
});
