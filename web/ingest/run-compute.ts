import { buildManifest, validateManifest } from '../manifest/validate';
import { sha256Hex } from '../manifest/hash';
import type { Manifest } from '../manifest/types';
import { definitionFor } from '../manifest/definitions';
import { evaluateFreshness } from '../sources/freshness';
import { PUBLISHED_GEO, countryConfiguration, sourcesForDefinition } from '../sources/countries';
import type { CountryConfiguration } from '../sources/countries';
import { findSource } from '../sources/types';
import type { SnapshotMap, SourceSnapshot } from '../sources/types';
import type {
  ComputeProblem,
  ComputeReport,
  DerivedFigure,
  FigureComputation,
  FigureDefinition,
} from './types';

export interface ComputeOptions {
  figures: readonly FigureDefinition[];
  snapshots: SnapshotMap;
  now: Date;
  freshnessWindowDays: number;
  reproducePath: string;
  fileExists(path: string): boolean;
  /** The country the figures are computed for (T2: `geo` is a data parameter). */
  geo?: string;
  /** Country configurations; injected by tests so a second country is a data change. */
  countries?: readonly CountryConfiguration[];
}

interface UnresolvedSource {
  sourceId: string;
  reason: string;
}

interface InputCollection {
  inputs: Map<string, SourceSnapshot>;
  /** Declared-but-never-specified sources: a published state, not a failure (AC-001-74). */
  unresolved: UnresolvedSource[];
  failures: ComputeProblem[];
}

type Inspection =
  | { kind: 'ok'; snapshot: SourceSnapshot }
  | { kind: 'unresolved'; unresolved: UnresolvedSource }
  | { kind: 'failure'; problem: ComputeProblem };

interface ResolvedSources {
  sourceIds: readonly string[];
  /** Set when the definition has no source for the requested country (AC-001-81). */
  missingForCountry: string | null;
}

/**
 * The snapshot ids a figure needs for this country. A `national` definition carries its own
 * fixed list; an `international` one resolves through the country configuration, so a
 * country without a source for the definition gets no sources — and therefore no value —
 * while its `definitionId` stays exactly what it was.
 */
function resolveSources(def: FigureDefinition, options: ComputeOptions): ResolvedSources {
  if (def.geography === 'national') return { sourceIds: def.requirementSources, missingForCountry: null };
  const geo = options.geo ?? PUBLISHED_GEO;
  const sourceIds = sourcesForDefinition(geo, def.definitionId, options.countries);
  if (sourceIds) return { sourceIds, missingForCountry: null };
  return { sourceIds: [], missingForCountry: geo };
}

function inspectSource(
  def: FigureDefinition,
  sourceId: string,
  snapshots: SnapshotMap,
  options: ComputeOptions,
): Inspection {
  const snapshot = snapshots.get(sourceId);
  if (!snapshot) {
    return {
      kind: 'failure',
      problem: { figureId: def.figureId, sourceId, code: 'missing-source', detail: 'no committed snapshot' },
    };
  }
  if (!snapshot.resolved) {
    return {
      kind: 'unresolved',
      unresolved: { sourceId, reason: snapshot.unresolvedReason ?? 'series not specified' },
    };
  }
  const freshness = evaluateFreshness(snapshot.retrievedAt, options.freshnessWindowDays, options.now);
  if (!freshness.fresh) {
    return {
      kind: 'failure',
      problem: {
        figureId: def.figureId,
        sourceId,
        code: 'stale-snapshot',
        detail: freshness.reason ?? 'outside freshness window',
      },
    };
  }
  return { kind: 'ok', snapshot };
}

function inspectSources(
  def: FigureDefinition,
  snapshots: SnapshotMap,
  options: ComputeOptions,
): Inspection[] {
  return resolveSources(def, options).sourceIds.map((sourceId) =>
    inspectSource(def, sourceId, snapshots, options),
  );
}

