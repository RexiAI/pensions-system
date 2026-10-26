/**
 * The committed compute step (T2). Reads the verified source snapshots, computes the seven
 * figures for one country, and writes deterministic derived JSON under `data/derived/`.
 *
 * Exit code is 0 only when every required source resolved and was fresh; an unconfigured
 * country, a fetch failure, an unresolved-but-required series or a stale snapshot exits
 * non-zero and the affected figure is written as `unavailable`, never as current.
 *
 * Usage:
 *   tsx scripts/compute.ts                     fetch the machine sources, then compute
 *   tsx scripts/compute.ts --offline           use only the committed snapshots
 *   tsx scripts/compute.ts --pending           write a pending revision (refresh dispatch)
 *   tsx scripts/compute.ts --figure fig-03     compute one figure (the reproduce command)
 *   tsx scripts/compute.ts --geo ES            compute another country (a data parameter)
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { FIGURES, figureById } from '../web/ingest/figures';
import { runCompute } from '../web/ingest/run-compute';
import { readDerivedFigures, writeDerivedFigures } from '../web/ingest/write-derived';
import type { DerivedFigure, FigureDefinition } from '../web/ingest/types';
import { sha256Hex } from '../web/manifest/hash';
import { PUBLISHED_GEO, isPublishedGeo } from '../web/sources/countries';
import { loadSnapshots } from '../web/sources/load';
import { fetchLiveSnapshots } from '../web/sources/live';
import type { SourceSnapshot } from '../web/sources/types';
import { createFileRevisionStore } from '../web/admin/persistence';
import { createRevision } from '../web/admin/revisions/pending-store';
import type { FigureChange } from '../web/admin/revisions/types';

const DERIVED_DIR = 'data/derived';
const REPRODUCE_PATH = 'scripts/compute.ts';

function argValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index === -1 ? undefined : process.argv[index + 1];
}

function freshnessWindowDays(): number {
  const parsed = Number.parseInt(process.env.ADMIN_FRESHNESS_WINDOW_DAYS ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 45;
}

function selectFigures(): readonly FigureDefinition[] {
  const requested = argValue('--figure');
  if (!requested) return FIGURES;
  const figure = figureById(requested);
  if (!figure) {
    console.error(`unknown figure: ${requested}`);
    process.exit(2);
  }
  return [figure];
}

async function mergedSnapshots(): Promise<SourceSnapshot[]> {
  const committed = [...loadSnapshots('data/snapshots').values()];
  if (process.argv.includes('--offline')) return committed;
  const live = await fetchLiveSnapshots(fetch, new Date());
  for (const failure of live.failures) console.error(`source failed: ${failure.sourceId}: ${failure.reason}`);
  return [...committed.filter((snapshot) => !live.snapshots.some((fresh) => fresh.sourceId === snapshot.sourceId)), ...live.snapshots];
}

function printReport(figures: readonly DerivedFigure[]): void {
  for (const figure of figures) {
    console.log(`${figure.figureId} ${figure.definitionId} ${figure.availability}${figure.unresolvedReason ? ` (${figure.unresolvedReason})` : ''}`);
  }
}

/** Dispatch mode (T14): recompute into `data/pending/`, never into `data/derived/`. */
function writePendingRevision(figures: readonly DerivedFigure[]): void {
  const previous = readDerivedFigures(DERIVED_DIR);
  const changes: FigureChange[] = figures
    .filter((figure) => figure.availability === 'computed')
    .map((figure) => ({
      figureId: figure.figureId,
      before: previous.find((candidate) => candidate.figureId === figure.figureId)?.value ?? null,
      after: figure.value,
      source: figure.manifest.sourceUrl,
      fetchedAt: figure.manifest.fetchedAt,
      inputHash: figure.manifest.inputHash,
      manifest: figure.manifest,
      unit: figure.unit,
      assumptions: { ...figure.assumptions },
    }));
  if (changes.length === 0) {
    console.error('no figure resolved: nothing to stage for review, nothing published');
    return;
  }
  const snapshotHash = sha256Hex(changes.map((change) => `${change.figureId}:${change.inputHash}`).join('|'));
  const result = createRevision({ store: createFileRevisionStore(), snapshotHash, changes, now: new Date() });
  console.log(JSON.stringify({ revision: result.revision.id, created: result.created, figures: changes.length }));
}

async function main(): Promise<number> {
  const geo = argValue('--geo') ?? PUBLISHED_GEO;
  if (!isPublishedGeo(geo)) {
    // A country is published from its own configuration entry; v1 ships Spain only (T2).
    console.error(`geo ${geo} is not published by this deployment: only ${PUBLISHED_GEO} is`);
    return 2;
  }
  const snapshots = new Map((await mergedSnapshots()).map((snapshot) => [snapshot.sourceId, snapshot]));
  const report = runCompute({
    figures: selectFigures(),
    snapshots,
    now: new Date(),
    freshnessWindowDays: freshnessWindowDays(),
    reproducePath: REPRODUCE_PATH,
    fileExists: (path) => existsSync(resolve(process.cwd(), path)),
    geo,
  });

  if (process.argv.includes('--pending')) writePendingRevision(report.figures);
  else writeDerivedFigures(DERIVED_DIR, report.figures);

  for (const problem of report.problems) {
    console.error(`${problem.figureId} ${problem.code} ${problem.sourceId ?? ''} ${problem.detail}`);
  }
  printReport(report.figures);
  return report.exitCode;
}

main()
  .then((code) => process.exit(code))
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'compute failed');
    process.exit(1);
  });
