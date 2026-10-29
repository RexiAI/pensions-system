import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

/**
 * The gate's *exit contract* — the part CI actually consumes.
 *
 * `scenario-traceability-gate.test.ts` spawns the script, which proves the contract end to end
 * but runs in a separate process. This file evaluates the module in-process instead, so the
 * `main()` branch and the `invokedAsScript` guard are exercised by the same test run that
 * mutation testing observes. Both are kept: one asserts what a caller sees, the other makes the
 * code inside answerable.
 *
 * `process.exit` is the one thing that cannot be allowed to run for real, so it is replaced by a
 * throwing stub and the exit code is read from the throw.
 */

const SCRIPT = resolve('scripts/check-scenario-traceability-3digit.ts');

class ExitSignal extends Error {
  constructor(readonly code: number) {
    super(`exit ${code}`);
  }
}

const created: string[] = [];

afterEach(() => {
  for (const root of created.splice(0)) rmSync(root, { recursive: true, force: true });
});

/** A three-digit-suffix id, built rather than written (see the sibling test's note). */
function id(scenario: number): string {
  return ['AC', '001', String(scenario)].join('-');
}

function tree(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), 'traceability-cli-'));
  created.push(root);
  for (const [path, contents] of Object.entries(files)) {
    const target = join(root, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, contents);
  }
  return root;
}

interface CliRun {
  /** The code passed to `process.exit`, or `null` if the module returned without exiting. */
  exit: number | null;
  out: string[];
  err: string[];
}

async function runCli(root: string): Promise<CliRun> {
  const out: string[] = [];
  const err: string[] = [];
  const savedArgv = process.argv.slice();
  const log = vi.spyOn(console, 'log').mockImplementation((...args: unknown[]) => {
    out.push(args.join(' '));
  });
  const error = vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    err.push(args.join(' '));
  });
  const exit = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
    throw new ExitSignal(code ?? 0);
  }) as never);

  // The argument is a full path, and the assertion below is on the report it produces: a gate
  // that ignored the argument would scan the repository instead and answer `119 scenarios`.
  process.argv[1] = SCRIPT;
  process.argv[2] = root;

  let code: number | null = null;
  vi.resetModules();
  try {
    // A bare specifier, not an absolute `file://` URL: Stryker instruments modules through the
    // bundler, and an absolute URL is handed to Node's own loader instead — the code would still
    // run, but no mutation of it could ever be observed or killed.
    await import('../../scripts/check-scenario-traceability-3digit');
  } catch (thrown) {
    if (!(thrown instanceof ExitSignal)) throw thrown;
    code = thrown.code;
  } finally {
    process.argv.splice(0, process.argv.length, ...savedArgv);
    log.mockRestore();
    error.mockRestore();
    exit.mockRestore();
  }
  return { exit: code, out, err };
}

describe('AC-001-119: the gate exits 0 and says so when every scenario is cited', () => {
  it('AC-001-119: prints the count and exits 0', async () => {
    const root = tree({
      'specs/001-fixture/20-acceptance/AC-001-fixture.md': `## ${id(500)} — a scenario`,
      'tests/fixture.test.ts': `it('${id(500)}: x', () => {});`,
    });

    const run = await runCli(root);

    expect(run.exit).toBe(0);
    expect(run.out).toEqual([
      'scenario traceability (2-3 digit ids): 1 scenarios, all cited, all citations resolve',
    ]);
    expect(run.err).toEqual([]);
  });

});

describe('AC-001-119: the gate exits 1 and names what is wrong', () => {
  it('AC-001-119: names each uncited scenario, then the tally', async () => {
    const root = tree({
      'specs/001-fixture/20-acceptance/AC-001-fixture.md': [
        `## ${id(510)} — cited`,
        `## ${id(511)} — not cited`,
      ].join('\n\n'),
      'tests/fixture.test.ts': `it('${id(510)}: x', () => {});`,
    });

    const run = await runCli(root);

    expect(run.exit).toBe(1);
    // The per-id line comes first, so a CI log names the scenario before the summary.
    expect(run.err).toEqual([
      `no test cites ${id(511)}`,
      'scenario traceability (2-3 digit ids): 1 untested, 0 unknown',
    ]);
    expect(run.out).toEqual([]);
  });

  it('AC-001-119: names a citation that no scenario declares', async () => {
    const root = tree({
      'specs/001-fixture/20-acceptance/AC-001-fixture.md': `## ${id(520)} — a scenario`,
      'tests/fixture.test.ts': [`${id(520)}`, `${id(521)}`]
        .map((entry) => `it('${entry}: x', () => {});`)
        .join('\n'),
    });

    const run = await runCli(root);

    expect(run.exit).toBe(1);
    expect(run.err).toEqual([
      `${id(521)} is cited by a test but declared by no scenario`,
      'scenario traceability (2-3 digit ids): 0 untested, 1 unknown',
    ]);
  });
});
