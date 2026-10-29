/**
 * Repo-local scenario traceability gate, for scenario numbers of one *or* two digits after
 * the spec number — the range the shared upstream gate cannot see.
 *
 * The upstream gate is `.standards/scripts/check-scenario-traceability.sh` (a pinned, shared
 * submodule: not ours to edit). Its ID pattern is `AC-[0-9]{3}-[0-9]{2}`, which stops at
 * `AC-NNN-99`. A spec with 119 scenarios therefore reports green having verified 99 of them:
 * `AC-001-100` … `AC-001-119` are invisible to it, so a scenario with no test at all — or a
 * test citing a scenario that does not exist — passes unnoticed. This script exists to cover
 * exactly that range, and only that gap: it reads the same two ID sources
 * (`specs/<slug>/20-acceptance/` and the archived one-pagers under `docs/changes/`) and the
 * same citations (`tests/`), with a three-digit-tolerant pattern.
 *
 *   tsx scripts/check-scenario-traceability-3digit.ts [root]
 *
 * Exit 0 = every scenario is cited by a test and every citation resolves to a scenario.
 * Exit 1 = at least one scenario has no test, or at least one test cites an unknown ID.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

/** A scenario heading's ID, two or three digits in the scenario position. */
const SCENARIO_HEADING = /^##\s+(AC-\d{3}-\d{2,3})\b/gm;
/** A citation in a test name or string: `AC-001-119`, and the underscore form JUnit/Go use. */
const CITATION = /AC[-_](\d{3})[-_](\d{2,3})\b/g;

function walk(dir: string, extensions: readonly string[]): string[] {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries.flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walk(path, extensions);
    return extensions.some((extension) => entry.name.endsWith(extension)) ? [path] : [];
  });
}

function filesUnder(dir: string, extensions: readonly string[]): string[] {
  try {
    if (!statSync(dir).isDirectory()) return [];
  } catch {
    return [];
  }
  return walk(dir, extensions).sort();
}

/** Scenario IDs declared by `## AC-NNN-NN` headings, mapped to the file that declares them. */
export function declaredScenarios(root: string): Map<string, string> {
  const files = [
    ...filesUnder(join(root, 'specs'), ['.md']).filter((file) => file.includes('20-acceptance')),
    ...filesUnder(join(root, 'docs', 'changes'), ['.md']),
  ];
  const declared = new Map<string, string>();
  for (const file of files) {
    for (const match of readFileSync(file, 'utf8').matchAll(SCENARIO_HEADING)) {
      if (match[1]) declared.set(match[1], relative(root, file));
    }
  }
  return declared;
}

/** Citations found in the test suite, mapped to the test file that cites them. */
export function citedScenarios(root: string): Map<string, string> {
  const cited = new Map<string, string>();
  for (const file of filesUnder(join(root, 'tests'), ['.ts', '.tsx'])) {
    for (const match of readFileSync(file, 'utf8').matchAll(CITATION)) {
      const id = `AC-${match[1]}-${match[2]}`;
      if (!cited.has(id)) cited.set(id, relative(root, file));
    }
  }
  return cited;
}

export interface TraceabilityReport {
  /** Scenarios with no test citing them. */
  untested: string[];
  /** Citations naming a scenario no source declares. */
  unknown: string[];
  declared: number;
  cited: number;
}

export function checkTraceability(root: string): TraceabilityReport {
  const declared = declaredScenarios(root);
  const cited = citedScenarios(root);
  return {
    untested: [...declared.keys()].filter((id) => !cited.has(id)).sort(),
    unknown: [...cited.keys()].filter((id) => !declared.has(id)).sort(),
    declared: declared.size,
    cited: cited.size,
  };
}

function main(root: string): number {
  const report = checkTraceability(root);
  for (const id of report.untested) {
    console.error(`no test cites ${id}`);
  }
  for (const id of report.unknown) {
    console.error(`${id} is cited by a test but declared by no scenario`);
  }
  if (report.untested.length > 0 || report.unknown.length > 0) {
    console.error(
      `scenario traceability (2-3 digit ids): ${report.untested.length} untested, ${report.unknown.length} unknown`,
    );
    return 1;
  }
  console.log(
    `scenario traceability (2-3 digit ids): ${report.declared} scenarios, all cited, all citations resolve`,
  );
  return 0;
}

/**
 * Runs as a gate when executed, and stays importable when a test wants its report instead of
 * its exit code — importing a module must not exit the importer.
 */
const invokedAsScript =
  process.argv[1] !== undefined && pathToFileURL(process.argv[1]).href === import.meta.url;

if (invokedAsScript) process.exit(main(process.argv[2] ?? process.cwd()));