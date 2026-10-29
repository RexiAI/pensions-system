import { DISCOUNT_RATES } from '../../metrics/implicit-debt';
import type { ImplicitDebtValue } from '../../metrics/implicit-debt';
import { formatValue } from '../../content/format';
import type { CountryLocaleContent } from '../../content/types';
import type { CohortReturnValue } from '../../metrics/cohort-irr';
import type { BaseGrowthFigureValue } from '../../metrics/required-base-growth';
import { figureState } from './figure-state';
import type { FigureValueShape } from './figure-state';
import type { NullableFormat } from './view-support';
import {
  emptyView,
  head,
  moneyFormat,
  percentFormat,
  shapeOf,
  summaryOf,
} from './view-support';
import type { ChartSpec, PlateView, ViewInput } from './view-support';

function cohortShape(value: CohortReturnValue | null): FigureValueShape {
  return shapeOf(value !== null && value.central === null);
}

function cohortRow(input: ViewInput, value: CohortReturnValue, format: NullableFormat): Array<string | null> {
  return [
    input.content.t('table.cohort'),
    moneyFormat(input.content)(value.annualContribution),
    moneyFormat(input.content)(value.annualPension),
    formatValue(value.lifeExpectancyAtRetirement, 'years', input.content.locale, ''),
    formatValue(value.yearsContributing, 'integer', input.content.locale, ''),
    formatValue(value.yearsDrawing, 'integer', input.content.locale, ''),
    format(bandEdge(value, 'min')),
    format(value.central),
    format(bandEdge(value, 'max')),
  ];
}

function bandEdge(value: CohortReturnValue, edge: 'min' | 'max'): number | null {
  return value.band === null ? null : value.band[edge];
}

function cohortReadout(input: ViewInput, value: CohortReturnValue, format: NullableFormat) {
  return [
    { label: input.content.t('readout.central'), value: format(value.central) },
    { label: input.content.t('readout.min'), value: format(bandEdge(value, 'min')) },
    { label: input.content.t('readout.max'), value: format(bandEdge(value, 'max')) },
  ];
}

function cohortChart(input: ViewInput, value: CohortReturnValue): ChartSpec | null {
  const band = value.band;
  if (!band) return null;
  return {
    kind: 'range',
    rows: [
      { label: input.content.t('table.cohort'), min: band.min, max: band.max, central: value.central ?? 0 },
    ],
  };
}

export function cohortView(input: ViewInput): PlateView {
  const value = input.figure.value as CohortReturnValue | null;
  const state = figureState(input.figure, cohortShape(value));
  const headValue = head(input, 3, state);
  if (value === null) return emptyView(headValue, input.content);
  const format = percentFormat(input.content);
  return {
    ...headValue,
    summary: summaryOf(input.content, 1),
    readout: cohortReadout(input, value, format),
    chart: cohortChart(input, value),
    format,
    columns: [
      input.content.t('table.cohort'),
      input.content.t('table.contribution'),
      input.content.t('table.pension'),
      input.content.t('table.lifeExpectancy'),
      input.content.t('table.yearsContributing'),
      input.content.t('table.yearsDrawing'),
      input.content.t('table.min'),
      input.content.t('table.central'),
      input.content.t('table.max'),
    ],
    rows: [cohortRow(input, value, format)],
    assumptionLine: null,
  };
}

function rateLabel(content: CountryLocaleContent, rate: number): string {
  return formatValue(rate, 'percent', content.locale, '');
}

function debtRows(
  content: CountryLocaleContent,
  value: ImplicitDebtValue,
  rates: readonly number[],
  money: NullableFormat,
): Array<Array<string | null>> {
  return rates.map((rate) => [
    rateLabel(content, rate),
    money(value.presentValues[String(rate)]),
    money(value.assets),
    money(value.byRate[String(rate)]),
  ]);
}

export function debtView(input: ViewInput): PlateView {
  const value = input.figure.value as ImplicitDebtValue | null;
  const state = figureState(input.figure, shapeOf(false));
  const headValue = head(input, 4, state);
  if (value === null) return emptyView(headValue, input.content);
  const money = moneyFormat(input.content);
  const rates = value.rates.length > 0 ? value.rates : DISCOUNT_RATES;
  return {
    ...headValue,
    summary: summaryOf(input.content, rates.length),
    readout: rates.map((rate) => ({ label: rateLabel(input.content, rate), value: money(value.byRate[String(rate)]) })),
    chart: {
      kind: 'bars',
      rows: rates.map((rate) => ({ label: rateLabel(input.content, rate), value: value.byRate[String(rate)] ?? 0 })),
    },
    format: money,
    columns: [
      input.content.t('table.rate'),
      input.content.t('table.pv'),
      input.content.t('table.assets'),
      input.content.t('table.implicitDebt'),
    ],
    rows: debtRows(input.content, value, rates, money),
    assumptionLine: null,
  };
}

function growthRows(
  content: CountryLocaleContent,
  value: BaseGrowthFigureValue,
  format: NullableFormat,
): Array<Array<string | null>> {
  const wages = [...new Set(value.grid.map((cell) => cell.gWage))].sort((a, b) => a - b);
  return wages.map((wage) => {
    const cells = value.grid
      .filter((cell) => cell.gWage === wage)
      .sort((a, b) => a.rPaidReal - b.rPaidReal);
    return [format(wage), ...cells.map((cell) => format(cell.gap))];
  });
}

function growthAssumptions(input: ViewInput, value: BaseGrowthFigureValue, format: NullableFormat): string {
  const central = value.central;
  return [
    `${input.content.t('assumptions.gWage.label')} ${format(central.gWage)}`,
    `${input.content.t('assumptions.inflation.label')} ${format(central.rPaidReal)}`,
    `${input.content.t('readout.gProj')} ${format(central.gProj)}`,
    `${input.content.t('assumptions.horizon.label')} ${central.horizon.from} - ${central.horizon.to}`,
  ].join(' · ');
}

export function growthView(input: ViewInput): PlateView {
  const value = input.figure.value as BaseGrowthFigureValue | null;
  const state = figureState(input.figure, shapeOf(false));
  const headValue = head(input, 5, state);
  if (value === null) return emptyView(headValue, input.content);
  const format = percentFormat(input.content);
  const required = value.grid.map((cell) => cell.gRequired);
  return {
    ...headValue,
    summary: summaryOf(input.content, value.grid.length),
    readout: [
      { label: input.content.t('readout.gRequired'), value: format(value.central.gRequired) },
      { label: input.content.t('readout.gProj'), value: format(value.central.gProj) },
      { label: input.content.t('readout.difference'), value: format(value.central.gap) },
    ],
    chart: {
      kind: 'range',
      rows: [
        {
          label: input.content.t('readout.gRequired'),
          min: Math.min(...required),
          max: Math.max(...required),
          central: value.central.gRequired,
        },
      ],
    },
    format,
    columns: [
      input.content.t('table.gWage'),
      input.content.t('table.min'),
      input.content.t('table.central'),
      input.content.t('table.max'),
    ],
    rows: growthRows(input.content, value, format),
    assumptionLine: growthAssumptions(input, value, format),
  };
}
