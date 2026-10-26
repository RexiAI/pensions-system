import type { DefinitionId } from './definitions';
import type { FormulaId } from './formula-ids';

/**
 * Provenance record carried by every derived figure (T1). No number may be published
 * without one: the ingest harness refuses to emit a figure whose manifest does not
 * validate, and the public page renders the `withheld` plate state instead.
 */
export interface Manifest {
  /** One or more named official source URLs (never a bare domain, never empty). */
  sourceUrl: string[];
  /** ISO-8601 UTC timestamp, exactly `YYYY-MM-DDTHH:MM:SSZ`. */
  fetchedAt: string;
  /** Stable identifier drawn from the documented, closed formula set. */
  formulaId: FormulaId;
  /**
   * The published definition that produced this value (T1). Two numbers computed on
   * different definitions can therefore never be compared without the difference visible.
   */
  definitionId: DefinitionId;
  /** SHA-256 hex digest of the raw ingested input snapshot bytes. */
  inputHash: string;
  /** Repo-relative path to the committed script that reproduces the figure. */
  reproducePath: string;
}

export type ManifestField = keyof Manifest;

export type ManifestProblemCode =
  | 'missing'
  | 'empty'
  | 'malformed'
  | 'unknownFormulaId'
  | 'unknownDefinitionId'
  | 'missingFile';

export interface ManifestProblem {
  field: ManifestField;
  code: ManifestProblemCode;
  detail: string;
}

export type ManifestValidation = { ok: true } | { ok: false; problems: ManifestProblem[] };

/** Anything that claims to carry provenance; validated before publication. */
export interface ManifestedFigure {
  figureId: string;
  manifest: Manifest;
}
