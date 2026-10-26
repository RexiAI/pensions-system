import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FIGURE_IDS } from '../../web/ingest/types';
import type { DerivedFigure, FigureAvailability, FigureId } from '../../web/ingest/types';
import type { Manifest } from '../../web/manifest/types';
import type { DefinitionId } from '../../web/manifest/definitions';
import { definitionFor } from '../../web/manifest/definitions';
import type { FormulaId } from '../../web/manifest/formula-ids';
import type { CountryLocaleContent } from '../../web/content/types';
import { contentRegistry } from '../../web/content/registry';
import type { DependencyRatioSeriesValue } from '../../web/metrics/dependency-ratio';
import type { ContributionCoverSeriesValue } from '../../web/metrics/contribution-cover';
import type { CohortReturnValue } from '../../web/metrics/cohort-irr';
import type { ImplicitDebtValue } from '../../web/metrics/implicit-debt';
import type { BaseGrowthFigureValue } from '../../web/metrics/required-base-growth';
import type { PensionShareSeriesValue } from '../../web/metrics/pension-share';
import { implicitDebt } from '../../web/metrics/implicit-debt';
import { dependencyRatio } from '../../web/metrics/dependency-ratio';
import { contributionCoverSeries } from '../../web/metrics/contribution-cover';
import { cohortReturn } from '../../web/metrics/cohort-irr';
import { sensitivityGrid } from '../../web/metrics/required-base-growth';
import { pensionShareSeries } from '../../web/metrics/pension-share';
import { buildManifest } from '../../web/manifest/validate';
import { MetricPlate } from '../../web/components/metrics/MetricPlate';
import { figureNumberOf } from '../../web/components/metrics/views';

export function renderComponent<P extends object>(
  component: (props: P) => ReactNode,
  props: P,
): string {
  return renderToStaticMarkup(createElement(component, props));
}

export function content(locale = 'es', country = 'ES'): CountryLocaleContent {
  const result = contentRegistry.get(country, locale);
  if (!result.ok) throw new Error(`content unavailable: ${result.error.code}`);
  return result.content;
}

/** The definition each figure publishes, so a fixture never invents one. */
export const FIGURE_DEFINITIONS: Readonly<Record<FigureId, DefinitionId>> = {
  'fig-01': 'dependency-ratio.international',
  'fig-02': 'pension-expenditure-gdp.international',
  'fig-03': 'cohort-return.national',
  'fig-04': 'implicit-debt.national',
  'fig-05': 'required-base-growth.national',
  'fig-06': 'dependency-ratio.national',
  'fig-07': 'contribution-cover.national',
};

const DEFAULT_SOURCE = 'https://servicios.ine.es/wstempus/js/ES/DATOS_SERIE/TM1657?nult=5';

export interface FigureParams<V> {
  figureId: FigureId;
  formulaId?: FormulaId;
  definitionId?: DefinitionId;
  unit: string;
  value: V | null;
  availability?: FigureAvailability;
  unresolvedSources?: string[];
  unresolvedReason?: string;
  sourceUrl?: string[];
  manifest?: Manifest;
}

function manifestFor<V>(params: FigureParams<V>, formulaId: FormulaId, definitionId: DefinitionId): Manifest {
  if (params.manifest) return params.manifest;
  return buildManifest({
    sourceUrl: params.sourceUrl ?? [DEFAULT_SOURCE],
    fetchedAt: new Date('2026-10-25T09:00:00Z'),
    formulaId,
    definitionId,
    inputBytes: `fixture-bytes-${params.figureId}`,
    reproducePath: 'scripts/compute.ts',
  });
}

export function makeFigure<V>(params: FigureParams<V>): DerivedFigure {
  const definitionId = params.definitionId ?? FIGURE_DEFINITIONS[params.figureId];
  const formulaId = params.formulaId ?? definitionFor(definitionId).formulaId;
  const figure: DerivedFigure = {
    figureId: params.figureId,
    formulaId,
    availability: params.availability ?? 'computed',
    definitionId,
    definition: definitionFor(definitionId).definition,
    unit: params.unit,
    value: params.value,
    assumptions: {},
    manifest: manifestFor(params, formulaId, definitionId),
    unresolvedSources: params.unresolvedSources ?? [],
  };
  if (params.unresolvedReason) figure.unresolvedReason = params.unresolvedReason;
  return figure;
}

/** The international dependency series: old-age beneficiaries ÷ employed persons, per year. */
export function dependencyValue(): DependencyRatioSeriesValue {
  const points = [
    { period: '2009', ...dependencyRatio(5_000_000, 19_000_000) },
    { period: '2016', ...dependencyRatio(6_200_000, 18_000_000) },
    { period: '2024', ...dependencyRatio(7_059_353, 21_300_000) },
  ];
  return {
    points,
    latest: points[2] as DependencyRatioSeriesValue['latest'],
    first: points[0] as DependencyRatioSeriesValue['first'],
    meanLastTenYears: 0.33,
  };
}

export function dependencyFigure(): DerivedFigure {
  return makeFigure({ figureId: 'fig-01', unit: 'ratio', value: dependencyValue() });
}

