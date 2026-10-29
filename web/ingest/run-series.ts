/**
 * The derived-series harness (T17, T18). Same contract as a figure: a required source that
 * failed to fetch fails the build, a stale snapshot fails, and nothing is written without a
 * manifest that validates.
 */
import { definitionTextFor } from '../manifest/definitions';
import { buildManifest, validateManifest } from '../manifest/validate';
import type { Manifest } from '../manifest/types';
import { evaluateFreshness } from '../sources/freshness';
import type { SnapshotMap, SourceSnapshot } from '../sources/types';
import type {
  DerivedSeries,
  SeriesComputeReport,
  SeriesDefinition,
  SeriesProblem,
} from './series-types';

export interface SeriesComputeOptions {
  series: readonly SeriesDefinition[];
  snapshots: SnapshotMap;
  now: Date;
  freshnessWindowDays: number;
  reproducePath: string;
  fileExists(path: string): boolean;
}

interface ResolvedInputs {
  inputs: Map<string, SourceSnapshot>;
  present: SourceSnapshot[];
  problem: SeriesProblem | null;
  /** A declared-but-unspecified source: a published state, not a failure (AC-001-74). */
  unresolved: string | null;
}

type Inspection =
  | { kind: 'ok'; snapshot: SourceSnapshot }
  | { kind: 'unresolved'; reason: string }
  | { kind: 'failure'; problem: SeriesProblem };

function inspectSource(series: SeriesDefinition, sourceId: string, options: SeriesComputeOptions): Inspection {
  const snapshot = options.snapshots.get(sourceId);
  if (!snapshot) {
    return {
      kind: 'failure',
      problem: { seriesId: series.seriesId, sourceId, code: 'missing-source', detail: 'no committed snapshot' },
    };
  }
  if (!snapshot.resolved) {
    // Distinct from a failed fetch: the series was never specified, so the block publishes
    // `unavailable` and the build stays green. A fetch failure never reaches this branch.
    return { kind: 'unresolved', reason: snapshot.unresolvedReason ?? 'series not specified' };
  }
  const freshness = evaluateFreshness(snapshot.retrievedAt, options.freshnessWindowDays, options.now);
  if (!freshness.fresh) {
    return {
      kind: 'failure',
      problem: {
        seriesId: series.seriesId,
        sourceId,
        code: 'stale-snapshot',
        detail: freshness.reason ?? 'outside freshness window',
      },
    };
  }
  return { kind: 'ok', snapshot };
}

function applyInspection(collected: ResolvedInputs, sourceId: string, inspected: Inspection): void {
  if (inspected.kind === 'ok') {
    collected.inputs.set(sourceId, inspected.snapshot);
    collected.present.push(inspected.snapshot);
    return;
  }
  if (inspected.kind === 'unresolved') {
    collected.unresolved = collected.unresolved ?? `${sourceId}: ${inspected.reason}`;
    return;
  }
  collected.problem = collected.problem ?? inspected.problem;
}

function collectInputs(series: SeriesDefinition, options: SeriesComputeOptions): ResolvedInputs {
  const collected: ResolvedInputs = { inputs: new Map(), present: [], problem: null, unresolved: null };
  for (const sourceId of series.requirementSources) {
    applyInspection(collected, sourceId, inspectSource(series, sourceId, options));
  }
  return collected;
}

function oldestRetrievedAt(snapshots: readonly SourceSnapshot[], fallback: Date): Date {
  return snapshots.reduce((oldest, snapshot) => {
    const parsed = Date.parse(snapshot.retrievedAt);
    return Number.isNaN(parsed) || parsed >= oldest.getTime() ? oldest : new Date(parsed);
  }, fallback);
}

function sourceUrls(snapshots: readonly SourceSnapshot[]): string[] {
  return [...new Set(snapshots.flatMap((snapshot) => snapshot.sourceUrl))].sort();
}