function collectInputs(inspections: readonly Inspection[]): InputCollection {
  const inputs = new Map<string, SourceSnapshot>();
  const unresolved: UnresolvedSource[] = [];
  const failures: ComputeProblem[] = [];
  for (const inspection of inspections) {
    if (inspection.kind === 'ok') inputs.set(inspection.snapshot.sourceId, inspection.snapshot);
    if (inspection.kind === 'unresolved') unresolved.push(inspection.unresolved);
    if (inspection.kind === 'failure') failures.push(inspection.problem);
  }
  return { inputs, unresolved, failures };
}

function oldestRetrievedAt(snapshots: readonly SourceSnapshot[], fallback: Date): Date {
  let oldest = fallback.getTime();
  for (const snapshot of snapshots) {
    const parsed = Date.parse(snapshot.retrievedAt);
    if (!Number.isNaN(parsed) && parsed < oldest) oldest = parsed;
  }
  return new Date(oldest);
}

/** Every required source record, resolved or not: the hash covers what was ingested. */
function recordsFor(
  def: FigureDefinition,
  snapshots: SnapshotMap,
  options: ComputeOptions,
): Array<{ sourceId: string; snapshot?: SourceSnapshot }> {
  return resolveSources(def, options).sourceIds.map((sourceId) => ({
    sourceId,
    snapshot: snapshots.get(sourceId),
  }));
}

function manifestSources(records: ReturnType<typeof recordsFor>): string[] {
  const urls = new Set<string>();
  for (const record of records) {
    if (record.snapshot) {
      for (const url of record.snapshot.sourceUrl) urls.add(url);
      continue;
    }
    const declaration = findSource(record.sourceId);
    if (declaration) urls.add(declaration.publisherUrl);
  }
  return [...urls].sort();
}

function inputBytes(records: ReturnType<typeof recordsFor>, figureId: string, geo: string): string {
  return [
    `figure:${figureId}`,
    `geo:${geo}`,
    ...records.map((record) => `${record.sourceId}:${record.snapshot?.bytes ?? 'missing'}`),
  ]
    .sort()
    .join('\u0000');
}

function buildFigureManifest(def: FigureDefinition, options: ComputeOptions): Manifest {
  const geo = options.geo ?? PUBLISHED_GEO;
  const records = recordsFor(def, options.snapshots, options);
  const present = records
    .map((record) => record.snapshot)
    .filter((snapshot): snapshot is SourceSnapshot => snapshot !== undefined);
  return buildManifest({
    sourceUrl: manifestSources(records),
    fetchedAt: oldestRetrievedAt(present, options.now),
    formulaId: def.formulaId,
    definitionId: def.definitionId,
    inputBytes: inputBytes(records, def.figureId, geo),
    reproducePath: options.reproducePath,
  });
}

/** An `unavailable` figure: no value, a complete manifest, and the sources behind its absence. */
function unavailableFigure(
  def: FigureDefinition,
  manifest: Manifest,
  unresolvedSources: readonly string[],
  reason: string,
): DerivedFigure {
  return {
    figureId: def.figureId,
    formulaId: def.formulaId,
    availability: 'unavailable',
    definitionId: def.definitionId,
    definition: definitionFor(def.definitionId).definition,
    unit: def.unit,
    value: null,
    assumptions: {},
    manifest,
    unresolvedSources: [...new Set(unresolvedSources)],
    unresolvedReason: reason,
  };
}

function reasonFor(collection: InputCollection): string {
  return [
    ...collection.unresolved.map((source) => `${source.sourceId}: ${source.reason}`),
    ...collection.failures.map((problem) => `${problem.sourceId ?? 'input'}: ${problem.detail}`),
  ].join('; ');
}

function sourcesFor(collection: InputCollection): string[] {
  return [
    ...collection.unresolved.map((source) => source.sourceId),
    ...collection.failures.map((problem) => problem.sourceId).filter((id): id is string => Boolean(id)),
  ];
}

