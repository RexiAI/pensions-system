import { niceMax } from '../../charts/geometry';
import type { FigureNumber } from '../../content/keys';
import type { DerivedFigure } from '../../ingest/types';
import type { ContributionCoverSeriesValue } from '../../metrics/contribution-cover';
import type {
  DependencyRatioSeriesPoint,
  DependencyRatioSeriesValue,
} from '../../metrics/dependency-ratio';
import type { ContributionCoverPoint } from '../../metrics/contribution-cover';
import type { PensionShareSeriesPoint, PensionShareSeriesValue } from '../../metrics/pension-share';
import { figureState } from './figure-state';
import type { FigureState, FigureValueShape } from './figure-state';
import { cohortView, debtView, growthView } from './range-views';
import type { NullReasonKey, PlateView, ViewInput } from './view-support';
import {
  emptyView,
  head,
  integerFormat,
  moneyFormat,
  percentPointsFormat,
  ratioFormat,
  shapeOf,
  summaryOf,
} from './view-support';

export type { ChartSpec, NullReasonKey, PlateView, ViewInput } from './view-support';

const NULL_REASONS: Readonly<Record<string, NullReasonKey>> = {
  'fig-02': 'plate.null.contributionCover',
  'fig-03': 'plate.null.cohortIrr',
  'fig-04': 'plate.null.implicitDebt',
  'fig-05': 'plate.null.requiredBaseGrowth',
  'fig-07': 'plate.null.contributionCover',
};

export function nullReason(figureId: string): NullReasonKey {
  return NULL_REASONS[figureId] ?? 'plate.null.dependencyRatio';
}

/**
 * Accessors for the nullable head of a series. Keeping them here means a view body reads as a
 * list of values instead of a chain of optional lookups, and the null contract lives in one
 * place per metric.
 */
function ratioAt(point: DependencyRatioSeriesPoint | null): number | null {
  return point === null ? null : point.ratio;
}

function rawRatioAt(point: DependencyRatioSeriesPoint | null): number {
  return point === null ? 0 : point.raw ?? 0;
}

function shareAt(point: PensionShareSeriesPoint | null): number | null {
  return point === null ? null : point.share;
}

function coverAt(point: ContributionCoverPoint | null): number | null {
  return point === null ? null : point.cover;
}

function coverGapAt(point: ContributionCoverPoint | null): number | null {
  return point === null ? null : point.gap;
}

function coverRawAt(point: ContributionCoverPoint | null): number {
  return point === null ? 0 : point.raw ?? 0;
}

/** Every plotted point undefined: there is no figure to draw, so it is not a null value. */
function allNull(points: ReadonlyArray<{ value: number | null }>): boolean {
  return points.length > 0 && points.every((point) => point.value === null);
}

function dependencyShape(value: DependencyRatioSeriesValue | null): FigureValueShape {
  if (value === null) return shapeOf(false);
  const points = value.points.map((point) => ({ value: point.ratio }));
  return shapeOf(value.latest !== null && value.latest.ratio === null, allNull(points));
}

interface DependencyColumns {
  period: string;
  numerator: string;
  denominator: string;
}

function dependencyView(input: ViewInput, number: FigureNumber, columns: DependencyColumns): PlateView {
  const value = input.figure.value as DependencyRatioSeriesValue | null;
  const state = figureState(input.figure, dependencyShape(value));
  const headValue = head(input, number, state);
  if (value === null) return emptyView(headValue, input.content);
  const format = ratioFormat(input.content);
  const integers = integerFormat(input.content);
  return {
    ...headValue,
    summary: summaryOf(input.content, value.points.length),
    readout: [
      { label: input.content.t('readout.latest'), value: format(ratioAt(value.latest)) },
      { label: input.content.t('readout.mean10'), value: format(value.meanLastTenYears) },
      { label: input.content.t('readout.first'), value: format(ratioAt(value.first)) },
    ],
    chart: {
      kind: 'line',
      points: value.points.map((point) => ({ label: point.period, value: point.ratio })),
      min: 0,
      max: niceMax(rawRatioAt(value.latest) * 1.15, 0.1),
      format,
    },
    format,
    columns: [columns.period, columns.numerator, columns.denominator, input.content.t('table.ratio')],
    rows: value.points.map((point) => [
      point.period,
      integers(point.numerator),
      integers(point.denominator),
      format(point.ratio),
    ]),
    assumptionLine: null,
  };
}

/** Figure 1 — old-age beneficiaries per employed person, per year. */
function internationalDependencyView(input: ViewInput): PlateView {
  return dependencyView(input, 1, {
    period: input.content.t('table.year'),
    numerator: input.content.t('table.beneficiaries'),
    denominator: input.content.t('table.employed'),
  });
}