/** The vintage year, recorded here at ingest from the snapshot date and never at render time. */
export function snapshotYearOf(fetchedAt: Date): number {
  return fetchedAt.getUTCFullYear();
}

function manifestFor(
  series: SeriesDefinition,
  present: readonly SourceSnapshot[],
  options: SeriesComputeOptions,
): Manifest {
  const fetchedAt = oldestRetrievedAt(present, options.now);
  return buildManifest({
    sourceUrl: sourceUrls(present),
    fetchedAt,
    formulaId: series.formulaId,
    definitionId: series.definitionId,
    inputBytes: [`series:${series.seriesId}`, ...present.map((snapshot) => `${snapshot.sourceId}:${snapshot.bytes}`)].sort().join('\u0000'),
    reproducePath: options.reproducePath,
    snapshotYear: snapshotYearOf(fetchedAt),
  });
}

function unavailable(
  series: SeriesDefinition,
  manifest: Manifest,
  reason: string,
): DerivedSeries {
  return {
    seriesId: series.seriesId,
    formulaId: series.formulaId,
    availability: 'unavailable',
    definitionId: series.definitionId,
    definition: definitionTextFor(series.definitionId),
    value: null,
    assumptions: {},
    manifest,
    unresolvedSources: [...series.requirementSources],
    unresolvedReason: reason,
  };
}

function computed(
  series: SeriesDefinition,
  value: unknown,
  assumptions: Readonly<Record<string, string | number | null>>,
  manifest: Manifest,
): DerivedSeries {
  return {
    seriesId: series.seriesId,
    formulaId: series.formulaId,
    availability: 'computed',
    definitionId: series.definitionId,
    definition: definitionTextFor(series.definitionId),
    value,
    assumptions,
    manifest,
    unresolvedSources: [],
  };
}

type Outcome = { series: DerivedSeries; problems: SeriesProblem[] };

/**
 * The states in which there is nothing to compute. `null` means the series can be computed.
 */
function unfinishedOutcome(
  series: SeriesDefinition,
  manifest: Manifest,
  collected: ResolvedInputs,
  options: SeriesComputeOptions,
): Outcome | null {
  if (collected.problem) {
    return { series: unavailable(series, manifest, collected.problem.detail), problems: [collected.problem] };
  }
  if (collected.unresolved !== null) {
    return { series: unavailable(series, manifest, collected.unresolved), problems: [] };
  }
  const validation = validateManifest(manifest, { fileExists: options.fileExists });
  if (validation.ok) return null;
  const problems = validation.problems.map((problem) => ({
    seriesId: series.seriesId,
    code: 'manifest-invalid' as const,
    detail: `${problem.field}: ${problem.code}`,
  }));
  return { series: unavailable(series, manifest, 'manifest did not validate'), problems };
}

function runSeries(series: SeriesDefinition, options: SeriesComputeOptions): Outcome {
  const collected = collectInputs(series, options);
  const manifest = manifestFor(series, collected.present, options);
  const unfinished = unfinishedOutcome(series, manifest, collected, options);
  if (unfinished) return unfinished;
  try {
    const computation = series.compute(collected.inputs, { snapshotYear: manifest.snapshotYear ?? 0 });
    return { series: computed(series, computation.value, computation.assumptions, manifest), problems: [] };
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'compute failed';
    return {
      series: unavailable(series, manifest, detail),
      problems: [{ seriesId: series.seriesId, code: 'compute-failed', detail }],
    };
  }
}

/**
 * Runs the derived series over the committed snapshots. A missing, unresolved or stale source
 * fails the build (non-zero) — a series may not publish `unavailable` to dodge a fetch failure
 * (AC-001-05/06, unchanged).
 */
export function runSeriesCompute(options: SeriesComputeOptions): SeriesComputeReport {
  const results = options.series.map((series) => runSeries(series, options));
  return {
    exitCode: results.some((result) => result.problems.length > 0) ? 1 : 0,
    series: results.map((result) => result.series),
    problems: results.flatMap((result) => result.problems),
  };
}