function computedFigure(
  def: FigureDefinition,
  computation: FigureComputation,
  manifest: Manifest,
  options: ComputeOptions,
): { figure: DerivedFigure; problems: ComputeProblem[] } {
  const validation = validateManifest(manifest, { fileExists: options.fileExists });
  if (!validation.ok) {
    const problems = validation.problems.map((problem) => ({
      figureId: def.figureId,
      code: 'manifest-invalid' as const,
      detail: `${problem.field}: ${problem.code}`,
    }));
    return {
      figure: unavailableFigure(def, manifest, [], 'manifest did not validate'),
      problems,
    };
  }
  return {
    figure: {
      figureId: def.figureId,
      formulaId: def.formulaId,
      availability: 'computed',
      definitionId: def.definitionId,
      definition: definitionFor(def.definitionId).definition,
      unit: def.unit,
      value: computation.value,
      assumptions: computation.assumptions,
      manifest,
      unresolvedSources: [],
    },
    problems: [],
  };
}

type Outcome = { figure: DerivedFigure; problems: ComputeProblem[] };

/**
 * The states in which there is nothing to compute: a definition this country has no source
 * for (AC-001-81), a source that failed, or a source that was never specified. `null` means
 * the figure can be computed.
 */
function unfinishedOutcome(
  def: FigureDefinition,
  manifest: Manifest,
  resolved: ResolvedSources,
  collection: InputCollection,
): Outcome | null {
  if (resolved.missingForCountry) {
    const reason = `no source configured for geo ${resolved.missingForCountry}`;
    return { figure: unavailableFigure(def, manifest, [], reason), problems: [] };
  }
  if (collection.failures.length > 0) {
    const reason = reasonFor(collection);
    return { figure: unavailableFigure(def, manifest, sourcesFor(collection), reason), problems: collection.failures };
  }
  if (collection.unresolved.length > 0) {
    const reason = reasonFor(collection);
    return { figure: unavailableFigure(def, manifest, sourcesFor(collection), reason), problems: [] };
  }
  return null;
}

function computeOutcome(
  def: FigureDefinition,
  inputs: Map<string, SourceSnapshot>,
  manifest: Manifest,
  options: ComputeOptions,
): Outcome {
  try {
    return computedFigure(def, def.compute(inputs), manifest, options);
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'compute failed';
    return {
      figure: unavailableFigure(def, manifest, [], detail),
      problems: [{ figureId: def.figureId, code: 'compute-failed', detail }],
    };
  }
}

function runFigure(def: FigureDefinition, options: ComputeOptions): Outcome {
  const collection = collectInputs(inspectSources(def, options.snapshots, options));
  const manifest = buildFigureManifest(def, options);
  const unfinished = unfinishedOutcome(def, manifest, resolveSources(def, options), collection);
  if (unfinished) return unfinished;
  return computeOutcome(def, collection.inputs, manifest, options);
}

/**
 * Runs every figure definition over the committed snapshots for one country.
 *
 * Exit is non-zero only on a real failure: an unconfigured country, a required source
 * missing from disk, a snapshot outside the freshness window, a manifest that does not
 * validate, or a compute error. A source declared but not yet specified is not a failure —
 * it publishes the figure as `availability: 'unavailable'` and exits 0 (AC-001-74,
 * AC-001-05, AC-001-06). A definition the country has no source for is the same
 * `unavailable` state, with its `definitionId` unchanged (AC-001-81).
 */
export function runCompute(options: ComputeOptions): ComputeReport {
  const geo = options.geo ?? PUBLISHED_GEO;
  if (!countryConfiguration(geo, options.countries)) {
    const figures = options.figures.map((def) =>
      unavailableFigure(
        def,
        buildFigureManifest(def, options),
        [],
        `geo ${geo} is not configured in this deployment`,
      ),
    );
    const problems = options.figures.map((def) => ({
      figureId: def.figureId,
      code: 'country-not-configured' as const,
      detail: `geo ${geo} is not configured in this deployment`,
    }));
    return { exitCode: 1, figures, problems };
  }
  const figures: DerivedFigure[] = [];
  const problems: ComputeProblem[] = [];
  for (const def of options.figures) {
    const outcome = runFigure(def, options);
    figures.push(outcome.figure);
    problems.push(...outcome.problems);
  }
  return { exitCode: problems.length === 0 ? 0 : 1, figures, problems };
}

/** Digest helper used by the harness tests: the hash a figure's inputs would produce. */
export function hashInputBytes(bytes: string): string {
  return sha256Hex(bytes);
}
