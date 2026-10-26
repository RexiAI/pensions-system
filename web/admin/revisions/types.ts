import { definitionFor } from '../../manifest/definitions';
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

/** A figure ready to publish, built only from a reviewed change. */
export function changeToFigure(change: FigureChange): DerivedFigure {
  return {
    figureId: change.figureId,
    formulaId: change.manifest.formulaId,
    availability: 'computed',
    definitionId: change.manifest.definitionId,
    definition: definitionFor(change.manifest.definitionId).definition,
    unit: change.unit,
    value: change.after,
    assumptions: change.assumptions,
    manifest: change.manifest,
    unresolvedSources: [],
  };
}
