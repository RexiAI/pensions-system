import { irrBisection } from './npv';

/**
 * Metric 3 (T5): internal rate of return of contributions paid in versus benefits drawn
 * out for a representative cohort, published with its sensitivity band.
 *
 * Assumptions are Spain's statutory shape: 12 contribution months and 14 pension
 * payments per year (open question 4), entry at 25 and retirement at 65 (open question 5).
 */
export const COHORT_ASSUMPTIONS = {
  entryAge: 25,
  retirementAge: 65,
  contributionMonths: 12,
  pensionPayments: 14,
} as const;

export interface CohortInput {
  entryAge: number;
  retirementAge: number;
  /** Expected years drawing a pension, from INE mortality tables. */
  lifeExpectancyAtRetirement: number;
  averageMonthlyContribution: number;
  averageMonthlyPension: number;
}

export interface CohortAnnualAmounts {
  yearsContributing: number;
  yearsDrawing: number;
  annualContribution: number;
  annualPension: number;
}

export interface CohortCashflows extends CohortAnnualAmounts {
  flows: number[];
}

export interface SensitivityBand {
  min: number;
  max: number;
}

export interface CohortReturnValue extends CohortAnnualAmounts {
  central: number | null;
  band: SensitivityBand | null;
  lifeExpectancyAtRetirement: number;
}

function wholeYears(value: number): number {
  return Math.max(0, Math.round(value));
}

export function buildCashflows(input: CohortInput): CohortCashflows {
  const yearsContributing = wholeYears(input.retirementAge - input.entryAge);
  const yearsDrawing = wholeYears(input.lifeExpectancyAtRetirement);
  const annualContribution = input.averageMonthlyContribution * COHORT_ASSUMPTIONS.contributionMonths;
  const annualPension = input.averageMonthlyPension * COHORT_ASSUMPTIONS.pensionPayments;
  const flows = [
    ...Array.from({ length: yearsContributing }, () => -annualContribution),
    ...Array.from({ length: yearsDrawing }, () => annualPension),
  ];
  return { flows, yearsContributing, yearsDrawing, annualContribution, annualPension };
}

/** IRR of one cohort. `-1` when no benefit year exists; `null` when nothing was paid in. */
export function cohortIrr(input: CohortInput): number | null {
  if (input.averageMonthlyContribution <= 0) return null;
  if (wholeYears(input.lifeExpectancyAtRetirement) <= 0) return -1;
  return irrBisection(buildCashflows(input).flows);
}

function scaled(input: CohortInput, factor: Partial<CohortInput>): CohortInput {
  return { ...input, ...factor };
}

/**
 * The sensitivity band over the 3 x 3 x 3 grid the task fixes: life expectancy
 * {central - 2, central, central + 2}, contribution {-10%, central, +10%},
 * pension {-10%, central, +10%}. The central value is one of the grid points.
 */
export function cohortReturn(input: CohortInput): CohortReturnValue {
  const { yearsContributing, yearsDrawing, annualContribution, annualPension } = buildCashflows(input);
  const central = cohortIrr(input);
  const grid: number[] = [];
  const lifeExpectancies = [
    input.lifeExpectancyAtRetirement - 2,
    input.lifeExpectancyAtRetirement,
    input.lifeExpectancyAtRetirement + 2,
  ];
  const contributionFactors = [0.9, 1, 1.1];
  const pensionFactors = [0.9, 1, 1.1];
  for (const life of lifeExpectancies) {
    for (const contributionFactor of contributionFactors) {
      for (const pensionFactor of pensionFactors) {
        const value = cohortIrr(
          scaled(input, {
            lifeExpectancyAtRetirement: life,
            averageMonthlyContribution: input.averageMonthlyContribution * contributionFactor,
            averageMonthlyPension: input.averageMonthlyPension * pensionFactor,
          }),
        );
        if (value !== null) grid.push(value);
      }
    }
  }
  const band = grid.length > 0 ? { min: Math.min(...grid), max: Math.max(...grid) } : null;
  return {
    central,
    band,
    yearsContributing,
    yearsDrawing,
    annualContribution,
    annualPension,
    lifeExpectancyAtRetirement: input.lifeExpectancyAtRetirement,
  };
}
