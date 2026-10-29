import { roundTo } from './rounding';

/**
 * Metric 1 (T3): a ratio of beneficiaries to the people who pay for them. The same kernel
 * serves both published definitions and the two are never merged:
 *
 * - international: old-age pension beneficiaries ÷ employed persons aged 15 to 64, per year;
 * - national: contributory pensioners ÷ contributing affiliates, per month.
 *
 * `raw` is unrounded and exists only so monotonicity can be asserted on the true value;
 * the published `ratio` is rounded to the two decimals the task fixes. Undefined cases
 * (denominator 0) return `null`, never Infinity or NaN.
 */
export interface DependencyRatioValue {
  ratio: number | null;
  raw: number | null;
  numerator: number;
  denominator: number;
}

export interface DependencyRatioPoint {
  /** The observation period: a `YYYY` year for the international definition, `YYYY-MM` monthly for the national one. */
  period: string;
  numerator: number;
  denominator: number;
}

export interface DependencyRatioSeriesPoint extends DependencyRatioValue {
  period: string;
}

export interface DependencyRatioSeriesValue {
  points: DependencyRatioSeriesPoint[];
  latest: DependencyRatioSeriesPoint | null;
  first: DependencyRatioSeriesPoint | null;
  meanLastTenYears: number | null;
}

export function dependencyRatio(pensioners: number, affiliates: number): DependencyRatioValue {
  if (affiliates === 0) {
    return { ratio: null, raw: null, numerator: pensioners, denominator: affiliates };
  }
  const raw = pensioners / affiliates;
  return { ratio: roundTo(raw, 2), raw, numerator: pensioners, denominator: affiliates };
}

function meanOf(points: DependencyRatioSeriesPoint[]): number | null {
  const values = points.map((p) => p.raw).filter((v): v is number => v !== null);
  if (values.length === 0) return null;
  return roundTo(values.reduce((sum, v) => sum + v, 0) / values.length, 2);
}

/** Series sorted by period; the last ten calendar years of periods feed the readout mean. */
export function dependencyRatioSeries(points: readonly DependencyRatioPoint[]): DependencyRatioSeriesValue {
  const sorted = [...points].sort((a, b) => a.period.localeCompare(b.period));
  const series = sorted.map((point) => ({
    period: point.period,
    ...dependencyRatio(point.numerator, point.denominator),
  }));
  const latest = series.at(-1) ?? null;
  const latestYear = latest ? Number(latest.period.slice(0, 4)) : 0;
  const window = series.filter((p) => Number(p.period.slice(0, 4)) > latestYear - 10);
  return {
    points: series,
    latest,
    first: series[0] ?? null,
    meanLastTenYears: meanOf(window),
  };
}
