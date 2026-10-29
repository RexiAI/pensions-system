import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * T1 (spec 002): the pipeline's scratch is ignored, and nothing that was already ignored stops
 * being ignored. The `.gitignore` is read as text for the entry rules and through `git` for the
 * effect, because a pattern that is present and a pattern that actually ignores are two claims.
 */
const IGNORE = readFileSync('.gitignore', 'utf8');
const ENTRIES = IGNORE.split('\n')
  .map((line) => line.trim())
  .filter((line) => line !== '' && !line.startsWith('#'));

function git(args: readonly string[]): { status: number | null; stdout: string } {
  const run = spawnSync('git', args, { encoding: 'utf8' });
  return { status: run.status, stdout: run.stdout };
}

/** `git check-ignore` matches a path against the rules without needing the path to exist. */
function checkIgnore(path: string): number | null {
  return git(['check-ignore', '--quiet', path]).status;
}

/** The unwritten entries from before this change: every one must survive, unaltered. */
const PRE_EXISTING = [
  'node_modules/',
  '.next/',
  'out/',
  'coverage/',
  '*.tsbuildinfo',
  '.envrc',
  '.env',
  '.env.local',
  'data/pending/*.json',
  'data/proposals/*.json',
  '.vitest/',
  '.stryker-tmp/',
  '.playwright-mcp/',
] as const;

describe('AC-002-01: the pipeline scratch directory is ignored', () => {
  it('AC-002-01: `.gitignore` carries a trailing-slash `reports/` entry, and git ignores the path', () => {
    expect(ENTRIES).toContain('reports/');
    // A directory entry, not a bare filename: the pipeline writes reports/ as a directory.
    expect(ENTRIES).not.toContain('reports');
    expect(checkIgnore('reports/')).toBe(0);
    expect(checkIgnore('reports/some-run.json')).toBe(0);
  });

  it('AC-002-01: a `reports/` directory at the repo root is not untracked', () => {
    const status = git(['status', '--porcelain', '--untracked-files=normal']).stdout;
    const lines = status.split('\n').filter((line) => line.startsWith('??'));
    expect(lines.filter((line) => line.includes('reports/'))).toEqual([]);
  });
});

describe('AC-002-02: the runs log is ignored', () => {
  it('AC-002-02: `.gitignore` carries a bare `runs.jsonl` entry, and git ignores the file', () => {
    expect(ENTRIES).toContain('runs.jsonl');
    // A file entry, not a directory one: the pipeline appends a single run log.
    expect(ENTRIES).not.toContain('runs.jsonl/');
    expect(checkIgnore('runs.jsonl')).toBe(0);
  });

  it('AC-002-02: a `runs.jsonl` file at the repo root is not untracked', () => {
    const status = git(['status', '--porcelain', '--untracked-files=normal']).stdout;
    const lines = status.split('\n').filter((line) => line.startsWith('??'));
    expect(lines.filter((line) => line.includes('runs.jsonl'))).toEqual([]);
  });
});

describe('AC-002-03: every pre-existing entry is preserved', () => {
  it('AC-002-03: every pre-existing entry is still present', () => {
    for (const entry of PRE_EXISTING) {
      expect(ENTRIES, `${entry} must survive`).toContain(entry);
    }
  });

  it('AC-002-03: the pre-existing entries are neither reordered nor otherwise altered', () => {
    // The order of the surviving entries is the order the file had, so a diff that shuffles the
    // file to "tidy" it is a failure rather than a cosmetic change.
    const surviving = ENTRIES.filter((entry) => (PRE_EXISTING as readonly string[]).includes(entry));
    expect(surviving).toEqual([...PRE_EXISTING]);
  });
});
