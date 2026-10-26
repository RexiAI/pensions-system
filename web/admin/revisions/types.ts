import { definitionFor, isMetricDefinitionId } from '../../manifest/definitions';
import type { DerivedFigure, FigureId } from '../../ingest/types';
import type { Manifest } from '../../manifest/types';

export type RevisionStatus = 'pending' | 'superseded' | 'published';

/**
 * One figure's diff inside a pending revision (T14): old value, new value, source,
 * timestamp and input hash travel together, plus the complete manifest the new value
 * will carry. An approval cannot synthesise a figure from a bare number.
 */
export interface FigureChange {
  figureId: FigureId;
  before: unknown;
  after: unknown;
  source: string[];
  fetchedAt: string;
  inputHash: string;
  manifest: Manifest;
  unit: string;
  assumptions: Record<string, string | number | null>;
}

export interface PendingRevision {
  id: string;
  createdAt: string;
  /** Hash of the source snapshot set this revision was computed from. */
  snapshotHash: string;
  status: RevisionStatus;
  changes: FigureChange[];
  supersededBy?: string;
  publishedCommit?: string;
}

export interface RevisionStore {
  list(): PendingRevision[];
  get(id: string): PendingRevision | undefined;
  save(revision: PendingRevision): void;
}

/**
 * A figure ready to publish, built only from a reviewed change. A revision is a *figure*
 * revision (T14): a manifest carrying a derived-series definition has no figure to publish, so
 * it is rejected here rather than being coerced into the figure registry.
 */
export function changeToFigure(change: FigureChange): DerivedFigure {
  const definitionId = change.manifest.definitionId;
  if (!isMetricDefinitionId(definitionId)) {
    throw new Error(`a figure revision cannot publish the series definition ${definitionId}`);
  }
  return {
    figureId: change.figureId,
    formulaId: change.manifest.formulaId,
    availability: 'computed',
    definitionId,
    definition: definitionFor(definitionId).definition,
    unit: change.unit,
    value: change.after,
    assumptions: change.assumptions,
    manifest: change.manifest,
    unresolvedSources: [],
  };
}
