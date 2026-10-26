import type { ChartPoint, LadderRow, BarRow } from '../../charts/geometry';
import { FIGURE_KEYS } from '../../content/keys';
import type { FigureNumber } from '../../content/keys';
import { formatCount, formatValue } from '../../content/format';
import type { CountryLocaleContent } from '../../content/types';
import type { DerivedFigure } from '../../ingest/types';
import type { FigureState, FigureValueShape } from './figure-state';
import { sourceSummary } from './plate-support';

/** The chart shapes the plate knows how to draw. A view never composes SVG itself. */
export type ChartSpec =
  | {
      kind: 'line';
      points: ChartPoint[];
      min: number;
      max: number;
      reference?: { value: number; label: string };
      format: (value: number) => string;
    }
  | { kind: 'range'; rows: LadderRow[] }
  | { kind: 'bars'; rows: BarRow[] };

export type NullReasonKey =
  | 'plate.null.dependencyRatio'
  | 'plate.null.contributionCover'
  | 'plate.null.cohortIrr'
  | 'plate.null.implicitDebt'
  | 'plate.null.requiredBaseGrowth';

export interface ViewInput {
  content: CountryLocaleContent;
  figure: DerivedFigure;
}

export type NullableFormat = (value: number | null) => string;

/** The identity and caption every plate carries, chart-shaped body or not. */
export interface Head {
  figureNumber: FigureNumber;
  state: FigureState;
  title: string;
  readoutId: string;
  caption: string;
}

export interface PlateView extends Head {
  readout: Array<{ label: string; value: string }>;
  chart: ChartSpec | null;
  format: (value: number | null) => string;
  columns: string[];
  rows: Array<Array<string | null>>;
  summary: string;
  assumptionLine: string | null;
}

function titleOf(content: CountryLocaleContent, number: FigureNumber): string {
  return content.t(FIGURE_KEYS[number].title);
}

function captionOf(input: ViewInput, number: FigureNumber): string {
  return input.content.t('fig.tableCaption', {
    title: titleOf(input.content, number),
    unit: input.content.t(FIGURE_KEYS[number].unit),
    source: sourceSummary(input.figure),
    scope: input.content.country.name,
  });
}

export function summaryOf(content: CountryLocaleContent, count: number): string {
  return content.t('fig.tableSummary', { count: formatCount(count, content.locale) });
}

export function head(input: ViewInput, number: FigureNumber, state: FigureState): Head {
  return {
    figureNumber: number,
    state,
    title: titleOf(input.content, number),
    readoutId: `fig-0${number}-readout`,
    caption: captionOf(input, number),
  };
}

export function ratioFormat(content: CountryLocaleContent): NullableFormat {
  return (value) => formatValue(value, 'ratio', content.locale, content.t('table.notDefined'));
}

export function moneyFormat(content: CountryLocaleContent): NullableFormat {
  return (value) => formatValue(value, 'currencyMinor', content.locale, content.t('table.notDefined'));
}

export function percentFormat(content: CountryLocaleContent): NullableFormat {
  return (value) => formatValue(value, 'percent', content.locale, content.t('table.notDefined'));
}

/**
 * Percentage **points** — the unit the `% of GDP` series is published in (`13.23` is `13,23 %`).
 * Separate from `percentFormat` on purpose: the formatter must never scale a published share.
 */
export function percentPointsFormat(content: CountryLocaleContent): NullableFormat {
  return (value) => formatValue(value, 'percentPoints', content.locale, content.t('table.notDefined'));
}

export function integerFormat(content: CountryLocaleContent): NullableFormat {
  return (value) => formatValue(value, 'integer', content.locale, content.t('table.notDefined'));
}

export function shapeOf(headlineIsNull: boolean, allPointsNull = false): FigureValueShape {
  return { headlineIsNull, allPointsNull };
}

/** A view with no body: only reachable for a fixture that claims a value it does not carry. */
export function emptyView(headValue: Head, content: CountryLocaleContent): PlateView {
  return {
    ...headValue,
    readout: [],
    chart: null,
    format: ratioFormat(content),
    columns: [],
    rows: [],
    summary: summaryOf(content, 0),
    assumptionLine: null,
  };
}
