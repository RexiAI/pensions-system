import { definitionFor } from '../manifest/definitions';
import type { MetricDefinitionId } from '../manifest/definitions';
import { contributionCoverSeries } from '../metrics/contribution-cover';
import { dependencyRatioSeries } from '../metrics/dependency-ratio';
import type { DependencyRatioPoint } from '../metrics/dependency-ratio';
import { COHORT_ASSUMPTIONS, cohortReturn } from '../metrics/cohort-irr';
import type { CohortInput } from '../metrics/cohort-irr';
import { implicitDebt } from '../metrics/implicit-debt';
import { pensionShareSeries } from '../metrics/pension-share';
import {
  readEmployedPersons,
  readOldAgeBeneficiaries,
  readPensionExpenditureShare,
} from '../sources/eurostat';
import type { EmploymentSeries, EurostatSeries } from '../sources/eurostat';
import { latestObservation, readPopulationProjection } from '../sources/ine';
import {
  annualisedGrowthRate,
  DEFAULT_G_WAGE_SWEEP,
  sensitivityGrid,
} from '../metrics/required-base-growth';
import type { BaseGrowthFigureValue } from '../metrics/required-base-growth';
import type { SourceSnapshot } from '../sources/types';
import type { FigureDefinition, FigureId } from './types';

/** Stated assumptions (10-tasks.md open questions 6 and 7). */
export const ASSUMED_INFLATION = 0.02;
export const ASSUMED_REAL_WAGE_GROWTH = 0.01;
export const PROJECTION_HORIZON = { from: 2026, to: 2070 } as const;

function payload<T>(inputs: ReadonlyMap<string, SourceSnapshot>, sourceId: string): T {
  const snapshot = inputs.get(sourceId);
  if (!snapshot?.resolved) throw new Error(`${sourceId} is not resolved`);
  return snapshot.payload as T;
}

function define(params: {
  figureId: FigureId;
  definitionId: MetricDefinitionId;
  unit: string;
  requirementSources: readonly string[];
  compute: (inputs: ReadonlyMap<string, SourceSnapshot>) => {
    value: unknown;
    assumptions: Readonly<Record<string, string | number | null>>;
  };
}): FigureDefinition {
  const published = definitionFor(params.definitionId);
  return {
    figureId: params.figureId,
    formulaId: published.formulaId,
    definitionId: params.definitionId,
    geography: published.geography,
    unit: params.unit,
    requirementSources: params.requirementSources,
    compute: params.compute,
  };
}

interface YearAmounts {
  years: Array<{ year: number; value: number }>;
}

/** Only the years both series observe: the ratio is aligned, never forward-filled. */
function alignedYears(
  beneficiaries: readonly { year: number; value: number }[],
  employed: readonly { year: number; value: number }[],
): DependencyRatioPoint[] {
  const employedByYear = new Map(employed.map((point) => [point.year, point.value]));
  const points = beneficiaries
    .filter((point) => employedByYear.has(point.year))
    .map((point) => ({
      period: String(point.year),
      numerator: point.value,
      denominator: employedByYear.get(point.year) as number,
    }));
  if (points.length === 0) {
    throw new Error('beneficiaries and employment share no observed year: no ratio can be aligned');
  }
  return points;
}

/** A resolved dimension code, or `null` when the payload did not carry that dimension. */
function codeOf(codes: Record<string, string>, dimension: string): string | null {
  return codes[dimension] ?? null;
}

function spanOf(years: readonly number[]): { first: number | null; last: number | null } {
  if (years.length === 0) return { first: null, last: null };
  return { first: Math.min(...years), last: Math.max(...years) };
}

/** What was actually counted, recorded beside the value (the resolved codes, not guesses). */
function dependencyAssumptions(
  beneficiaries: EurostatSeries,
  employment: EmploymentSeries,
  points: readonly DependencyRatioPoint[],
): Record<string, string | number | null> {
  const span = spanOf(points.map((point) => Number(point.period)));
  return {
    pensionType: codeOf(beneficiaries.codes, 'pensionType'),
    pensionMeansTesting: codeOf(beneficiaries.codes, 'meansTesting'),
    pensionUnit: codeOf(beneficiaries.codes, 'unit'),
    beneficiarySex: codeOf(beneficiaries.codes, 'sex'),
    employmentIndicator: codeOf(employment.codes, 'indicator'),
    employmentUnit: codeOf(employment.codes, 'unit'),
    employmentAge: employment.ageLabel,
    employmentAgeCode: employment.ageCode,
    firstYear: span.first,
    lastYear: span.last,
    alignment: 'years observed by both series',
  };
}

function shareAssumptions(share: EurostatSeries): Record<string, string | number | null> {
  const span = spanOf(share.points.map((point) => point.year));
  return {
    unit: 'percent of GDP, as published by the publisher',
    unitCode: codeOf(share.codes, 'unit'),
    pensionType: codeOf(share.codes, 'pensionType'),
    pensionMeansTesting: codeOf(share.codes, 'meansTesting'),
    firstYear: span.first,
    lastYear: span.last,
  };
}

