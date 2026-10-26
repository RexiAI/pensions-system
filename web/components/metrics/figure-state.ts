import type { LocaleKey } from '../../content/keys';
import type { DerivedFigure } from '../../ingest/types';
import { manifestFieldProblems } from '../../manifest/validate';

/**
 * The five states of the state model (design §State model, amended by Revision 1 D1).
 * `stale` never reaches a production page: the build fails instead (T2).
 */
export type FigureState = 'computed' | 'null-value' | 'unavailable' | 'withheld';

export interface FigureValueShape {
  /** The figure's headline value is undefined for this deployment (a formula edge case). */
  headlineIsNull: boolean;
  /** Every plotted point is undefined: there is no figure to draw at all. */
  allPointsNull: boolean;
}

/**
 * The chip text of a ledger state. `computed` and `null-value` carry no chip: a plate carries
 * its provenance strip instead, and a null value says `no definido` in the table.
 */
export function chipKey(state: FigureState): LocaleKey | null {
  if (state === 'unavailable') return 'figure.unavailable.chip';
  if (state === 'withheld') return 'figure.withheld.chip';
  return null;
}

/** States that render a ledger row instead of a plate. */
export function isLedgerState(state: FigureState): state is 'unavailable' | 'withheld' {
  return state === 'unavailable' || state === 'withheld';
}

/**
 * Derives the published state. A figure claiming `computed` while carrying no value or a
 * structurally broken manifest is `withheld` — never a plate with a bare number. A figure
 * whose every data point is undefined is promoted to `unavailable`, so there is no state in
 * which a plate renders empty axes (D1).
 */
export function figureState(figure: DerivedFigure, shape: FigureValueShape): FigureState {
  if (figure.availability === 'unavailable') return 'unavailable';
  if (figure.value === null) return 'withheld';
  if (manifestFieldProblems(figure.manifest).length > 0) return 'withheld';
  if (shape.allPointsNull) return 'unavailable';
  return shape.headlineIsNull ? 'null-value' : 'computed';
}