/** The national dependency definition: published as `unavailable` in v1. */
export function nationalDependencyFigure(): DerivedFigure {
  return makeFigure({
    figureId: 'fig-06',
    unit: 'ratio',
    value: null,
    availability: 'unavailable',
    unresolvedSources: ['ss-pensioners', 'ss-affiliates'],
    unresolvedReason: 'ss-pensioners: series not yet specified',
  });
}

export function shareValue(): PensionShareSeriesValue {
  return pensionShareSeries([
    { year: 1995, percent: 9.82 },
    { year: 2010, percent: 10.5 },
    { year: 2024, percent: 13.23 },
  ]);
}

export function shareFigure(): DerivedFigure {
  return makeFigure({ figureId: 'fig-02', unit: 'percent', value: shareValue() });
}

export function coverValue(): ContributionCoverSeriesValue {
  return contributionCoverSeries([
    { year: 2020, contributions: 120_000_000_00, expenditure: 150_000_000_00 },
    { year: 2022, contributions: 140_000_000_00, expenditure: 160_000_000_00 },
  ]);
}

/** The national cover definition, rendered as a computed fixture to exercise the plate. */
export function coverFigure(): DerivedFigure {
  return makeFigure({ figureId: 'fig-07', unit: 'ratio', value: coverValue() });
}

/** The national cover definition as published in v1: `unavailable`, no value. */
export function nationalCoverFigure(): DerivedFigure {
  return makeFigure({
    figureId: 'fig-07',
    unit: 'ratio',
    value: null,
    availability: 'unavailable',
    unresolvedSources: ['igae-social-contributions', 'igae-pension-expenditure'],
    unresolvedReason: 'igae-social-contributions: series not yet specified',
  });
}

export function cohortValue(): CohortReturnValue {
  return cohortReturn({
    entryAge: 25,
    retirementAge: 65,
    lifeExpectancyAtRetirement: 20,
    averageMonthlyContribution: 100_00,
    averageMonthlyPension: 200_00,
  });
}

export function cohortFigure(): DerivedFigure {
  return makeFigure({ figureId: 'fig-03', unit: 'percent', value: cohortValue() });
}

export function debtValue(): ImplicitDebtValue {
  return implicitDebt([100_000_00, 110_000_00, 120_000_00], 500_000_00);
}

export function debtFigure(): DerivedFigure {
  return makeFigure({ figureId: 'fig-04', unit: 'EUR', value: debtValue() });
}

type GridCell = ReturnType<typeof sensitivityGrid>[number];

function centralCellOf(grid: ReturnType<typeof sensitivityGrid>, centralRPaid: number): GridCell | undefined {
  return grid.find((cell) => cell.gWage === 0.01 && cell.rPaidReal === centralRPaid);
}

function pick(cell: GridCell | undefined, key: 'rPaidReal' | 'gRequired' | 'gap', fallback: number): number {
  if (!cell) return fallback;
  return cell[key];
}

export function baseGrowthValue(): BaseGrowthFigureValue {
  const band = { min: 0.01, central: 0.03, max: 0.05 };
  const grid = sensitivityGrid({ band, inflation: 0.02, gProj: -0.002, horizon: { from: 2026, to: 2070 } });
  const cell = centralCellOf(grid, band.central);
  return {
    central: {
      rPaidReal: pick(cell, 'rPaidReal', band.central),
      gWage: 0.01,
      gProj: -0.002,
      gRequired: pick(cell, 'gRequired', 0.02),
      gap: pick(cell, 'gap', 0.022),
      horizon: { from: 2026, to: 2070 },
    },
    grid,
    band,
  };
}

export function baseGrowthFigure(): DerivedFigure {
  return makeFigure({ figureId: 'fig-05', unit: 'percent', value: baseGrowthValue() });
}

/** The same figure, published as `unavailable`: the state a never-computed figure has. */
export function unavailable(figure: DerivedFigure): DerivedFigure {
  return makeFigure({
    figureId: figure.figureId,
    definitionId: figure.definitionId,
    unit: figure.unit,
    value: null,
    availability: 'unavailable',
    unresolvedSources: ['ss-pensioners'],
    unresolvedReason: 'ss-pensioners: series not yet specified',
  });
}

/** Every published figure in its unresolved form: nothing computed in this deployment. */
export function unresolvedFigures(): DerivedFigure[] {
  return FIGURE_IDS.map((figureId) =>
    makeFigure({
      figureId,
      unit: 'ratio',
      value: null,
      availability: 'unavailable',
      unresolvedSources: ['ss-pensioners'],
      unresolvedReason: 'ss-pensioners: series not yet specified',
    }),
  );
}

/** Computed fixtures, one per plate grammar the page can render. */
export const PLATE_FIXTURES = [
  dependencyFigure,
  shareFigure,
  cohortFigure,
  debtFigure,
  baseGrowthFigure,
  coverFigure,
] as const;

/** Renders the production plate component, so a test exercises what the page renders. */
export function renderPlate(figure: DerivedFigure, locale = 'es'): string {
  return renderComponent(MetricPlate, {
    figureNumber: figureNumberOf(figure),
    figure,
    content: content(locale),
    freshnessWindowDays: 45,
  });
}