/** Figure 1 — international definition: old-age beneficiaries per employed person (T3). */
function internationalDependencyFigure(): FigureDefinition {
  return define({
    figureId: 'fig-01',
    definitionId: 'dependency-ratio.international',
    unit: 'ratio',
    requirementSources: [],
    compute(inputs) {
      const beneficiaries = readOldAgeBeneficiaries(payload<unknown>(inputs, 'eurostat-spr-pns-ben'));
      const employment = readEmployedPersons(payload<unknown>(inputs, 'eurostat-lfsi-emp-a'));
      const points = alignedYears(beneficiaries.points, employment.points);
      return {
        value: dependencyRatioSeries(points),
        assumptions: dependencyAssumptions(beneficiaries, employment, points),
      };
    },
  });
}

/** Figure 2 — international definition: public pension expenditure as % of GDP (T4). */
function pensionShareFigure(): FigureDefinition {
  return define({
    figureId: 'fig-02',
    definitionId: 'pension-expenditure-gdp.international',
    unit: 'percent',
    requirementSources: [],
    compute(inputs) {
      const share = readPensionExpenditureShare(payload<unknown>(inputs, 'eurostat-spr-exp-pens'));
      return {
        value: pensionShareSeries(share.points.map((point) => ({ year: point.year, percent: point.value }))),
        assumptions: shareAssumptions(share),
      };
    },
  });
}

function cohortInput(inputs: ReadonlyMap<string, SourceSnapshot>): CohortInput {
  const amounts = payload<{ cohort: { label: string; contributionMinor: number; pensionMinor: number } }>(
    inputs,
    'ss-average-contribution-pension',
  ).cohort;
  const life = latestObservation(payload<unknown>(inputs, 'ine-life-expectancy-at-65'));
  if (!life) throw new Error('life expectancy series has no observation');
  return {
    entryAge: COHORT_ASSUMPTIONS.entryAge,
    retirementAge: COHORT_ASSUMPTIONS.retirementAge,
    lifeExpectancyAtRetirement: life.value,
    averageMonthlyContribution: amounts.contributionMinor,
    averageMonthlyPension: amounts.pensionMinor,
  };
}

/** Figure 3 — cohort return (T5). National only: no international counterpart exists. */
function cohortFigure(): FigureDefinition {
  return define({
    figureId: 'fig-03',
    definitionId: 'cohort-return.national',
    unit: 'percent',
    requirementSources: ['ss-average-contribution-pension', 'ine-life-expectancy-at-65'],
    compute(inputs) {
      const input = cohortInput(inputs);
      return {
        value: cohortReturn(input),
        assumptions: {
          entryAge: input.entryAge,
          retirementAge: input.retirementAge,
          pensionPayments: COHORT_ASSUMPTIONS.pensionPayments,
          contributionMonths: COHORT_ASSUMPTIONS.contributionMonths,
          lifeExpectancyAtRetirement: input.lifeExpectancyAtRetirement,
        },
      };
    },
  });
}

/** Figure 4 — implicit debt at four discount rates (T6). National only. */
function debtFigure(): FigureDefinition {
  return define({
    figureId: 'fig-04',
    definitionId: 'implicit-debt.national',
    unit: 'EUR',
    requirementSources: ['airef-obligations', 'fondo-de-reserva'],
    compute(inputs) {
      const obligations = payload<{ obligationsMinor: number[] }>(inputs, 'airef-obligations').obligationsMinor;
      const assets = payload<{ assetsMinor: number; asOf: string }>(inputs, 'fondo-de-reserva');
      return {
        value: implicitDebt(obligations, assets.assetsMinor),
        assumptions: { assetsAsOf: assets.asOf, discountRates: '1,2,3,4 percent' },
      };
    },
  });
}

function projectedGrowth(inputs: ReadonlyMap<string, SourceSnapshot>): number {
  const years = readPopulationProjection(payload<unknown>(inputs, 'ine-population-projection-working-age'));
  const first = years.find((entry) => entry.year === PROJECTION_HORIZON.from);
  const last = years.find((entry) => entry.year === PROJECTION_HORIZON.to);
  if (!first || !last) throw new Error('projection does not cover the stated horizon');
  return annualisedGrowthRate(first.population, last.population, last.year - first.year);
}

/**
 * The cell the grid was swept at for the published central value.
 *
 * Matched on the inputs that produced it — the nominal band centre and the assumed real wage
 * growth — because those are copied verbatim from the band and the sweep. Comparing the cell's
 * `rPaidReal` against the band's central was a defect (finding F1): the band centre is nominal
 * while every cell has been deflated, so no non-zero inflation could ever make them equal.
 * The throw stays: an unreachable central cell is still a broken invariant.
 */
