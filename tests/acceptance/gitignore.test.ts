import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * T1 (spec 002): the pipeline's Stryker scratch directory is ignored, and nothing that was
 * already ignored stops being ignored. The `.gitignore` is read as text for the entry rules and
 * through `git` for the effect, because a pattern that is present and a pattern that actually
 * ignores are two claims.
 *
 * `runs.jsonl` is asserted in the *other* direction (AC-002-02, corrected 2026-10-30): it is the
 * append-only telemetry log, not scratch. `.standards/scripts/record-gate-run.sh` appends one JSON
 * object per line to it and `.standards/scripts/gate-stats.sh` reads it from the repo root, so it
 * has to stay trackable — ignoring it would mean the pipeline's own trend never survives a merge.
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

describe('AC-002-02: the runs log is tracked, not ignored', () => {
  /**
   * The append-only telemetry log: `.standards/scripts/record-gate-run.sh` writes one JSON object
   * per line to it, and `.standards/scripts/gate-stats.sh` reads it from the repo root. A
   * `.gitignore` entry here would mean the pipeline's own trend never survives a merge. (This
   * scenario previously asserted the opposite; corrected 2026-10-30.)
   */
  const RUNS_LOG = 'runs.jsonl';

  it('AC-002-02: `.gitignore` carries no entry for `runs.jsonl`, and git does not ignore it', () => {
    expect(ENTRIES).not.toContain(RUNS_LOG);
    // Not a directory form, not an anchored form, and no glob that would catch it by accident:
    // nothing in the file names the log at all.
    expect(ENTRIES).not.toContain(`${RUNS_LOG}/`);
    expect(ENTRIES).not.toContain(`/${RUNS_LOG}`);
    expect(ENTRIES.filter((entry) => entry.includes('jsonl'))).toEqual([]);
    // `check-ignore` is the authoritative check: it evaluates every pattern in the file, not
    // just an exact line match, and a non-zero exit means the path is not ignored.
    expect(checkIgnore(RUNS_LOG)).not.toBe(0);
  });

  it('AC-002-02: a `runs.jsonl` file at the repo root is tracked, or ready for the commit that tracks it', () => {
    // The scenario's Given: the file exists at the repo root with its prior contents.
    expect(existsSync(RUNS_LOG), `${RUNS_LOG} must exist at the repo root`).toBe(true);

    // The scenario's Then: "once committed, `git ls-files runs.jsonl` lists it". Before that
    // commit, the equivalent claim is that git can see the file — reported as untracked rather
    // than swallowed by the ignore rules. Either state satisfies the scenario; an ignored file
    // satisfies neither, which is the regression this guards.
    const listed = git(['ls-files', '--error-unmatch', RUNS_LOG]).status === 0;
    const visibleToStatus = git(['status', '--porcelain', '--untracked-files=normal'])
      .stdout.split('\n')
      .some((line) => line.trim() === `?? ${RUNS_LOG}`);
    expect(listed || visibleToStatus, `${RUNS_LOG} must be tracked, or trackable by a commit`).toBe(
      true,
    );
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
