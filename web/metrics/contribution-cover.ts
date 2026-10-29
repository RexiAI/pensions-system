import { roundTo } from './rounding';

/**
 * Metric 2 (T4): social contributions divided by contributory pension expenditure.
 * `cover < 1` is a gap funded from taxation or debt; the gap itself is
 * `expenditure - contributions`, so a below-1 cover always pairs with a positive gap.
 */
export type CoverStatus = 'gap' | 'break-even' | 'surplus' | 'undefined';

export interface ContributionCoverValue {
  cover: number | null;
  raw: number | null;
  gap: number | null;
  status: CoverStatus;
}

export interface ContributionCoverPoint extends ContributionCoverValue {
  year: number;
  contributions: number;
  expenditure: number;
}

function statusFor(raw: number): CoverStatus {
  if (raw < 1) return 'gap';
  if (raw > 1) return 'surplus';
  return 'break-even';
}

export function contributionCover(contributions: number, expenditure: number): ContributionCoverValue {
  if (expenditure === 0) {
    return { cover: null, raw: null, gap: null, status: 'undefined' };
  }
  const raw = contributions / expenditure;
  return {
    cover: roundTo(raw, 2),
    raw,
    gap: expenditure - contributions,
    status: statusFor(raw),
  };
}

export interface ContributionCoverSeriesValue {
  points: ContributionCoverPoint[];
  latest: ContributionCoverPoint | null;
  yearsBelowBreakEven: number;
}

export function contributionCoverSeries(
  points: readonly { year: number; contributions: number; expenditure: number }[],
): ContributionCoverSeriesValue {
  const series = [...points]
    .sort((a, b) => a.year - b.year)
    .map((point) => ({ year: point.year, contributions: point.contributions, expenditure: point.expenditure, ...contributionCover(point.contributions, point.expenditure) }));
  return {
    points: series,
    latest: series.at(-1) ?? null,
    yearsBelowBreakEven: series.filter((p) => p.status === 'gap').length,
  };
}