function centralCellOf(
  grid: ReturnType<typeof sensitivityGrid>,
  centralNominal: number,
): ReturnType<typeof sensitivityGrid>[number] {
  const cell = grid.find(
    (entry) =>
      entry.gWage === ASSUMED_REAL_WAGE_GROWTH && entry.rPaidNominal === centralNominal,
  );
  if (!cell) throw new Error('sensitivity grid is missing the central cell');
  return cell;
}

function baseGrowthValue(
  cohort: ReturnType<typeof cohortReturn>,
  gProj: number,
): BaseGrowthFigureValue {
  if (cohort.central === null || cohort.band === null) {
    throw new Error('cohort return has no central value to carry into required growth');
  }
  const band = { min: cohort.band.min, central: cohort.central, max: cohort.band.max };
  const grid = sensitivityGrid({
    band,
    inflation: ASSUMED_INFLATION,
    gWages: DEFAULT_G_WAGE_SWEEP,
    gProj,
    horizon: { ...PROJECTION_HORIZON },
  });
  const centralCell = centralCellOf(grid, band.central);
  return {
    central: {
      rPaidReal: centralCell.rPaidReal,
      gWage: centralCell.gWage,
      gProj,
      gRequired: centralCell.gRequired,
      gap: centralCell.gap,
      horizon: { ...PROJECTION_HORIZON },
    },
    grid,
    band,
  };
}

/** Figure 5 — required base growth (T7). National only: it depends on the cohort return. */
function baseGrowthFigure(): FigureDefinition {
  return define({
    figureId: 'fig-05',
    definitionId: 'required-base-growth.national',
    unit: 'percent',
    requirementSources: [
      'ss-average-contribution-pension',
      'ine-life-expectancy-at-65',
      'ine-population-projection-working-age',
    ],
    compute(inputs) {
      const gProj = projectedGrowth(inputs);
      const value = baseGrowthValue(cohortReturn(cohortInput(inputs)), gProj);
      return {
        value,
        assumptions: {
          inflation: ASSUMED_INFLATION,
          gWage: ASSUMED_REAL_WAGE_GROWTH,
          gProj,
          horizonFrom: PROJECTION_HORIZON.from,
          horizonTo: PROJECTION_HORIZON.to,
        },
      };
    },
  });
}

interface MonthlySeries {
  months: Array<{ month: string; value: number }>;
}

/** Figure 6 — the national contributory definition of metric 1 (T3 figure 2). */
function nationalDependencyFigure(): FigureDefinition {
  return define({
    figureId: 'fig-06',
    definitionId: 'dependency-ratio.national',
    unit: 'ratio',
    requirementSources: ['ss-pensioners', 'ss-affiliates'],
    compute(inputs) {
      const pensioners = payload<MonthlySeries>(inputs, 'ss-pensioners').months;
      const affiliates = new Map(
        payload<MonthlySeries>(inputs, 'ss-affiliates').months.map((point) => [point.month, point.value]),
      );
      const points = pensioners
        .filter((point) => affiliates.has(point.month))
        .map((point) => ({
          period: point.month,
          numerator: point.value,
          denominator: affiliates.get(point.month) as number,
        }));
      if (points.length === 0) throw new Error('pensioners and affiliates share no observed month');
      return { value: dependencyRatioSeries(points), assumptions: { entry: 'monthly series' } };
    },
  });
}

/** Figure 7 — the national definition of metric 2: contributions ÷ expenditure (T4 figure 2). */
function nationalCoverFigure(): FigureDefinition {
  return define({
    figureId: 'fig-07',
    definitionId: 'contribution-cover.national',
    unit: 'ratio',
    requirementSources: ['igae-social-contributions', 'igae-pension-expenditure'],
    compute(inputs) {
      const contributions = payload<YearAmounts>(inputs, 'igae-social-contributions').years;
      const expenditure = new Map(
        payload<YearAmounts>(inputs, 'igae-pension-expenditure').years.map((entry) => [entry.year, entry.value]),
      );
      const points = contributions
        .filter((entry) => expenditure.has(entry.year))
        .map((entry) => ({
          year: entry.year,
          contributions: entry.value,
          expenditure: expenditure.get(entry.year) as number,
        }));
      if (points.length === 0) throw new Error('contributions and expenditure share no observed year');
      return { value: contributionCoverSeries(points), assumptions: { unit: 'EUR minor units' } };
    },
  });
}

export const FIGURES: readonly FigureDefinition[] = [
  internationalDependencyFigure(),
  pensionShareFigure(),
  cohortFigure(),
  debtFigure(),
  baseGrowthFigure(),
  nationalDependencyFigure(),
  nationalCoverFigure(),
];

export function figureById(figureId: string): FigureDefinition | undefined {
  return FIGURES.find((figure) => figure.figureId === figureId);
}