/** Figure 6 — contributory pensioners per affiliate, per month. */
function nationalDependencyView(input: ViewInput): PlateView {
  return dependencyView(input, 6, {
    period: input.content.t('table.month'),
    numerator: input.content.t('table.pensioners'),
    denominator: input.content.t('table.affiliates'),
  });
}

function shareShape(value: PensionShareSeriesValue | null): FigureValueShape {
  if (value === null) return shapeOf(false);
  const points = value.points.map((point) => ({ value: point.share }));
  return shapeOf(value.latest !== null && value.latest.share === null, allNull(points));
}

/** Figure 2 — public pension expenditure as % of GDP, per year. */
function pensionShareView(input: ViewInput): PlateView {
  const value = input.figure.value as PensionShareSeriesValue | null;
  const state = figureState(input.figure, shareShape(value));
  const headValue = head(input, 2, state);
  if (value === null) return emptyView(headValue, input.content);
  // Points, not a fraction: the publisher's `% of GDP` series is already the percentage
  // (AC-001-86), so the readout, the table and the axis ticks all render it unscaled.
  const format = percentPointsFormat(input.content);
  return {
    ...headValue,
    summary: summaryOf(input.content, value.points.length),
    readout: [
      { label: input.content.t('readout.latest'), value: format(shareAt(value.latest)) },
      { label: input.content.t('readout.first'), value: format(shareAt(value.first)) },
      { label: input.content.t('readout.max'), value: format(value.max) },
    ],
    chart: {
      kind: 'line',
      points: value.points.map((point) => ({ label: String(point.year), value: point.share })),
      min: 0,
      max: niceMax((value.max ?? 0) * 1.15, 1),
      format,
    },
    format,
    columns: [input.content.t('table.year'), input.content.t('table.share')],
    rows: value.points.map((point) => [String(point.year), format(point.share)]),
    assumptionLine: null,
  };
}

function coverShape(value: ContributionCoverSeriesValue | null): FigureValueShape {
  if (value === null) return shapeOf(false);
  const points = value.points.map((point) => ({ value: point.cover }));
  return shapeOf(value.latest !== null && value.latest.cover === null, allNull(points));
}

/** Figure 7 — social contributions divided by contributory pension expenditure, per year. */
function coverView(input: ViewInput): PlateView {
  const value = input.figure.value as ContributionCoverSeriesValue | null;
  const state = figureState(input.figure, coverShape(value));
  const headValue = head(input, 7, state);
  if (value === null) return emptyView(headValue, input.content);
  const format = ratioFormat(input.content);
  const money = moneyFormat(input.content);
  const integers = integerFormat(input.content);
  return {
    ...headValue,
    summary: summaryOf(input.content, value.points.length),
    readout: [
      { label: input.content.t('readout.latest'), value: format(coverAt(value.latest)) },
      { label: input.content.t('readout.gap'), value: money(coverGapAt(value.latest)) },
      { label: input.content.t('readout.yearsBelow'), value: integers(value.yearsBelowBreakEven) },
    ],
    chart: {
      kind: 'line',
      points: value.points.map((point) => ({ label: String(point.year), value: point.cover })),
      min: 0,
      max: Math.max(1.4, coverRawAt(value.latest) * 1.1),
      reference: { value: 1, label: `${input.content.t('table.cover')} ${format(1)}` },
      format,
    },
    format,
    columns: [
      input.content.t('table.year'),
      input.content.t('table.contributions'),
      input.content.t('table.expenditure'),
      input.content.t('table.cover'),
      input.content.t('table.gap'),
    ],
    rows: value.points.map((point) => [
      String(point.year),
      money(point.contributions),
      money(point.expenditure),
      format(point.cover),
      money(point.gap),
    ]),
    assumptionLine: null,
  };
}

/** figureId -> figure number, so a page can ask a plate for its state without rendering it. */
export function figureNumberOf(figure: DerivedFigure): FigureNumber {
  return Number(figure.figureId.slice(-1)) as FigureNumber;
}

/** The published state of one figure, computed by the same builder its plate uses. */
export function viewStateFor(input: ViewInput): FigureState {
  return VIEW_BUILDERS[figureNumberOf(input.figure)](input).state;
}

export const VIEW_BUILDERS: Record<FigureNumber, (input: ViewInput) => PlateView> = {
  1: internationalDependencyView,
  2: pensionShareView,
  3: cohortView,
  4: debtView,
  5: growthView,
  6: nationalDependencyView,
  7: coverView,
};
