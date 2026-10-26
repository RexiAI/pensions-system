import type { DefinitionId } from '../manifest/definitions';
import type { FormulaId } from '../manifest/formula-ids';
import type { Manifest } from '../manifest/types';
import type { SourceSnapshot } from '../sources/types';

/**
 * Seven published figures: five international-definition slots and the national
 * definitions that ride beside them. `fig-01`/`fig-02` are the two internationally
 * comparable definitions; `fig-06`/`fig-07` are the national definitions of the same
 * metrics — separate figures, never variants of one number.
 */
export type FigureId =
  | 'fig-01'
  | 'fig-02'
  | 'fig-03'
  | 'fig-04'
  | 'fig-05'
  | 'fig-06'
  | 'fig-07';

export const FIGURE_IDS: readonly FigureId[] = [
  'fig-01',
  'fig-02',
  'fig-03',
  'fig-04',
  'fig-05',
  'fig-06',
  'fig-07',
];

/**
 * Publication state of a figure, a sibling of `manifest` (T1). It is never a way to publish
 * a value without provenance: `computed` requires a value *and* a complete manifest,
 * `unavailable` requires the absence of a value.
 */
export type FigureAvailability = 'computed' | 'unavailable';

export const FIGURE_AVAILABILITY: readonly FigureAvailability[] = ['computed', 'unavailable'];

export interface FigureComputation {
  /** The published payload. Shape is metric-specific and unit-annotated. */
  value: unknown;
  /** Assumptions the value is only valid under (T7 requires these beside the value). */
  assumptions: Readonly<Record<string, string | number | null>>;
}

export interface FigureDefinition {
  figureId: FigureId;
  formulaId: FormulaId;
  /** Which published definition produces this figure's value (T1, AC-001-77). */
  definitionId: DefinitionId;
  /**
   * `international` definitions resolve their sources through the requested country
   * (`geo`); `national` definitions carry a fixed source list for their one country.
   */
  geography: 'international' | 'national';
  unit: string;
  /** Snapshot ids for a national definition. Empty for a country-parameterised one. */
  requirementSources: readonly string[];
  compute(inputs: ReadonlyMap<string, SourceSnapshot>): FigureComputation;
}

export interface DerivedFigure {
  figureId: FigureId;
  formulaId: FormulaId;
  /** `computed` ships a value and a complete manifest; `unavailable` ships neither. */
  availability: FigureAvailability;
  /** The published definition that produced the value (AC-001-77). */
  definitionId: DefinitionId;
  /** Canonical instrument vocabulary for that definition, recorded beside the value. */
  definition: string;
  unit: string;
  value: unknown | null;
  assumptions: Readonly<Record<string, string | number | null>>;
  manifest: Manifest;
  /** Declared source series this deployment has not resolved (never a fetch failure). */
  unresolvedSources: readonly string[];
  unresolvedReason?: string;
}

export type ComputeProblemCode =
  | 'missing-source'
  | 'stale-snapshot'
  | 'manifest-invalid'
  | 'compute-failed'
  | 'country-not-configured';

export interface ComputeProblem {
  figureId: FigureId;
  sourceId?: string;
  code: ComputeProblemCode;
  detail: string;
}

export interface ComputeReport {
  exitCode: number;
  figures: DerivedFigure[];
  problems: ComputeProblem[];
}
