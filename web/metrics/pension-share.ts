import { roundTo } from './rounding';

/**
 * Metric 2, international definition (T4 figure 1): public pension expenditure as a share
 * of GDP, in percent.
 *
 * The publisher already publishes this share as the `% of GDP` unit of `spr_exp_pens`, and
 * that is the series the figure ingests — no GDP level series is fetched, so no unit
 * conversion is invented here. `shareOfGdp` is the executable form of the same formula
 * (`expenditure / GDP × 100`), used to assert the definition and to serve a source that
 * supplies levels rather than a share.
 */
export interface PensionShareValue {
  year: number;
  share: number | null;
  raw: number | null;
}

export function shareOfGdp(expenditure: number, gdp: number): number | null {
  if (gdp === 0) return null;
  return roundTo((expenditure / gdp) * 100, 2);
}

/**
 * Percentages are already the published unit. Two decimals is the reporting precision the
 * task fixes; a malformed observation (not finite, negative) is `null`, never clamped.
 */
export function publishedShare(percent: number): PensionShareValue['share'] {
  if (!Number.isFinite(percent) || percent < 0) return null;
  return roundTo(percent, 2);
}

export interface PensionShareSeriesPoint extends PensionShareValue {
  share: number | null;
  raw: number | null;
}

export interface PensionShareSeriesValue {
  points: PensionShareSeriesPoint[];
  latest: PensionShareSeriesPoint | null;
  first: PensionShareSeriesPoint | null;
  max: number | null;
}

export function pensionShareSeries(
  points: readonly { year: number; percent: number }[],
): PensionShareSeriesValue {
  const series = [...points]
    .sort((a, b) => a.year - b.year)
    .map((point) => ({
      year: point.year,
      share: publishedShare(point.percent),
      raw: Number.isFinite(point.percent) ? point.percent : null,
    }));
  const values = series.map((point) => point.raw).filter((value): value is number => value !== null);
  return {
    points: series,
    latest: series.at(-1) ?? null,
    first: series[0] ?? null,
    max: values.length > 0 ? Math.max(...values) : null,
  };
}
