/**
 * Metric 5 (T7): the contributor-base growth the scheme must sustain to pay the return
 * it promises, compared with the growth INE projects (Aaron-Samuelson steady state).
 *
 * Every returned value carries its own assumptions, because a gap whose `g_proj` and
 * `g_wage` are invisible is not checkable (AC-001-31).
 */
export const DEFAULT_G_WAGE_SWEEP = [0, 0.01, 0.02] as const;
export const DEFAULT_HORIZON = { from: 2026, to: 2070 } as const;

export interface Horizon {
  from: number;
  to: number;
}

export interface BaseGrowthInput {
  /** Nominal cohort return from T5. */
  rPaidNominal: number;
  /** Assumed annual inflation, stated. */
  inflation: number;
  /** Assumed annual real wage growth. */
  gWage: number;
  /** Annual contributor-base growth implied by the population projection. */
  gProj: number;
  horizon: Horizon;
}

export interface BaseGrowthValue {
  rPaidReal: number;
  gWage: number;
  gProj: number;
  gRequired: number;
  gap: number;
  horizon: Horizon;
}

export interface SensitivityCell {
  gWage: number;
  /**
   * The nominal return this cell was swept over (b is taken from the T5 band). Carried so a
   * reader — and the central-cell lookup — can identify the cell by its inputs rather than
   * infer them back out of `rPaidReal`, which has already been deflated.
   */
  rPaidNominal: number;
  /** The deflated rate the formula consumed: what a reader compares against `gWage`. */
  rPaidReal: number;
  gRequired: number;
  gap: number;
}

export function realRate(nominal: number, inflation: number): number {
  return (1 + nominal) / (1 + inflation) - 1;
}

/** Annualised growth between two observations `years` apart. */
export function annualisedGrowthRate(first: number, last: number, years: number): number {
  if (first <= 0 || years === 0) return 0;
  return (last / first) ** (1 / years) - 1;
}

export function requiredBaseGrowth(input: BaseGrowthInput): BaseGrowthValue {
  const rPaidReal = realRate(input.rPaidNominal, input.inflation);
  const gRequired = rPaidReal - input.gWage;
  return {
    rPaidReal,
    gWage: input.gWage,
    gProj: input.gProj,
    gRequired,
    gap: gRequired - input.gProj,
    horizon: input.horizon,
  };
}

/** 3 x 3 grid: `g_wage` sweep against the T5 band (min / central / max). */
export function sensitivityGrid(params: {
  band: { min: number; central: number; max: number };
  inflation: number;
  gWages?: readonly number[];
  gProj: number;
  horizon: Horizon;
}): SensitivityCell[] {
  const gWages = params.gWages ?? DEFAULT_G_WAGE_SWEEP;
  const rPaidNominals = [params.band.min, params.band.central, params.band.max];
  const cells: SensitivityCell[] = [];
  for (const gWage of gWages) {
    for (const rPaidNominal of rPaidNominals) {
      const value = requiredBaseGrowth({
        rPaidNominal,
        inflation: params.inflation,
        gWage,
        gProj: params.gProj,
        horizon: params.horizon,
      });
      cells.push({
        gWage,
        rPaidNominal,
        rPaidReal: value.rPaidReal,
        gRequired: value.gRequired,
        gap: value.gap,
      });
    }
  }
  return cells;
}

/** What T7 publishes: the central result, its 3 x 3 grid, and the band it was swept over. */
export interface BaseGrowthFigureValue {
  central: BaseGrowthValue;
  grid: SensitivityCell[];
  band: { min: number; central: number; max: number };
}
