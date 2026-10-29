import type { SeriesDefinitionId } from '../manifest/definitions';
import type { FormulaId } from '../manifest/formula-ids';
import type { Manifest } from '../manifest/types';
import type { SourceSnapshot } from '../sources/types';

/**
 * The derived series (T17, T18): data views that are not one of the five metrics. A series
 * carries the same provenance contract as a figure — its own manifest, its own closed
 * `formulaId`/`definitionId`, its own digest and reproduce path — but no figure number, no
 * hero eligibility and no place in the metric edge-case contract.
 *
 * They are written to `data/derived/series/`, never to `data/derived/`, so the flat figure
 * loader cannot cast one to the closed `FigureId` union (AC-001-96).
 */
export type SeriesId = 'pyramid' | 'countdown';

export const SERIES_IDS: readonly SeriesId[] = ['pyramid', 'countdown'];

export function isSeriesId(value: unknown): value is SeriesId {
  return typeof value === 'string' && (SERIES_IDS as readonly string[]).includes(value);
}

export type SeriesAvailability = 'computed' | 'unavailable';

export const SERIES_AVAILABILITY: readonly SeriesAvailability[] = ['computed', 'unavailable'];

export interface DerivedSeries {
  seriesId: SeriesId;
  formulaId: FormulaId;
  availability: SeriesAvailability;
  definitionId: SeriesDefinitionId;
  /** Canonical instrument vocabulary for that definition, recorded beside the value. */
  definition: string;
  value: unknown | null;
  assumptions: Readonly<Record<string, string | number | null>>;
  manifest: Manifest;
  unresolvedSources: readonly string[];
  unresolvedReason?: string;
}

export type SeriesProblemCode =
  | 'missing-source'
  | 'stale-snapshot'
  | 'manifest-invalid'
  | 'compute-failed';

export interface SeriesProblem {
  seriesId: SeriesId;
  sourceId?: string;
  code: SeriesProblemCode;
  detail: string;
}

export interface SeriesComputeReport {
  exitCode: number;
  series: DerivedSeries[];
  problems: SeriesProblem[];
}

/** What a series needs from the harness: its definition, its sources and its computation. */
export interface SeriesDefinition {
  seriesId: SeriesId;
  definitionId: SeriesDefinitionId;
  formulaId: FormulaId;
  requirementSources: readonly string[];
  compute(
    inputs: ReadonlyMap<string, SourceSnapshot>,
    context: { snapshotYear: number },
  ): { value: unknown; assumptions: Readonly<Record<string, string | number | null>> };
}
